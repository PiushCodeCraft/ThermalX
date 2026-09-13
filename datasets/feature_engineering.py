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
# 3. Create day of week
# ============================================================

print("Creating temporal feature...")

# Monday = 0
# Tuesday = 1
# ...
# Sunday = 6

df["day_of_week"] = df["timestamp"].dt.dayofweek


# ============================================================
# 4. Create thermal feature
# ============================================================

print("Creating thermal features...")

# Difference between observed brightness
# and background brightness.

df["brightness_difference"] = (
    df["brightness"] - df["bright_t31"]
)


# ============================================================
# 5. Transform FRP
# ============================================================

# FRP can contain very large values.
# log1p reduces the effect of extreme values
# while keeping zero values valid.

df["frp_log"] = np.log1p(df["frp"])


# ============================================================
# 6. Sort chronologically
# ============================================================

print("Sorting observations chronologically...")

df = df.sort_values(
    by=["timestamp", "latitude", "longitude"]
).reset_index(drop=True)


# ============================================================
# 7. Select only required columns
# ============================================================

required_columns = [
    "latitude",
    "longitude",
    "brightness",
    "bright_t31",
    "frp",
    "scan",
    "track",
    "confidence",
    "daynight",
    "timestamp",
    "hour",
    "day",
    "month",
    "day_of_year",
    "brightness_difference",
    "frp_log",
    "day_of_week"
]


# Check that all required columns exist

missing_columns = [
    column
    for column in required_columns
    if column not in df.columns
]

if missing_columns:

    print("\nERROR: Required columns are missing:")

    for column in missing_columns:
        print(f"  - {column}")

    raise ValueError(
        "Feature engineering cannot continue because "
        "required columns are missing."
    )


# Keep only the required columns

df = df[required_columns]


# ============================================================
# 8. Final validation
# ============================================================

print("\n" + "=" * 60)
print("FEATURE ENGINEERING VALIDATION")
print("=" * 60)

print(f"\nFinal shape: {df.shape}")

print("\nFinal columns:")

for column in df.columns:
    print(f"  {column}")


# ============================================================
# 9. Missing-value check
# ============================================================

missing_values = df.isnull().sum()

print("\nMissing values per column:")

print(missing_values)

total_missing = missing_values.sum()

print(f"\nTotal missing values: {total_missing}")


# ============================================================
# 10. Duplicate check
# ============================================================

duplicates = df.duplicated().sum()

print(f"\nDuplicate rows: {duplicates}")


# ============================================================
# 11. Basic validation
# ============================================================

invalid_coordinates = (
    (~df["latitude"].between(-90, 90))
    |
    (~df["longitude"].between(-180, 180))
).sum()

print(f"Invalid coordinates: {invalid_coordinates}")


invalid_frp = (
    df["frp"] < 0
).sum()

print(f"Invalid FRP values: {invalid_frp}")


invalid_day_of_week = (
    ~df["day_of_week"].between(0, 6)
).sum()

print(
    f"Invalid day_of_week values: "
    f"{invalid_day_of_week}"
)


# ============================================================
# 12. Feature statistics
# ============================================================

print("\n" + "=" * 60)
print("FEATURE STATISTICS")
print("=" * 60)

print("\nThermal features:")

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
# 13. Categorical information
# ============================================================

print("\nConfidence values:")

print(
    df["confidence"].value_counts()
)


print("\nDay/Night values:")

print(
    df["daynight"].value_counts()
)


# ============================================================
# 14. Timestamp range
# ============================================================

print("\nTimestamp range:")

print(
    f"Start: {df['timestamp'].min()}"
)

print(
    f"End:   {df['timestamp'].max()}"
)


# ============================================================
# 15. Save feature-engineered dataset
# ============================================================

df.to_csv(
    OUTPUT_FILE,
    index=False
)


# ============================================================
# 16. Completion message
# ============================================================

print("\n" + "=" * 60)
print("FEATURE ENGINEERING COMPLETE")
print("=" * 60)

print(
    f"\nSaved feature-engineered dataset:"
)

print(OUTPUT_FILE)

print(
    f"\nFinal dataset contains "
    f"{len(df):,} observations and "
    f"{len(df.columns)} features."
)