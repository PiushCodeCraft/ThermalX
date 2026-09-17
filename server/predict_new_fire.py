import sys
import json
import os
import pickle

import numpy as np
import pandas as pd


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

MODEL_DIR = os.path.abspath(
    os.path.join(
        BASE_DIR,
        "..",
        "models"
    )
)


# ============================================================
# LOAD TRAINED MODELS
# ============================================================

with open(
    os.path.join(
        MODEL_DIR,
        "xgboost_model.pkl"
    ),
    "rb"
) as f:
    xgb_model = pickle.load(f)


with open(
    os.path.join(
        MODEL_DIR,
        "lightgbm_model.pkl"
    ),
    "rb"
) as f:
    lgbm_model = pickle.load(f)


with open(
    os.path.join(
        MODEL_DIR,
        "random_forest_model.pkl"
    ),
    "rb"
) as f:
    rf_model = pickle.load(f)


with open(
    os.path.join(
        MODEL_DIR,
        "feature_columns.pkl"
    ),
    "rb"
) as f:
    feature_columns = pickle.load(f)


print(
    "✅ XGBoost, LightGBM and Random Forest loaded",
    file=sys.stderr
)


# ============================================================
# RISK LEVEL
# ============================================================

def calculate_risk(probability):

    if probability >= 0.85:
        return "CRITICAL"

    elif probability >= 0.65:
        return "HIGH"

    elif probability >= 0.40:
        return "MEDIUM"

    else:
        return "LOW"


# ============================================================
# CREATE FEATURES
# ============================================================

def create_features(detection):

    df = pd.DataFrame([detection])


    # --------------------------------------------------------
    # REQUIRED NUMERIC COLUMNS
    # --------------------------------------------------------

    numeric_columns = [
        "latitude",
        "longitude",
        "brightness",
        "bright_t31",
        "frp",
        "scan",
        "track",
    ]


    for column in numeric_columns:

        if column not in df.columns:
            df[column] = 0

        df[column] = pd.to_numeric(
            df[column],
            errors="coerce"
        )


    # --------------------------------------------------------
    # TIMESTAMP
    # --------------------------------------------------------

    timestamp = pd.to_datetime(
        df.get("timestamp"),
        errors="coerce"
    )


    # --------------------------------------------------------
    # FALLBACK: FIRMS DATE + TIME
    # --------------------------------------------------------

    if timestamp.isna().all():

        if (
            "acq_date" in df.columns
            and "acq_time" in df.columns
        ):

            date_value = (
                df["acq_date"]
                .fillna("")
                .astype(str)
            )

            time_value = (
                df["acq_time"]
                .fillna("0000")
                .astype(str)
                .str.replace(
                    ".0",
                    "",
                    regex=False
                )
                .str.zfill(4)
            )


            timestamp = pd.to_datetime(
                date_value + " " + time_value,
                format="%Y-%m-%d %H%M",
                errors="coerce"
            )


    # --------------------------------------------------------
    # TEMPORAL FEATURES
    # --------------------------------------------------------

    df["hour"] = (
        timestamp.dt.hour
        .fillna(0)
        .astype(int)
    )


    df["day"] = (
        timestamp.dt.day
        .fillna(1)
        .astype(int)
    )


    df["month"] = (
        timestamp.dt.month
        .fillna(1)
        .astype(int)
    )


    df["day_of_year"] = (
        timestamp.dt.dayofyear
        .fillna(1)
        .astype(int)
    )


    df["day_of_week"] = (
        timestamp.dt.dayofweek
        .fillna(0)
        .astype(int)
    )


    # --------------------------------------------------------
    # DAY / NIGHT
    # --------------------------------------------------------

    daynight = (
        df["daynight"]
        if "daynight" in df.columns
        else pd.Series(["D"])
    )


    df["daynight"] = (
        daynight
        .fillna("D")
        .astype(str)
        .str.upper()
        .map({
            "D": 1,
            "DAY": 1,
            "N": 0,
            "NIGHT": 0
        })
        .fillna(1)
    )


    # --------------------------------------------------------
    # BRIGHTNESS DIFFERENCE
    # --------------------------------------------------------

    df["brightness_difference"] = (
        df["brightness"]
        - df["bright_t31"]
    )


    # --------------------------------------------------------
    # LOG FRP
    # --------------------------------------------------------

    df["frp_log"] = np.log1p(
        df["frp"].clip(lower=0)
    )


    # --------------------------------------------------------
    # SELECT EXACT TRAINING FEATURES
    # --------------------------------------------------------

    missing_features = [
        feature
        for feature in feature_columns
        if feature not in df.columns
    ]


    if missing_features:

        raise ValueError(
            "Missing model features: "
            + ", ".join(missing_features)
        )


    X = df[
        feature_columns
    ].copy()


    # --------------------------------------------------------
    # CLEAN VALUES
    # --------------------------------------------------------

    X = X.replace(
        [np.inf, -np.inf],
        np.nan
    )

    X = X.fillna(0)


    return X


# ============================================================
# ENSEMBLE PREDICTION
# ============================================================

def predict_fire(detection):

    X = create_features(
        detection
    )


    # --------------------------------------------------------
    # XGBOOST
    # --------------------------------------------------------

    xgb_probability = float(
        xgb_model.predict_proba(X)[0][1]
    )


    # --------------------------------------------------------
    # LIGHTGBM
    # --------------------------------------------------------

    lgbm_probability = float(
        lgbm_model.predict_proba(X)[0][1]
    )


    # --------------------------------------------------------
    # RANDOM FOREST
    # --------------------------------------------------------

    rf_probability = float(
        rf_model.predict_proba(X)[0][1]
    )


    # ========================================================
    # THERMAL-X ENSEMBLE
    # ========================================================

    ensemble_probability = (
        (0.40 * xgb_probability)
        + (0.40 * lgbm_probability)
        + (0.20 * rf_probability)
    )


    # --------------------------------------------------------
    # BINARY PREDICTION
    # --------------------------------------------------------

    prediction = int(
        ensemble_probability >= 0.50
    )


    # --------------------------------------------------------
    # LABEL
    # --------------------------------------------------------

    if prediction == 1:

        prediction_label = "Future Fire"

    else:

        prediction_label = "No Future Fire"


    # --------------------------------------------------------
    # RISK
    # --------------------------------------------------------

    risk_level = calculate_risk(
        ensemble_probability
    )


    # ========================================================
    # RESULT
    # ========================================================

    return {

        "mongo_detection_id":
            detection.get(
                "mongo_detection_id"
            ),

        "prediction":
            prediction,

        "prediction_probability":
            round(
                ensemble_probability,
                6
            ),

        "prediction_label":
            prediction_label,

        "risk_level":
            risk_level,

    }


# ============================================================
# MAIN
# ============================================================

def main():

    try:

        # Read JSON from Node.js
        input_data = sys.stdin.read()


        if not input_data.strip():

            raise ValueError(
                "No detection data received"
            )


        detection = json.loads(
            input_data
        )


        # Run prediction
        result = predict_fire(
            detection
        )


        # IMPORTANT:
        # Only JSON goes to stdout.
        # Node.js reads this output.
        print(
            json.dumps(result)
        )


    except Exception as error:

        print(
            f"Prediction error: {error}",
            file=sys.stderr
        )

        sys.exit(1)


# ============================================================
# START
# ============================================================

if __name__ == "__main__":

    main()