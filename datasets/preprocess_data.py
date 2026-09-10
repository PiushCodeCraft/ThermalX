import pandas as pd
import numpy as np
from pathlib import Path


# ============================================================
# THERMAL-X
# Data Preprocessing Pipeline
# ============================================================

# ------------------------------------------------------------
# 1. File paths
# ------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent

INPUT_FILE = BASE_DIR / "merged_fire_data_v2.csv"
OUTPUT_FILE = BASE_DIR / "processed_fire_data.csv"


# ------------------------------------------------------------
# 2. Load dataset
# ------------------------------------------------------------

print("=" * 60)
print("THERMAL-X DATA PREPROCESSING")
print("=" * 60)

print("\nLoading dataset...")

df = pd.read_csv(INPUT_FILE)

print(f"Loaded {len(df):,} rows")
print(f"Columns: {len(df.columns)}")


# ------------------------------------------------------------
# 3. Standardize column names
# ------------------------------------------------------------

df.columns = df.columns.str.strip().str.lower()

print("\nColumns:")
print(list(df.columns))


# ------------------------------------------------------------
# 4. Remove completely empty rows
# ------------------------------------------------------------

before = len(df)

df = df.dropna(how="all")

after = len(df)

print(f"\nCompletely empty rows removed: {before - after}")


# ------------------------------------------------------------
# 5. Remove duplicate observations
# ------------------------------------------------------------

before = len(df)

df = df.drop_duplicates()

after = len(df)

print(f"Duplicate rows removed: {before - after}")


# ------------------------------------------------------------
# 6. Convert numerical columns
# ------------------------------------------------------------

numeric_columns = [
    "latitude",
    "longitude",
    "brightness",
    "scan",
    "track",
    "acq_time",
    "bright_t31",
    "frp"
]

for column in numeric_columns:
    df[column] = pd.to_numeric(df[column], errors="coerce")


# ------------------------------------------------------------
# 7. Validate latitude and longitude
# ------------------------------------------------------------

before = len(df)

df = df[
    df["latitude"].between(-90, 90)
    & df["longitude"].between(-180, 180)
]

after = len(df)

print(f"Invalid coordinate rows removed: {before - after}")


# ------------------------------------------------------------
# 8. Validate acquisition time
# ------------------------------------------------------------

# FIRMS acq_time is HHMM format.
# Example:
# 537  -> 05:37
# 1942 -> 19:42
# 2203 -> 22:03

def valid_acq_time(value):
    try:
        value = int(value)

        hour = value // 100
        minute = value % 100

        return 0 <= hour <= 23 and 0 <= minute <= 59

    except (ValueError, TypeError):
        return False


valid_time_mask = df["acq_time"].apply(valid_acq_time)

before = len(df)

df = df[valid_time_mask]

after = len(df)

print(f"Invalid acquisition-time rows removed: {before - after}")


# ------------------------------------------------------------
# 9. Convert acquisition time to HH:MM
# ------------------------------------------------------------

df["acq_time"] = df["acq_time"].astype(int)

df["acq_time_formatted"] = (
    df["acq_time"]
    .astype(str)
    .str.zfill(4)
    .str[:2]
    + ":"
    + df["acq_time"]
    .astype(str)
    .str.zfill(4)
    .str[2:]
)


# ------------------------------------------------------------
# 10. Convert acquisition date
# ------------------------------------------------------------

df["acq_date"] = pd.to_datetime(
    df["acq_date"],
    errors="coerce"
)


# ------------------------------------------------------------
# 11. Create timestamp
# ------------------------------------------------------------

df["timestamp"] = pd.to_datetime(
    df["acq_date"].dt.strftime("%Y-%m-%d")
    + " "
    + df["acq_time_formatted"],
    errors="coerce"
)


# ------------------------------------------------------------
# 12. Remove rows with invalid dates/timestamps
# ------------------------------------------------------------

before = len(df)

df = df.dropna(subset=["acq_date", "timestamp"])

after = len(df)

print(f"Invalid date/timestamp rows removed: {before - after}")


# ------------------------------------------------------------
# 13. Clean categorical columns
# ------------------------------------------------------------

categorical_columns = [
    "satellite",
    "instrument",
    "confidence",
    "version",
    "daynight"
]

for column in categorical_columns:
    df[column] = df[column].astype(str).str.strip().str.upper()


# ------------------------------------------------------------
# 14. Standardize confidence values
# ------------------------------------------------------------

confidence_mapping = {
    "L": "LOW",
    "N": "NOMINAL",
    "H": "HIGH"
}

df["confidence"] = df["confidence"].map(confidence_mapping)


# ------------------------------------------------------------
# 15. Validate FRP
# ------------------------------------------------------------

before = len(df)

df = df[df["frp"] >= 0]

after = len(df)

print(f"Invalid FRP rows removed: {before - after}")


# ------------------------------------------------------------
# 16. Validate brightness temperatures
# ------------------------------------------------------------

# Brightness values should be finite numerical values.

before = len(df)

df = df[
    np.isfinite(df["brightness"])
    & np.isfinite(df["bright_t31"])
]

after = len(df)

print(f"Invalid brightness rows removed: {before - after}")


# ------------------------------------------------------------
# 17. Sort chronologically
# ------------------------------------------------------------

df = df.sort_values(
    by=["timestamp", "latitude", "longitude"]
).reset_index(drop=True)


# ------------------------------------------------------------
# 18. Create unique observation ID
# ------------------------------------------------------------

df.insert(
    0,
    "observation_id",
    ["OBS-" + str(i).zfill(8) for i in range(1, len(df) + 1)]
)


# ------------------------------------------------------------
# 19. Create basic thermal features
# ------------------------------------------------------------

# Difference between the detected brightness temperature
# and the background/31 micron brightness temperature.

df["brightness_difference"] = (
    df["brightness"] - df["bright_t31"]
)


# ------------------------------------------------------------
# 20. Create day/night numerical feature
# ------------------------------------------------------------

df["is_night"] = (
    df["daynight"] == "N"
).astype(int)


# ------------------------------------------------------------
# 21. Create basic temporal features
# ------------------------------------------------------------

df["year"] = df["timestamp"].dt.year
df["month"] = df["timestamp"].dt.month
df["day"] = df["timestamp"].dt.day
df["hour"] = df["timestamp"].dt.hour
df["day_of_year"] = df["timestamp"].dt.dayofyear


# ------------------------------------------------------------
# 22. Final column organization
# ------------------------------------------------------------

preferred_columns = [
    "observation_id",

    "latitude",
    "longitude",

    "timestamp",
    "acq_date",
    "acq_time",

    "brightness",
    "bright_t31",
    "brightness_difference",

    "frp",
    "scan",
    "track",

    "satellite",
    "instrument",
    "confidence",
    "version",
    "daynight",
    "is_night",

    "year",
    "month",
    "day",
    "hour",
    "day_of_year"
]

# Keep only columns that actually exist
preferred_columns = [
    column for column in preferred_columns
    if column in df.columns
]

df = df[preferred_columns]


# ------------------------------------------------------------
# 23. Final validation
# ------------------------------------------------------------

print("\n" + "=" * 60)
print("FINAL VALIDATION")
print("=" * 60)

print(f"\nFinal shape: {df.shape}")

print("\nMissing values:")
print(df.isnull().sum())

print(f"\nTotal missing values: {df.isnull().sum().sum()}")

print(f"\nDuplicate rows: {df.duplicated().sum()}")

print(
    f"\nLatitude range: "
    f"{df['latitude'].min():.4f} to {df['latitude'].max():.4f}"
)

print(
    f"Longitude range: "
    f"{df['longitude'].min():.4f} to {df['longitude'].max():.4f}"
)

print(
    f"\nTimestamp range: "
    f"{df['timestamp'].min()} → {df['timestamp'].max()}"
)

print("\nConfidence distribution:")
print(df["confidence"].value_counts())

print("\nDay/Night distribution:")
print(df["daynight"].value_counts())


# ------------------------------------------------------------
# 24. Save processed dataset
# ------------------------------------------------------------

df.to_csv(
    OUTPUT_FILE,
    index=False
)

print("\n" + "=" * 60)
print("PREPROCESSING COMPLETE")
print("=" * 60)

print(f"\nSaved processed dataset:")
print(OUTPUT_FILE)