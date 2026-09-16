import os
import pickle
from pathlib import Path

import numpy as np
import pandas as pd

from dotenv import load_dotenv
from sqlalchemy import create_engine, text


# ============================================================
# CONFIGURATION
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

load_dotenv(BASE_DIR / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL not found in server/.env"
    )


SCHEMA_NAME = "public"

SOURCE_TABLE = "fire_detections"

PREDICTION_TABLE = "predictions"


MODEL_DIR = BASE_DIR.parent / "models"


XGB_MODEL_PATH = (
    MODEL_DIR / "xgboost_model.pkl"
)

LGBM_MODEL_PATH = (
    MODEL_DIR / "lightgbm_model.pkl"
)

RF_MODEL_PATH = (
    MODEL_DIR / "random_forest_model.pkl"
)

FEATURE_COLUMNS_PATH = (
    MODEL_DIR / "feature_columns.pkl"
)


XGB_WEIGHT = 0.40
LGBM_WEIGHT = 0.40
RF_WEIGHT = 0.20

THRESHOLD = 0.50


# ============================================================
# DATABASE
# ============================================================

if DATABASE_URL.startswith("postgresql://"):

    DATABASE_URL = DATABASE_URL.replace(
        "postgresql://",
        "postgresql+pg8000://",
        1
    )

elif DATABASE_URL.startswith("postgres://"):

    DATABASE_URL = DATABASE_URL.replace(
        "postgres://",
        "postgresql+pg8000://",
        1
    )


engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
)


# ============================================================
# LOAD MODELS
# ============================================================

print("=" * 70)
print("🔥 THERMAL-X FIRE PREDICTION ENGINE")
print("=" * 70)

print()
print("Loading trained models...")


with open(
    XGB_MODEL_PATH,
    "rb"
) as file:

    xgb_model = pickle.load(file)


with open(
    LGBM_MODEL_PATH,
    "rb"
) as file:

    lgbm_model = pickle.load(file)


with open(
    RF_MODEL_PATH,
    "rb"
) as file:

    rf_model = pickle.load(file)


with open(
    FEATURE_COLUMNS_PATH,
    "rb"
) as file:

    feature_columns = pickle.load(file)


print("✅ XGBoost loaded")
print("✅ LightGBM loaded")
print("✅ Random Forest loaded")

print()
print("Features:")

for feature in feature_columns:

    print(f"  - {feature}")


# ============================================================
# LOAD FIRE DETECTIONS
# ============================================================

print()
print("=" * 70)
print("LOADING FIRE DETECTIONS")
print("=" * 70)


query = f"""
SELECT
    id,
    latitude,
    longitude,
    brightness_difference,
    frp,
    day_of_year,
    brightness,
    scan,
    bright_t31,
    day,
    track,
    day_of_week,
    frp_log,
    hour,
    month,
    daynight
FROM "{SCHEMA_NAME}"."{SOURCE_TABLE}"
"""


df = pd.read_sql(
    query,
    engine
)


print(
    f"✅ Loaded {len(df):,} fire detections"
)


if len(df) == 0:

    print("No fire detections available.")

    raise SystemExit(0)


# ============================================================
# PREPARE FEATURES
# ============================================================

print()
print("=" * 70)
print("PREPARING FEATURES")
print("=" * 70)


# Encode day/night exactly like training
if "daynight" in df.columns:

    df["daynight"] = (
        df["daynight"]
        .astype(str)
        .str.upper()
        .str.strip()
        .map({
            "D": 1,
            "N": 0,
            "DAY": 1,
            "NIGHT": 0,
            "1": 1,
            "0": 0,
        })
    )


for feature in feature_columns:

    if feature == "daynight":
        continue

    df[feature] = pd.to_numeric(
        df[feature],
        errors="coerce"
    )


# Keep rows that can actually be predicted
valid_mask = (
    df[feature_columns]
    .notna()
    .all(axis=1)
)


df = df[valid_mask].copy()


print(
    f"✅ Valid prediction rows: "
    f"{len(df):,}"
)


if len(df) == 0:

    raise RuntimeError(
        "No valid rows available for prediction."
    )


X = df[
    feature_columns
]


# ============================================================
# MODEL PREDICTIONS
# ============================================================

print()
print("=" * 70)
print("GENERATING MODEL PREDICTIONS")
print("=" * 70)


print("Running XGBoost...")

xgb_probability = (
    xgb_model
    .predict_proba(X)[:, 1]
)


print("Running LightGBM...")

lgbm_probability = (
    lgbm_model
    .predict_proba(X)[:, 1]
)


print("Running Random Forest...")

rf_probability = (
    rf_model
    .predict_proba(X)[:, 1]
)


# ============================================================
# ENSEMBLE
# ============================================================

print()
print("Combining ensemble predictions...")


ensemble_probability = (

    XGB_WEIGHT * xgb_probability

    +

    LGBM_WEIGHT * lgbm_probability

    +

    RF_WEIGHT * rf_probability
)


prediction = (
    ensemble_probability >= THRESHOLD
).astype(int)


prediction_label = np.where(
    prediction == 1,
    "Future Fire",
    "No Future Fire"
)


# ============================================================
# RISK LEVEL
# ============================================================

def get_risk_level(probability):

    if probability >= 0.80:
        return "CRITICAL"

    if probability >= 0.60:
        return "HIGH"

    if probability >= 0.40:
        return "MEDIUM"

    return "LOW"


risk_level = [
    get_risk_level(probability)
    for probability
    in ensemble_probability
]


# ============================================================
# MODEL VERSION
# ============================================================

MODEL_VERSION = (
    "ensemble_xgb40_lgbm40_rf20_v1"
)


# ============================================================
# BUILD PREDICTION DATA
# ============================================================

prediction_df = pd.DataFrame({

    "fire_detection_id":
        df["id"].astype("int64"),

    "latitude":
        df["latitude"].astype(float),

    "longitude":
        df["longitude"].astype(float),

    "prediction_probability":
        ensemble_probability.astype(float),

    "prediction":
        prediction.astype(int),

    "prediction_label":
        prediction_label,

    "risk_level":
        risk_level,

    "prediction_horizon":
        "24h",

    "model_version":
        MODEL_VERSION,
})


# ============================================================
# STORE PREDICTIONS
# ============================================================

print()
print("=" * 70)
print("STORING PREDICTIONS")
print("=" * 70)


insert_sql = text(
    """
    INSERT INTO public.predictions (
        fire_detection_id,
        latitude,
        longitude,
        prediction_probability,
        prediction,
        prediction_label,
        risk_level,
        prediction_horizon,
        model_version
    )
    VALUES (
        :fire_detection_id,
        :latitude,
        :longitude,
        :prediction_probability,
        :prediction,
        :prediction_label,
        :risk_level,
        :prediction_horizon,
        :model_version
    )
    """
)


records = (
    prediction_df
    .to_dict(orient="records")
)


with engine.begin() as connection:

    connection.execute(
        insert_sql,
        records
    )


print(
    f"✅ Stored {len(records):,} predictions"
)


# ============================================================
# SUMMARY
# ============================================================

print()
print("=" * 70)
print("PREDICTION SUMMARY")
print("=" * 70)


print()
print(
    f"Total predictions: "
    f"{len(prediction_df):,}"
)


print()
print("Prediction classes:")

print(
    prediction_df[
        "prediction_label"
    ].value_counts()
)


print()
print("Risk levels:")

print(
    prediction_df[
        "risk_level"
    ].value_counts()
)


print()
print(
    "Probability statistics:"
)

print(
    prediction_df[
        "prediction_probability"
    ].describe()
)


print()
print("=" * 70)
print("🔥 PREDICTIONS STORED SUCCESSFULLY")
print("=" * 70)