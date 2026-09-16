import os
import json
import importlib
import joblib
import numpy as np
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    classification_report,
    confusion_matrix,
    f1_score,
    balanced_accuracy_score
)
from sklearn.utils.class_weight import compute_sample_weight

from xgboost import XGBClassifier

try:
    LGBMClassifier = importlib.import_module("lightgbm").LGBMClassifier
except (ImportError, AttributeError) as exc:
    raise ImportError(
        "LightGBM is required to train the ensemble. "
        "Install it with: python -m pip install lightgbm"
    ) from exc


# ============================================================
# THERMAL-X ENSEMBLE MODEL
# XGBoost + LightGBM + Random Forest
# ============================================================

DATA_PATH = r"D:\Hackthon💻\SIH\project\ThermalX\datasets\thermalx_future_fire_dataset.csv"

MODEL_DIR = r"D:\Hackthon💻\SIH\project\ThermalX\models"

# ------------------------------------------------------------
# IMPORTANT:
# Change this after you decide your actual prediction target.
#
# Current dataset:
# confidence = LOW / NOMINAL / HIGH
#
# If you later create:
# risk_level = LOW / MEDIUM / HIGH / CRITICAL
#
# change TARGET_COLUMN = "risk_level"
# ------------------------------------------------------------

TARGET_COLUMN = "confidence"


# ============================================================
# SETTINGS
# ============================================================

RANDOM_STATE = 42

# Time split
TRAIN_END = "2025-12-31 23:59:59"
VALIDATION_END = "2026-06-30 23:59:59"

# Ensemble weights
# These can later be optimized using validation performance.
XGB_WEIGHT = 0.40
LGB_WEIGHT = 0.40
RF_WEIGHT = 0.20


# ============================================================
# CREATE MODEL DIRECTORY
# ============================================================

os.makedirs(MODEL_DIR, exist_ok=True)


# ============================================================
# LOAD DATA
# ============================================================

print("=" * 70)
print("THERMAL-X ENSEMBLE TRAINING")
print("=" * 70)

print("\nLoading dataset...")

df = pd.read_csv(DATA_PATH)

print(f"Rows: {len(df):,}")
print(f"Columns: {len(df.columns)}")


# ============================================================
# TIMESTAMP
# ============================================================

print("\nConverting timestamp...")

df["timestamp"] = pd.to_datetime(
    df["timestamp"],
    errors="coerce"
)

df = df.dropna(subset=["timestamp"])

df = df.sort_values("timestamp").reset_index(drop=True)


# ============================================================
# CHECK TARGET
# ============================================================

if TARGET_COLUMN not in df.columns:

    raise ValueError(
        f"\nTarget column '{TARGET_COLUMN}' was not found.\n"
        f"Available columns:\n{df.columns.tolist()}\n"
        "\nCreate the target first or change TARGET_COLUMN."
    )


print(f"\nTarget column: {TARGET_COLUMN}")

print("\nTarget distribution:")
print(df[TARGET_COLUMN].value_counts())


# ============================================================
# REMOVE INVALID TARGET
# ============================================================

df = df.dropna(subset=[TARGET_COLUMN])


# ============================================================
# FEATURE SELECTION
# ============================================================

FEATURE_COLUMNS = [
    "latitude",
    "longitude",
    "brightness",
    "bright_t31",
    "frp",
    "scan",
    "track",
    "daynight",
    "hour",
    "day",
    "month",
    "day_of_year",
    "brightness_difference",
    "frp_log",
    "day_of_week"
]

# IMPORTANT:
# confidence is deliberately NOT included because it is
# the current target.
#
# timestamp is also excluded because the models receive
# engineered temporal features instead.


missing_features = [
    col for col in FEATURE_COLUMNS
    if col not in df.columns
]

if missing_features:

    raise ValueError(
        f"Missing feature columns: {missing_features}"
    )


# ============================================================
# ENCODE DAY/NIGHT
# ============================================================

print("\nEncoding day/night...")

df["daynight"] = (
    df["daynight"]
    .map({
        "D": 1,
        "N": 0
    })
    .fillna(0)
    .astype(int)
)


# ============================================================
# X / y
# ============================================================

X = df[FEATURE_COLUMNS].copy()

y_raw = df[TARGET_COLUMN].astype(str)


# ============================================================
# LABEL ENCODING
# ============================================================

label_encoder = LabelEncoder()

y = label_encoder.fit_transform(y_raw)

class_names = label_encoder.classes_

print("\nClasses:")
for i, name in enumerate(class_names):

    print(f"  {i} = {name}")


NUM_CLASSES = len(class_names)


# ============================================================
# TIME-BASED SPLIT
# ============================================================

train_end = pd.Timestamp(TRAIN_END)
validation_end = pd.Timestamp(VALIDATION_END)

train_mask = df["timestamp"] <= train_end

validation_mask = (
    (df["timestamp"] > train_end) &
    (df["timestamp"] <= validation_end)
)

test_mask = df["timestamp"] > validation_end


X_train = X.loc[train_mask]
y_train = y[train_mask]

X_validation = X.loc[validation_mask]
y_validation = y[validation_mask]

X_test = X.loc[test_mask]
y_test = y[test_mask]


print("\n" + "=" * 70)
print("TIME SPLIT")
print("=" * 70)

print(f"Training:   {len(X_train):,}")
print(f"Validation: {len(X_validation):,}")
print(f"Testing:    {len(X_test):,}")


if len(X_train) == 0 or len(X_validation) == 0 or len(X_test) == 0:

    raise ValueError(
        "One of the train/validation/test sets is empty. "
        "Check your date ranges."
    )


# ============================================================
# CLASS WEIGHTS
# ============================================================

print("\nCalculating class weights...")

sample_weights = compute_sample_weight(
    class_weight="balanced",
    y=y_train
)


# ============================================================
# XGBOOST
# ============================================================

print("\n" + "=" * 70)
print("TRAINING XGBOOST")
print("=" * 70)

if NUM_CLASSES == 2:

    xgb_model = XGBClassifier(
        n_estimators=500,
        max_depth=8,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        objective="binary:logistic",
        eval_metric="logloss",
        tree_method="hist",
        random_state=RANDOM_STATE,
        n_jobs=-1
    )

else:

    xgb_model = XGBClassifier(
        n_estimators=500,
        max_depth=8,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        objective="multi:softprob",
        num_class=NUM_CLASSES,
        eval_metric="mlogloss",
        tree_method="hist",
        random_state=RANDOM_STATE,
        n_jobs=-1
    )


xgb_model.fit(
    X_train,
    y_train,
    sample_weight=sample_weights
)

print("XGBoost training complete.")


# ============================================================
# LIGHTGBM
# ============================================================

print("\n" + "=" * 70)
print("TRAINING LIGHTGBM")
print("=" * 70)

if NUM_CLASSES == 2:

    lgb_model = LGBMClassifier(
        n_estimators=500,
        max_depth=-1,
        num_leaves=63,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        objective="binary",
        random_state=RANDOM_STATE,
        n_jobs=-1,
        verbosity=-1
    )

else:

    lgb_model = LGBMClassifier(
        n_estimators=500,
        max_depth=-1,
        num_leaves=63,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        objective="multiclass",
        num_class=NUM_CLASSES,
        random_state=RANDOM_STATE,
        n_jobs=-1,
        verbosity=-1
    )


lgb_model.fit(
    X_train,
    y_train,
    sample_weight=sample_weights
)

print("LightGBM training complete.")


# ============================================================
# RANDOM FOREST
# ============================================================

print("\n" + "=" * 70)
print("TRAINING RANDOM FOREST")
print("=" * 70)

rf_model = RandomForestClassifier(
    n_estimators=200,
    max_depth=20,
    min_samples_leaf=2,
    max_features="sqrt",
    class_weight="balanced_subsample",
    random_state=RANDOM_STATE,
    n_jobs=-1
)

rf_model.fit(
    X_train,
    y_train
)

print("Random Forest training complete.")


# ============================================================
# PREDICTIONS
# ============================================================

print("\n" + "=" * 70)
print("GENERATING VALIDATION PREDICTIONS")
print("=" * 70)

xgb_val_prob = xgb_model.predict_proba(X_validation)

lgb_val_prob = lgb_model.predict_proba(X_validation)

rf_val_prob = rf_model.predict_proba(X_validation)


# ============================================================
# SOFT VOTING
# ============================================================

ensemble_val_prob = (
    XGB_WEIGHT * xgb_val_prob
    +
    LGB_WEIGHT * lgb_val_prob
    +
    RF_WEIGHT * rf_val_prob
)

ensemble_val_pred = np.argmax(
    ensemble_val_prob,
    axis=1
)


# ============================================================
# MODEL EVALUATION FUNCTION
# ============================================================

def evaluate_model(name, y_true, probabilities):

    predictions = np.argmax(
        probabilities,
        axis=1
    )

    accuracy = accuracy_score(
        y_true,
        predictions
    )

    balanced_acc = balanced_accuracy_score(
        y_true,
        predictions
    )

    f1_macro = f1_score(
        y_true,
        predictions,
        average="macro"
    )

    f1_weighted = f1_score(
        y_true,
        predictions,
        average="weighted"
    )

    precision, recall, _, _ = precision_recall_fscore_support(
        y_true,
        predictions,
        average="macro",
        zero_division=0
    )

    print("\n" + "-" * 70)
    print(name)
    print("-" * 70)

    print(f"Accuracy:          {accuracy:.4f}")
    print(f"Balanced Accuracy: {balanced_acc:.4f}")
    print(f"Macro Precision:    {precision:.4f}")
    print(f"Macro Recall:       {recall:.4f}")
    print(f"Macro F1:           {f1_macro:.4f}")
    print(f"Weighted F1:        {f1_weighted:.4f}")

    print("\nClassification Report:")

    print(
        classification_report(
            y_true,
            predictions,
            target_names=class_names,
            zero_division=0
        )
    )

    print("Confusion Matrix:")

    print(
        confusion_matrix(
            y_true,
            predictions
        )
    )

    return {
        "accuracy": accuracy,
        "balanced_accuracy": balanced_acc,
        "precision_macro": precision,
        "recall_macro": recall,
        "f1_macro": f1_macro,
        "f1_weighted": f1_weighted
    }


# ============================================================
# VALIDATION RESULTS
# ============================================================

xgb_metrics = evaluate_model(
    "XGBoost",
    y_validation,
    xgb_val_prob
)

lgb_metrics = evaluate_model(
    "LightGBM",
    y_validation,
    lgb_val_prob
)

rf_metrics = evaluate_model(
    "Random Forest",
    y_validation,
    rf_val_prob
)

ensemble_metrics = evaluate_model(
    "ENSEMBLE",
    y_validation,
    ensemble_val_prob
)


# ============================================================
# TEST THE FINAL ENSEMBLE
# ============================================================

print("\n" + "=" * 70)
print("FINAL TEST EVALUATION")
print("=" * 70)

xgb_test_prob = xgb_model.predict_proba(X_test)

lgb_test_prob = lgb_model.predict_proba(X_test)

rf_test_prob = rf_model.predict_proba(X_test)


ensemble_test_prob = (
    XGB_WEIGHT * xgb_test_prob
    +
    LGB_WEIGHT * lgb_test_prob
    +
    RF_WEIGHT * rf_test_prob
)


test_metrics = evaluate_model(
    "FINAL ENSEMBLE - UNSEEN TEST DATA",
    y_test,
    ensemble_test_prob
)


# ============================================================
# FEATURE IMPORTANCE
# ============================================================

print("\n" + "=" * 70)
print("FEATURE IMPORTANCE")
print("=" * 70)

importance = pd.DataFrame({
    "feature": FEATURE_COLUMNS,
    "xgboost": xgb_model.feature_importances_,
    "lightgbm": lgb_model.feature_importances_,
    "random_forest": rf_model.feature_importances_
})

importance["average_importance"] = (
    importance["xgboost"]
    +
    importance["lightgbm"]
    +
    importance["random_forest"]
) / 3

importance = importance.sort_values(
    "average_importance",
    ascending=False
)

print(importance.to_string(index=False))


# ============================================================
# SAVE MODELS
# ============================================================

print("\n" + "=" * 70)
print("SAVING MODELS")
print("=" * 70)

joblib.dump(
    xgb_model,
    os.path.join(
        MODEL_DIR,
        "xgboost_model.pkl"
    )
)

joblib.dump(
    lgb_model,
    os.path.join(
        MODEL_DIR,
        "lightgbm_model.pkl"
    )
)

joblib.dump(
    rf_model,
    os.path.join(
        MODEL_DIR,
        "random_forest_model.pkl"
    )
)

joblib.dump(
    label_encoder,
    os.path.join(
        MODEL_DIR,
        "label_encoder.pkl"
    )
)


# ============================================================
# SAVE CONFIGURATION
# ============================================================

config = {
    "target_column": TARGET_COLUMN,
    "features": FEATURE_COLUMNS,
    "classes": class_names.tolist(),

    "ensemble": {
        "xgboost_weight": XGB_WEIGHT,
        "lightgbm_weight": LGB_WEIGHT,
        "random_forest_weight": RF_WEIGHT
    },

    "train_end": TRAIN_END,
    "validation_end": VALIDATION_END,

    "validation_metrics": {
        "xgboost": xgb_metrics,
        "lightgbm": lgb_metrics,
        "random_forest": rf_metrics,
        "ensemble": ensemble_metrics
    },

    "test_metrics": test_metrics
}

with open(
    os.path.join(
        MODEL_DIR,
        "ensemble_config.json"
    ),
    "w"
) as f:

    json.dump(
        config,
        f,
        indent=4,
        default=float
    )


importance.to_csv(
    os.path.join(
        MODEL_DIR,
        "feature_importance.csv"
    ),
    index=False
)


# ============================================================
# COMPLETE
# ============================================================

print("\n" + "=" * 70)
print("TRAINING COMPLETE")
print("=" * 70)

print("\nModels saved to:")
print(MODEL_DIR)

print("\nSaved files:")

print("  xgboost_model.pkl")
print("  lightgbm_model.pkl")
print("  random_forest_model.pkl")
print("  label_encoder.pkl")
print("  ensemble_config.json")
print("  feature_importance.csv")

print("\nFinal Ensemble Test F1:")
print(
    f"{test_metrics['f1_macro']:.4f}"
)

print("\nThermal-X ensemble is ready.")