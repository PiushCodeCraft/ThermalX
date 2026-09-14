import pandas as pd
import numpy as np
import joblib
import time

from xgboost import XGBClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)

print("=" * 70)
print("THERMALX - XGBOOST FIRE PREDICTION")
print("=" * 70)

start_time = time.time()

# ============================================================
# 1. LOAD DATA
# ============================================================

DATASET = "thermalx_future_fire_dataset.csv"

print("\n[1/8] Loading dataset...")

df = pd.read_csv(DATASET)

print("Rows:", len(df))
print("Columns:", len(df.columns))


# ============================================================
# 2. CONVERT TIMESTAMP
# ============================================================

print("\n[2/8] Processing timestamp...")

df["timestamp"] = pd.to_datetime(
    df["timestamp"],
    dayfirst=True,
    errors="coerce"
)

df = df.dropna(subset=["timestamp"])

# Sort chronologically
df = df.sort_values("timestamp").reset_index(drop=True)

print(
    "Date range:",
    df["timestamp"].min(),
    "→",
    df["timestamp"].max()
)


# ============================================================
# 3. FEATURES
# ============================================================

print("\n[3/8] Preparing features...")

features = [
    "latitude",
    "longitude",

    # VIIRS thermal information
    "brightness",
    "bright_t31",
    "brightness_difference",

    # Fire Radiative Power
    "frp_log",

    # Satellite observation geometry
    "scan",
    "track",

    # Time information
    "hour",
    "day",
    "month",
    "day_of_year",
    "day_of_week"
]

# Make sure all columns exist
features = [
    col for col in features
    if col in df.columns
]

print("\nFeatures used:")

for feature in features:
    print("  ✓", feature)


# ============================================================
# 4. CLEAN DATA
# ============================================================

print("\n[4/8] Cleaning data...")

df = df.dropna(
    subset=features + ["future_fire_24h"]
)

X = df[features].copy()

y = df["future_fire_24h"].astype(int)

# Replace infinite values
X = X.replace(
    [np.inf, -np.inf],
    np.nan
)

# Fill missing numeric values
X = X.fillna(
    X.median()
)

print("Clean rows:", len(X))

print("\nTarget distribution:")

print(
    y.value_counts()
)

print("\nTarget percentage:")

print(
    y.value_counts(normalize=True)
    .mul(100)
    .round(2)
)


# ============================================================
# 5. TIME-BASED SPLIT
# ============================================================

print("\n[5/8] Creating time-based split...")

n = len(df)

train_end = int(n * 0.70)

validation_end = int(n * 0.85)


X_train = X.iloc[:train_end]

y_train = y.iloc[:train_end]


X_validation = X.iloc[
    train_end:validation_end
]

y_validation = y.iloc[
    train_end:validation_end
]


X_test = X.iloc[
    validation_end:
]

y_test = y.iloc[
    validation_end:
]


print("\nTraining:", len(X_train))

print("Validation:", len(X_validation))

print("Testing:", len(X_test))


print("\nTraining dates:")
print(
    df["timestamp"].iloc[0],
    "→",
    df["timestamp"].iloc[train_end - 1]
)

print("\nValidation dates:")
print(
    df["timestamp"].iloc[train_end],
    "→",
    df["timestamp"].iloc[validation_end - 1]
)

print("\nTesting dates:")
print(
    df["timestamp"].iloc[validation_end],
    "→",
    df["timestamp"].iloc[-1]
)


# ============================================================
# 6. HANDLE CLASS IMBALANCE
# ============================================================

print("\n[6/8] Calculating class weights...")

negative = (y_train == 0).sum()

positive = (y_train == 1).sum()

scale_pos_weight = negative / positive

print("Class 0:", negative)

print("Class 1:", positive)

print(
    "Scale positive weight:",
    round(scale_pos_weight, 3)
)


# ============================================================
# 7. TRAIN XGBOOST
# ============================================================

print("\n[7/8] Training XGBoost...")
print("This may take several minutes.")
print("-" * 70)

model = XGBClassifier(

    n_estimators=400,

    max_depth=7,

    learning_rate=0.05,

    subsample=0.8,

    colsample_bytree=0.8,

    objective="binary:logistic",

    eval_metric="logloss",

    scale_pos_weight=scale_pos_weight,

    tree_method="hist",

    random_state=42,

    n_jobs=-1
)


model.fit(

    X_train,
    y_train,

    eval_set=[
        (X_validation, y_validation)
    ],

    verbose=50
)


print("\nXGBoost training completed!")


# ============================================================
# 8. TEST MODEL
# ============================================================

print("\n[8/8] Evaluating model...")

probabilities = model.predict_proba(
    X_test
)[:, 1]


# Default threshold
threshold = 0.50

predictions = (
    probabilities >= threshold
).astype(int)


# ============================================================
# METRICS
# ============================================================

accuracy = accuracy_score(
    y_test,
    predictions
)

precision = precision_score(
    y_test,
    predictions,
    zero_division=0
)

recall = recall_score(
    y_test,
    predictions,
    zero_division=0
)

f1 = f1_score(
    y_test,
    predictions,
    zero_division=0
)

roc_auc = roc_auc_score(
    y_test,
    probabilities
)


print("\n")
print("=" * 70)
print("THERMALX MODEL PERFORMANCE")
print("=" * 70)

print(
    f"Accuracy  : {accuracy * 100:.2f}%"
)

print(
    f"Precision : {precision * 100:.2f}%"
)

print(
    f"Recall    : {recall * 100:.2f}%"
)

print(
    f"F1 Score  : {f1 * 100:.2f}%"
)

print(
    f"ROC-AUC   : {roc_auc:.4f}"
)


# ============================================================
# CLASSIFICATION REPORT
# ============================================================

print("\n" + "=" * 70)
print("CLASSIFICATION REPORT")
print("=" * 70)

print(
    classification_report(
        y_test,
        predictions,

        target_names=[
            "No Future Fire",
            "Future Fire"
        ],

        zero_division=0
    )
)


# ============================================================
# CONFUSION MATRIX
# ============================================================

print("\n" + "=" * 70)
print("CONFUSION MATRIX")
print("=" * 70)

cm = confusion_matrix(
    y_test,
    predictions
)

print(cm)

print("\n")
print("                 Predicted")
print("               No Fire  Fire")
print(
    f"Actual No Fire   {cm[0][0]:7d} {cm[0][1]:7d}"
)
print(
    f"Actual Fire      {cm[1][0]:7d} {cm[1][1]:7d}"
)


# ============================================================
# FEATURE IMPORTANCE
# ============================================================

print("\n" + "=" * 70)
print("FEATURE IMPORTANCE")
print("=" * 70)

importance = pd.DataFrame({

    "feature": features,

    "importance":
        model.feature_importances_

})

importance = importance.sort_values(
    "importance",
    ascending=False
)

print(
    importance.to_string(
        index=False
    )
)


# ============================================================
# SAVE MODEL
# ============================================================

print("\n" + "=" * 70)
print("SAVING MODEL")
print("=" * 70)

joblib.dump(
    model,
    "thermalx_xgboost_model.pkl"
)

joblib.dump(
    features,
    "thermalx_features.pkl"
)

print(
    "✓ thermalx_xgboost_model.pkl"
)

print(
    "✓ thermalx_features.pkl"
)


# ============================================================
# FINISH
# ============================================================

elapsed = time.time() - start_time

print("\n" + "=" * 70)

print(
    f"TOTAL TIME: {elapsed / 60:.2f} minutes"
)

print("=" * 70)

print("\nTHERMALX TRAINING COMPLETE!")