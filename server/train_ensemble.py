"""
THERMAL-X
Ensemble Fire Prediction Training
Local PostgreSQL Version

Models:
    - XGBoost       40%
    - LightGBM      40%
    - Random Forest 20%

Target:
    future_fire_24h

Data source:
    Local PostgreSQL

Database:
    thermalx

Table:
    public.fire_detections
"""

import os
import json
import pickle
import warnings
from pathlib import Path

import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")


# ============================================================
# ENVIRONMENT
# ============================================================

print("=" * 70)
print("THERMAL-X ENVIRONMENT")
print("=" * 70)

BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / ".env"

print(f"Environment file:")
print(ENV_FILE)

if ENV_FILE.exists():
    print("✅ .env file found")
else:
    print("⚠️ .env file not found")


# ============================================================
# LOAD ENV
# ============================================================

try:
    from dotenv import load_dotenv

    load_dotenv(ENV_FILE)

except ImportError:
    print("❌ python-dotenv is not installed")
    print("Run:")
    print("pip install python-dotenv")
    raise


# ============================================================
# DATABASE CONFIGURATION
# ============================================================

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        """
❌ DATABASE_URL is missing from server/.env

Example:

DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/thermalx
"""
    )

SCHEMA_NAME = "public"

TRAINING_TABLE = os.getenv(
    "TRAINING_TABLE",
    "fire_detections"
)

TARGET_COLUMN = "future_fire_24h"


# ============================================================
# MODEL DIRECTORY
# ============================================================

DEFAULT_MODEL_DIR = BASE_DIR.parent / "models"

MODEL_DIR = Path(
    os.getenv("MODEL_DIR", str(DEFAULT_MODEL_DIR))
)

MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# ML FEATURES
# ============================================================

FEATURE_COLUMNS = [
    "brightness_difference",
    "latitude",
    "longitude",
    "frp",
    "day_of_year",
    "brightness",
    "scan",
    "bright_t31",
    "day",
    "track",
    "day_of_week",
    "frp_log",
    "hour",
    "month",
    "daynight",
]


# ============================================================
# DISPLAY CONFIGURATION
# ============================================================

print()
print("=" * 70)
print("🔥 THERMAL-X ENSEMBLE TRAINING")
print("=" * 70)

print()
print("Data source:")
print("Local PostgreSQL")

print()
print("Database driver:")
print("pg8000")

print()
print("Schema:")
print(SCHEMA_NAME)

print()
print("Training table:")
print(TRAINING_TABLE)

print()
print("Target:")
print(TARGET_COLUMN)

print()
print("ML features:")
print(len(FEATURE_COLUMNS))

print()
print("Model directory:")
print(MODEL_DIR)


# ============================================================
# CHECK PG8000
# ============================================================

print()
print("=" * 70)
print("CHECKING DATABASE DRIVER")
print("=" * 70)

try:
    import pg8000

    print(f"✅ pg8000 available: {pg8000.__version__}")

except ImportError:
    print("❌ pg8000 is not installed")
    print()
    print("Install it using:")
    print("pip install pg8000")
    raise


# ============================================================
# CHECK SCIKIT-LEARN
# ============================================================

print()
print("=" * 70)
print("CHECKING SCIKIT-LEARN")
print("=" * 70)

try:
    import sklearn

    print(f"✅ scikit-learn available: {sklearn.__version__}")

except ImportError:
    print("❌ scikit-learn is not installed")
    print("pip install scikit-learn")
    raise


# ============================================================
# CHECK XGBOOST
# ============================================================

print()
print("=" * 70)
print("CHECKING XGBOOST")
print("=" * 70)

try:
    import xgboost

    print(f"✅ XGBoost available: {xgboost.__version__}")

except ImportError:
    print("❌ XGBoost is not installed")
    print("pip install xgboost")
    raise


# ============================================================
# CHECK LIGHTGBM
# ============================================================

print()
print("=" * 70)
print("CHECKING LIGHTGBM")
print("=" * 70)

try:
    import lightgbm

    print("✅ LightGBM available")

except ImportError:
    print("❌ LightGBM is not installed")
    print("pip install lightgbm")
    raise


# ============================================================
# IMPORT ML LIBRARIES
# ============================================================

from sqlalchemy import create_engine, inspect, text

from sklearn.ensemble import RandomForestClassifier

from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
)

from xgboost import XGBClassifier

from lightgbm import LGBMClassifier


# ============================================================
# DATABASE CONNECTION
# ============================================================

print()
print("=" * 70)
print("CONNECTING TO LOCAL POSTGRESQL")
print("=" * 70)


# Convert PostgreSQL URL to pg8000 SQLAlchemy driver
if DATABASE_URL.startswith("postgresql://"):
    SQLALCHEMY_DATABASE_URL = DATABASE_URL.replace(
        "postgresql://",
        "postgresql+pg8000://",
        1
    )

elif DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = DATABASE_URL.replace(
        "postgres://",
        "postgresql+pg8000://",
        1
    )

else:
    SQLALCHEMY_DATABASE_URL = DATABASE_URL


try:

    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=3600,
    )

    with engine.connect() as connection:

        connection.execute(
            text("SELECT 1")
        )

    print("✅ Local PostgreSQL connection successful")

except Exception as error:

    print()
    print("❌ Local PostgreSQL connection failed")
    print()
    print(error)

    raise RuntimeError(
        "\n❌ Could not connect to local PostgreSQL."
        "\nCheck your DATABASE_URL in server/.env"
    ) from error


# ============================================================
# DATABASE INFORMATION
# ============================================================

print()
print("=" * 70)
print("DATABASE INFORMATION")
print("=" * 70)

try:

    with engine.connect() as connection:

        database_name = connection.execute(
            text("SELECT current_database()")
        ).scalar()

        current_user = connection.execute(
            text("SELECT current_user")
        ).scalar()

        version = connection.execute(
            text("SELECT version()")
        ).scalar()

    print(f"Database: {database_name}")
    print(f"User: {current_user}")
    print(f"Schema: {SCHEMA_NAME}")

    if version:
        print(f"PostgreSQL: {version}")

except Exception as error:

    print("⚠️ Could not retrieve database information")
    print(error)


# ============================================================
# CHECK TRAINING TABLE
# ============================================================

print()
print("=" * 70)
print("CHECKING TRAINING TABLE")
print("=" * 70)

try:

    inspector = inspect(engine)

    tables = inspector.get_table_names(
        schema=SCHEMA_NAME
    )

    if TRAINING_TABLE not in tables:

        raise ValueError(
            f"""
❌ Table does not exist:
{SCHEMA_NAME}.{TRAINING_TABLE}

Available tables:
{tables}
"""
        )

    print(
        f"✅ Training table exists: "
        f"{SCHEMA_NAME}.{TRAINING_TABLE}"
    )

except Exception as error:

    raise RuntimeError(
        f"""
❌ Training table check failed:

{error}
"""
    ) from error


# ============================================================
# CHECK TABLE COLUMNS
# ============================================================

print()
print("=" * 70)
print("CHECKING TABLE COLUMNS")
print("=" * 70)

try:

    columns_info = inspector.get_columns(
        TRAINING_TABLE,
        schema=SCHEMA_NAME
    )

    database_columns = [
        column["name"]
        for column in columns_info
    ]

    print(f"Total database columns: {len(database_columns)}")

    missing_features = [
        column
        for column in FEATURE_COLUMNS
        if column not in database_columns
    ]

    if missing_features:

        raise ValueError(
            f"""
❌ Missing ML feature columns:

{missing_features}
"""
        )

    if TARGET_COLUMN not in database_columns:

        raise ValueError(
            f"""
❌ Target column does not exist:

{TARGET_COLUMN}
"""
        )

    print("✅ All ML feature columns found")
    print(f"✅ Target column found: {TARGET_COLUMN}")

except Exception as error:

    raise RuntimeError(
        f"""
❌ Column validation failed:

{error}
"""
    ) from error


# ============================================================
# CHECK DATABASE ROW COUNT
# ============================================================

print()
print("=" * 70)
print("CHECKING DATASET")
print("=" * 70)

try:

    count_query = text(
        f"""
        SELECT COUNT(*)
        FROM "{SCHEMA_NAME}"."{TRAINING_TABLE}"
        """
    )

    with engine.connect() as connection:

        total_rows = connection.execute(
            count_query
        ).scalar()

    print(f"Total rows: {total_rows:,}")

    if total_rows == 0:

        raise ValueError(
            "❌ Training table is empty."
        )

except Exception as error:

    raise RuntimeError(
        f"""
❌ Dataset count check failed:

{error}
"""
    ) from error


# ============================================================
# LOAD DATA
# ============================================================

print()
print("=" * 70)
print("LOADING DATA")
print("=" * 70)

try:

    query = f"""
        SELECT *
        FROM "{SCHEMA_NAME}"."{TRAINING_TABLE}"
    """

    print("Loading data from local PostgreSQL...")
    print("This may take some time for a large dataset.")

    df = pd.read_sql(
        query,
        engine
    )

    print(
        f"✅ Loaded {len(df):,} rows"
    )

except Exception as error:

    raise RuntimeError(
        f"""
❌ Failed to load training data:

{error}
"""
    ) from error


# ============================================================
# BASIC DATASET INFORMATION
# ============================================================

print()
print("=" * 70)
print("DATASET INFORMATION")
print("=" * 70)

print(f"Rows: {len(df):,}")
print(f"Columns: {len(df.columns)}")

print()
print("Columns:")

for column in df.columns:
    print(f"  - {column}")


# ============================================================
# TIMESTAMP PREPARATION
# ============================================================

print()
print("=" * 70)
print("PREPARING TIMESTAMP")
print("=" * 70)


if "timestamp" in df.columns:

    df["timestamp"] = pd.to_datetime(
        df["timestamp"],
        errors="coerce"
    )

elif "acq_date" in df.columns:

    print(
        "⚠️ timestamp column not found."
        " Building timestamp from acq_date/acq_time."
    )

    if "acq_time" in df.columns:

        df["timestamp"] = pd.to_datetime(
            df["acq_date"].astype(str)
            + " "
            + df["acq_time"].astype(str),
            errors="coerce"
        )

    else:

        df["timestamp"] = pd.to_datetime(
            df["acq_date"],
            errors="coerce"
        )

else:

    raise ValueError(
        """
❌ No timestamp information found.

Required:
    timestamp

or:
    acq_date
    acq_time
"""
    )


invalid_timestamp = df["timestamp"].isna().sum()

if invalid_timestamp > 0:

    print(
        f"⚠️ Removing {invalid_timestamp:,} "
        "rows with invalid timestamps."
    )

    df = df.dropna(
        subset=["timestamp"]
    ).copy()


df = df.sort_values(
    "timestamp"
).reset_index(drop=True)


print(
    f"Minimum timestamp: "
    f"{df['timestamp'].min()}"
)

print(
    f"Maximum timestamp: "
    f"{df['timestamp'].max()}"
)


# ============================================================
# TARGET PREPARATION
# ============================================================

print()
print("=" * 70)
print("PREPARING TARGET")
print("=" * 70)

print(f"Target column: {TARGET_COLUMN}")


# Convert target to numeric
df[TARGET_COLUMN] = pd.to_numeric(
    df[TARGET_COLUMN],
    errors="coerce"
)


invalid_target = df[TARGET_COLUMN].isna().sum()

if invalid_target > 0:

    print(
        f"⚠️ Removing {invalid_target:,} "
        "rows with invalid target."
    )

    df = df.dropna(
        subset=[TARGET_COLUMN]
    ).copy()


# Convert target to integer
df[TARGET_COLUMN] = (
    df[TARGET_COLUMN]
    .astype(int)
)


# Ensure binary target
unique_targets = sorted(
    df[TARGET_COLUMN].unique().tolist()
)

print(
    f"Target classes: {unique_targets}"
)

if not set(unique_targets).issubset({0, 1}):

    raise ValueError(
        f"""
❌ Target must contain only 0 and 1.

Found:
{unique_targets}
"""
    )


print()
print("Target distribution:")

target_counts = (
    df[TARGET_COLUMN]
    .value_counts()
    .sort_index()
)

for target_value, count in target_counts.items():

    percentage = (
        count / len(df)
    ) * 100

    label = (
        "No Future Fire"
        if target_value == 0
        else "Future Fire"
    )

    print(
        f"  {target_value} - {label}: "
        f"{count:,} ({percentage:.2f}%)"
    )


# ============================================================
# DAYNIGHT ENCODING
# ============================================================

print()
print("=" * 70)
print("PREPARING FEATURES")
print("=" * 70)


# Make a copy
data = df.copy()


# Convert daynight to numeric
if "daynight" in data.columns:

    print("Encoding daynight...")

    data["daynight"] = (
        data["daynight"]
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

    data["daynight"] = pd.to_numeric(
        data["daynight"],
        errors="coerce"
    )


# ============================================================
# NUMERIC FEATURE CONVERSION
# ============================================================

for feature in FEATURE_COLUMNS:

    if feature == "daynight":
        continue

    data[feature] = pd.to_numeric(
        data[feature],
        errors="coerce"
    )


# ============================================================
# REMOVE INVALID FEATURE ROWS
# ============================================================

missing_before = data[FEATURE_COLUMNS].isna().sum()

print()
print("Missing values before cleaning:")

for feature, count in missing_before.items():

    if count > 0:

        print(
            f"  {feature}: {count:,}"
        )


required_columns = (
    FEATURE_COLUMNS
    + [TARGET_COLUMN]
)

before_cleaning = len(data)

data = data.dropna(
    subset=required_columns
).copy()

after_cleaning = len(data)

removed_rows = (
    before_cleaning
    - after_cleaning
)

if removed_rows > 0:

    print()
    print(
        f"⚠️ Removed {removed_rows:,} "
        "rows containing missing ML values."
    )

else:

    print()
    print("✅ No rows removed for missing ML values.")


# ============================================================
# CHECK DATASET AFTER CLEANING
# ============================================================

if len(data) == 0:

    raise ValueError(
        "❌ No usable rows remain after data cleaning."
    )


print()
print(
    f"Usable rows: {len(data):,}"
)


# ============================================================
# SORT BY TIME
# ============================================================

data = data.sort_values(
    "timestamp"
).reset_index(drop=True)


# ============================================================
# TIME-BASED DATA SPLIT
# ============================================================

print()
print("=" * 70)
print("TIME-BASED DATA SPLIT")
print("=" * 70)


# ------------------------------------------------------------
# IMPORTANT:
# These dates are the current project split.
#
# TRAIN:
# through 2025-12-31
#
# VALIDATION:
# 2026-01-01 through 2026-06-30
#
# TEST:
# after 2026-06-30
# ------------------------------------------------------------

TRAIN_END = pd.Timestamp(
    "2025-12-31 23:59:59"
)

VALIDATION_END = pd.Timestamp(
    "2026-06-30 23:59:59"
)


train_df = data[
    data["timestamp"] <= TRAIN_END
].copy()


validation_df = data[
    (data["timestamp"] > TRAIN_END)
    &
    (data["timestamp"] <= VALIDATION_END)
].copy()


test_df = data[
    data["timestamp"] > VALIDATION_END
].copy()


print()
print(
    f"Training rows:   {len(train_df):,}"
)

print(
    f"Validation rows: {len(validation_df):,}"
)

print(
    f"Test rows:       {len(test_df):,}"
)


# ============================================================
# CHECK SPLITS
# ============================================================

if len(train_df) == 0:

    raise ValueError(
        """
❌ Training dataset is empty.

Check the timestamp range of your PostgreSQL data.
"""
    )


if len(validation_df) == 0:

    raise ValueError(
        """
❌ Validation dataset is empty.

The current validation period is:
2026-01-01 through 2026-06-30

Your dataset does not contain rows in this period.
"""
    )


if len(test_df) == 0:

    raise ValueError(
        """
❌ Test dataset is empty.

The current test period starts:
2026-07-01

Your dataset does not contain rows after this date.
"""
    )


# ============================================================
# CREATE X / Y
# ============================================================

X_train = train_df[
    FEATURE_COLUMNS
].copy()

y_train = train_df[
    TARGET_COLUMN
].copy()


X_validation = validation_df[
    FEATURE_COLUMNS
].copy()

y_validation = validation_df[
    TARGET_COLUMN
].copy()


X_test = test_df[
    FEATURE_COLUMNS
].copy()

y_test = test_df[
    TARGET_COLUMN
].copy()


# ============================================================
# CHECK TARGET CLASSES
# ============================================================

print()
print("=" * 70)
print("CHECKING TARGET CLASSES")
print("=" * 70)


print()
print("Training classes:")
print(
    y_train.value_counts()
    .sort_index()
)


print()
print("Validation classes:")
print(
    y_validation.value_counts()
    .sort_index()
)


print()
print("Test classes:")
print(
    y_test.value_counts()
    .sort_index()
)


if y_train.nunique() < 2:

    raise ValueError(
        """
❌ Training dataset contains only one target class.
Both 0 and 1 are required.
"""
    )


if y_validation.nunique() < 2:

    print(
        "⚠️ Validation dataset contains only one class."
    )


if y_test.nunique() < 2:

    print(
        "⚠️ Test dataset contains only one class."
    )


# ============================================================
# SAMPLE WEIGHTS
# ============================================================

print()
print("=" * 70)
print("CALCULATING CLASS WEIGHTS")
print("=" * 70)


class_counts = (
    y_train.value_counts()
)

negative_count = class_counts.get(
    0,
    0
)

positive_count = class_counts.get(
    1,
    0
)


if positive_count == 0:

    raise ValueError(
        "❌ No positive Future Fire samples."
    )


scale_pos_weight = (
    negative_count
    / positive_count
)


print(
    f"No Future Fire: {negative_count:,}"
)

print(
    f"Future Fire:    {positive_count:,}"
)

print(
    f"scale_pos_weight: "
    f"{scale_pos_weight:.4f}"
)


# ============================================================
# MODEL 1 — XGBOOST
# ============================================================

print()
print("=" * 70)
print("TRAINING XGBOOST")
print("=" * 70)


xgb_model = XGBClassifier(

    n_estimators=500,

    max_depth=8,

    learning_rate=0.05,

    subsample=0.8,

    colsample_bytree=0.8,

    objective="binary:logistic",

    eval_metric="logloss",

    tree_method="hist",

    random_state=42,

    n_jobs=-1,

    scale_pos_weight=scale_pos_weight,
)


xgb_model.fit(
    X_train,
    y_train,
    sample_weight=np.where(
        y_train == 1,
        scale_pos_weight,
        1.0
    ),
)


print("✅ XGBoost training completed")


# ============================================================
# MODEL 2 — LIGHTGBM
# ============================================================

print()
print("=" * 70)
print("TRAINING LIGHTGBM")
print("=" * 70)


lgbm_model = LGBMClassifier(

    n_estimators=500,

    num_leaves=63,

    learning_rate=0.05,

    subsample=0.8,

    colsample_bytree=0.8,

    objective="binary",

    random_state=42,

    n_jobs=-1,

    verbosity=-1,

)


lgbm_model.fit(
    X_train,
    y_train,

    sample_weight=np.where(
        y_train == 1,
        scale_pos_weight,
        1.0
    ),
)


print("✅ LightGBM training completed")


# ============================================================
# MODEL 3 — RANDOM FOREST
# ============================================================

print()
print("=" * 70)
print("TRAINING RANDOM FOREST")
print("=" * 70)


rf_model = RandomForestClassifier(

    n_estimators=200,

    max_depth=20,

    min_samples_leaf=2,

    max_features="sqrt",

    class_weight="balanced_subsample",

    random_state=42,

    n_jobs=-1,
)


rf_model.fit(
    X_train,
    y_train
)


print("✅ Random Forest training completed")


# ============================================================
# ENSEMBLE WEIGHTS
# ============================================================

XGB_WEIGHT = 0.40
LGBM_WEIGHT = 0.40
RF_WEIGHT = 0.20


# ============================================================
# PREDICTION FUNCTION
# ============================================================

def ensemble_predict_proba(
    X
):

    xgb_probability = (
        xgb_model
        .predict_proba(X)[:, 1]
    )

    lgbm_probability = (
        lgbm_model
        .predict_proba(X)[:, 1]
    )

    rf_probability = (
        rf_model
        .predict_proba(X)[:, 1]
    )

    ensemble_probability = (

        XGB_WEIGHT
        * xgb_probability

        +

        LGBM_WEIGHT
        * lgbm_probability

        +

        RF_WEIGHT
        * rf_probability
    )

    return ensemble_probability


def ensemble_predict(
    X,
    threshold=0.5
):

    probability = (
        ensemble_predict_proba(X)
    )

    return (
        probability >= threshold
    ).astype(int)


# ============================================================
# EVALUATION FUNCTION
# ============================================================

def evaluate_model(
    name,
    y_true,
    y_pred,
):

    print()
    print("-" * 70)
    print(name)
    print("-" * 70)

    accuracy = accuracy_score(
        y_true,
        y_pred
    )

    balanced_accuracy = (
        balanced_accuracy_score(
            y_true,
            y_pred
        )
    )

    precision = precision_score(
        y_true,
        y_pred,
        average="macro",
        zero_division=0
    )

    recall = recall_score(
        y_true,
        y_pred,
        average="macro",
        zero_division=0
    )

    macro_f1 = f1_score(
        y_true,
        y_pred,
        average="macro",
        zero_division=0
    )

    weighted_f1 = f1_score(
        y_true,
        y_pred,
        average="weighted",
        zero_division=0
    )

    print(
        f"Accuracy:           {accuracy:.4f}"
    )

    print(
        f"Balanced Accuracy:  {balanced_accuracy:.4f}"
    )

    print(
        f"Macro Precision:    {precision:.4f}"
    )

    print(
        f"Macro Recall:       {recall:.4f}"
    )

    print(
        f"Macro F1:           {macro_f1:.4f}"
    )

    print(
        f"Weighted F1:        {weighted_f1:.4f}"
    )

    print()
    print("Classification Report:")

    print(
        classification_report(
            y_true,
            y_pred,
            target_names=[
                "No Future Fire",
                "Future Fire"
            ],
            zero_division=0
        )
    )

    print("Confusion Matrix:")

    print(
        confusion_matrix(
            y_true,
            y_pred
        )
    )

    return {
        "accuracy": float(accuracy),
        "balanced_accuracy": float(
            balanced_accuracy
        ),
        "macro_precision": float(
            precision
        ),
        "macro_recall": float(
            recall
        ),
        "macro_f1": float(
            macro_f1
        ),
        "weighted_f1": float(
            weighted_f1
        ),
    }


# ============================================================
# VALIDATION
# ============================================================

print()
print("=" * 70)
print("ENSEMBLE VALIDATION")
print("=" * 70)


validation_predictions = ensemble_predict(
    X_validation
)


validation_probabilities = (
    ensemble_predict_proba(
        X_validation
    )
)


validation_metrics = evaluate_model(
    "ENSEMBLE VALIDATION",
    y_validation,
    validation_predictions
)


# ============================================================
# TEST
# ============================================================

print()
print("=" * 70)
print("ENSEMBLE TEST")
print("=" * 70)


test_predictions = ensemble_predict(
    X_test
)


test_probabilities = (
    ensemble_predict_proba(
        X_test
    )
)


test_metrics = evaluate_model(
    "ENSEMBLE TEST",
    y_test,
    test_predictions
)


# ============================================================
# FEATURE IMPORTANCE
# ============================================================

print()
print("=" * 70)
print("CALCULATING FEATURE IMPORTANCE")
print("=" * 70)


xgb_importance = (
    xgb_model.feature_importances_
)

lgbm_importance = (
    lgbm_model.feature_importances_
)

rf_importance = (
    rf_model.feature_importances_
)


def normalize_importance(values):

    total = np.sum(values)

    if total == 0:
        return np.zeros_like(values)

    return values / total


xgb_normalized = normalize_importance(
    xgb_importance
)

lgbm_normalized = normalize_importance(
    lgbm_importance
)

rf_normalized = normalize_importance(
    rf_importance
)


ensemble_importance = (

    XGB_WEIGHT
    * xgb_normalized

    +

    LGBM_WEIGHT
    * lgbm_normalized

    +

    RF_WEIGHT
    * rf_normalized
)


feature_importance_df = pd.DataFrame({

    "feature": FEATURE_COLUMNS,

    "xgboost_importance":
        xgb_normalized,

    "lightgbm_importance":
        lgbm_normalized,

    "random_forest_importance":
        rf_normalized,

    "ensemble_importance":
        ensemble_importance,

})


feature_importance_df = (
    feature_importance_df
    .sort_values(
        "ensemble_importance",
        ascending=False
    )
    .reset_index(drop=True)
)


print()
print(feature_importance_df)


# ============================================================
# SAVE MODELS
# ============================================================

print()
print("=" * 70)
print("SAVING MODELS")
print("=" * 70)


xgb_path = (
    MODEL_DIR
    / "xgboost_model.pkl"
)

lgbm_path = (
    MODEL_DIR
    / "lightgbm_model.pkl"
)

rf_path = (
    MODEL_DIR
    / "random_forest_model.pkl"
)

features_path = (
    MODEL_DIR
    / "feature_columns.pkl"
)


with open(
    xgb_path,
    "wb"
) as file:

    pickle.dump(
        xgb_model,
        file
    )


with open(
    lgbm_path,
    "wb"
) as file:

    pickle.dump(
        lgbm_model,
        file
    )


with open(
    rf_path,
    "wb"
) as file:

    pickle.dump(
        rf_model,
        file
    )


with open(
    features_path,
    "wb"
) as file:

    pickle.dump(
        FEATURE_COLUMNS,
        file
    )


print(
    f"✅ XGBoost saved:"
    f"\n   {xgb_path}"
)

print(
    f"✅ LightGBM saved:"
    f"\n   {lgbm_path}"
)

print(
    f"✅ Random Forest saved:"
    f"\n   {rf_path}"
)

print(
    f"✅ Feature columns saved:"
    f"\n   {features_path}"
)


# ============================================================
# SAVE FEATURE IMPORTANCE
# ============================================================

feature_importance_path = (
    MODEL_DIR
    / "feature_importance.csv"
)


feature_importance_df.to_csv(
    feature_importance_path,
    index=False
)


print(
    f"✅ Feature importance saved:"
    f"\n   {feature_importance_path}"
)


# ============================================================
# SAVE ENSEMBLE CONFIGURATION
# ============================================================

ensemble_config = {

    "data_source": "Local PostgreSQL",

    "database": "thermalx",

    "schema": SCHEMA_NAME,

    "training_table": TRAINING_TABLE,

    "target_column": TARGET_COLUMN,

    "target_type": "binary",

    "classes": {
        "0": "No Future Fire",
        "1": "Future Fire"
    },

    "features": FEATURE_COLUMNS,

    "model_weights": {

        "xgboost": XGB_WEIGHT,

        "lightgbm": LGBM_WEIGHT,

        "random_forest": RF_WEIGHT,
    },

    "models": {

        "xgboost": {
            "n_estimators": 500,
            "max_depth": 8,
            "learning_rate": 0.05,
            "subsample": 0.8,
            "colsample_bytree": 0.8,
        },

        "lightgbm": {
            "n_estimators": 500,
            "num_leaves": 63,
            "learning_rate": 0.05,
            "subsample": 0.8,
            "colsample_bytree": 0.8,
        },

        "random_forest": {
            "n_estimators": 200,
            "max_depth": 20,
            "min_samples_leaf": 2,
            "max_features": "sqrt",
        },
    },

    "training_split": {
        "end": str(TRAIN_END),
    },

    "validation_split": {
        "start": str(TRAIN_END),
        "end": str(VALIDATION_END),
    },

    "test_split": {
        "start": str(VALIDATION_END),
    },

    "scale_pos_weight": float(
        scale_pos_weight
    ),

}


config_path = (
    MODEL_DIR
    / "ensemble_config.json"
)


with open(
    config_path,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        ensemble_config,
        file,
        indent=4
    )


print(
    f"✅ Ensemble configuration saved:"
    f"\n   {config_path}"
)


# ============================================================
# SAVE TRAINING SUMMARY
# ============================================================

training_summary = {

    "data_source":
        "Local PostgreSQL",

    "database":
        "thermalx",

    "schema":
        SCHEMA_NAME,

    "training_table":
        TRAINING_TABLE,

    "target":
        TARGET_COLUMN,

    "total_rows_loaded":
        int(total_rows),

    "usable_rows":
        int(len(data)),

    "train_rows":
        int(len(train_df)),

    "validation_rows":
        int(len(validation_df)),

    "test_rows":
        int(len(test_df)),

    "timestamp_min":
        str(data["timestamp"].min()),

    "timestamp_max":
        str(data["timestamp"].max()),

    "target_distribution": {
        str(key): int(value)
        for key, value
        in data[TARGET_COLUMN]
        .value_counts()
        .sort_index()
        .items()
    },

    "validation_metrics":
        validation_metrics,

    "test_metrics":
        test_metrics,

    "model_weights": {

        "xgboost":
            XGB_WEIGHT,

        "lightgbm":
            LGBM_WEIGHT,

        "random_forest":
            RF_WEIGHT,
    },

}


summary_path = (
    MODEL_DIR
    / "training_summary.json"
)


with open(
    summary_path,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        training_summary,
        file,
        indent=4
    )


print(
    f"✅ Training summary saved:"
    f"\n   {summary_path}"
)


# ============================================================
# FINAL SUMMARY
# ============================================================

print()
print("=" * 70)
print("🎉 THERMAL-X TRAINING COMPLETED")
print("=" * 70)

print()
print("DATABASE")
print("-----------------------------------")
print("Source:       Local PostgreSQL")
print("Database:     thermalx")
print("Schema:       public")
print(f"Table:        {TRAINING_TABLE}")
print(f"Target:       {TARGET_COLUMN}")


print()
print("DATASET")
print("-----------------------------------")
print(f"Loaded rows:  {total_rows:,}")
print(f"Usable rows:  {len(data):,}")
print(f"Train rows:   {len(train_df):,}")
print(f"Validation:   {len(validation_df):,}")
print(f"Test rows:    {len(test_df):,}")


print()
print("ENSEMBLE")
print("-----------------------------------")
print("XGBoost:       40%")
print("LightGBM:      40%")
print("Random Forest: 20%")


print()
print("TEST RESULTS")
print("-----------------------------------")

for metric, value in test_metrics.items():

    print(
        f"{metric}: {value:.4f}"
    )


print()
print("MODEL FILES")
print("-----------------------------------")

print(xgb_path)
print(lgbm_path)
print(rf_path)
print(features_path)
print(feature_importance_path)
print(config_path)
print(summary_path)


print()
print("=" * 70)
print("🔥 THERMAL-X READY")
print("=" * 70)