import pandas as pd
import numpy as np
from pathlib import Path


# ============================================================
# THERMAL-X
# FEATURE ENGINEERING
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

INPUT_FILE = BASE_DIR / "processed_fire_data.csv"
OUTPUT_FILE = BASE_DIR / "feature_engineered_fire_data.csv"


# ============================================================
# EXACT 15 ML FEATURES
# ============================================================

FEATURES = [
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
    "daynight"
]


# ============================================================
# 1. Load processed data
# ============================================================

print("=" * 60)
print("THERMAL-X FEATURE ENGINEERING")
print("=" * 60)

print("\nLoading processed dataset...")

df = pd.read_csv(INPUT_FILE)

print(f"Rows loaded: {len(df):,}")
print(f"Columns loaded: {len(df.columns)}")


# ============================================================
# 2. Convert timestamp
# ============================================================

print("\nConverting timestamp...")

df["timestamp"] = pd.to_datetime(
    df["timestamp"],
    errors="coerce"
)


# ============================================================
# 3. Create temporal features
# ============================================================

print("Creating temporal features...")

# Monday = 0
# Tuesday = 1
# ...
# Sunday = 6

df["day_of_week"] = df["timestamp"].dt.dayofweek


# ============================================================
# 4. Create thermal feature
# ============================================================

print("Creating thermal features...")

df["brightness_difference"] = (
    df["brightness"] - df["bright_t31"]
)


# ============================================================
# 5. Transform FRP
# ============================================================

print("Creating FRP log feature...")

# Protect against negative FRP values
df["frp_log"] = np.log1p(
    np.maximum(df["frp"], 0)
)


# ============================================================
# 6. Sort chronologically
# ============================================================

print("Sorting observations chronologically...")

df = df.sort_values(
    by=["timestamp", "latitude", "longitude"]
).reset_index(drop=True)


# ============================================================
# 7. Check required features
# ============================================================

print("\nChecking required features...")

missing_columns = [
    feature
    for feature in FEATURES
    if feature not in df.columns
]

if missing_columns:

    print("\nERROR: Required features are missing:")

    for feature in missing_columns:
        print(f"  - {feature}")

    raise ValueError(
        "Feature engineering cannot continue because "
        "required features are missing."
    )


# ============================================================
# 8. Keep ONLY the 15 ML features
# ============================================================

df = df[FEATURES]


# ============================================================
# 9. Final validation
# ============================================================

print("\n" + "=" * 60)
print("FEATURE ENGINEERING VALIDATION")
print("=" * 60)

print(f"\nFinal shape: {df.shape}")

print("\nFinal 15 features:")

for i, feature in enumerate(df.columns, start=1):
    print(f"{i:2}. {feature}")


# ============================================================
# 10. Verify exact feature order
# ============================================================

if list(df.columns) != FEATURES:

    raise ValueError(
        "Feature order does not match the ML FEATURES list."
    )

print("\n✓ Feature order verified.")


# ============================================================
# 11. Missing-value check
# ============================================================

missing_values = df.isnull().sum()

print("\nMissing values per feature:")

print(missing_values)

total_missing = missing_values.sum()

print(f"\nTotal missing values: {total_missing}")


# ============================================================
# 12. Duplicate check
# ============================================================

duplicates = df.duplicated().sum()

print(f"\nDuplicate rows: {duplicates}")


# ============================================================
# 13. Coordinate validation
# ============================================================

invalid_coordinates = (
    (~df["latitude"].between(-90, 90))
    |
    (~df["longitude"].between(-180, 180))
).sum()

print(f"Invalid coordinates: {invalid_coordinates}")


# ============================================================
# 14. FRP validation
# ============================================================

invalid_frp = (
    df["frp"] < 0
).sum()

print(f"Invalid FRP values: {invalid_frp}")


# ============================================================
# 15. Day-of-week validation
# ============================================================

invalid_day_of_week = (
    ~df["day_of_week"].between(0, 6)
).sum()

print(
    f"Invalid day_of_week values: "
    f"{invalid_day_of_week}"
)


# ============================================================
# 16. Feature statistics
# ============================================================

print("\n" + "=" * 60)
print("FEATURE STATISTICS")
print("=" * 60)

print(
    df[
        [
            "brightness",
            "bright_t31",
            "brightness_difference",
            "frp",
            "frp_log"
        ]
    ].describe()
)


# ============================================================
# 17. Day/Night information
# ============================================================

print("\nDay/Night values:")

print(
    df["daynight"].value_counts()
)


# ============================================================
# 18. Save dataset
# ============================================================

print("\nSaving feature-engineered dataset...")

df.to_csv(
    OUTPUT_FILE,
    index=False
)


# ============================================================
# 19. Completion
# ============================================================

print("\n" + "=" * 60)
print("FEATURE ENGINEERING COMPLETE")
print("=" * 60)

print(f"\nSaved: {OUTPUT_FILE}")

print(
    f"\nFinal dataset contains "
    f"{len(df):,} observations and "
    f"{len(df.columns)} ML features."
)