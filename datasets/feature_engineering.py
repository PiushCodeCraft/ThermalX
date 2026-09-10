import pandas as pd
import numpy as np
from pathlib import Path


# ============================================================
# THERMAL-X
# Feature Engineering
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

df["timestamp"] = pd.to_datetime(
    df["timestamp"],
    errors="coerce"
)


# ============================================================
# 3. Temporal features
# ============================================================

print("\nCreating temporal features...")

df["day_of_week"] = df["timestamp"].dt.dayofweek

df["is_weekend"] = (
    df["day_of_week"] >= 5
).astype(int)


# ============================================================
# 4. Cyclical time features
# ============================================================

# Time is cyclical:
#
# 23:00 and 00:00 are close in reality,
# but numerically 23 and 0 are far apart.
#
# Sin/Cos encoding solves this problem.

df["hour_sin"] = np.sin(
    2 * np.pi * df["hour"] / 24
)

df["hour_cos"] = np.cos(
    2 * np.pi * df["hour"] / 24
)


df["day_of_year_sin"] = np.sin(
    2 * np.pi * df["day_of_year"] / 365
)

df["day_of_year_cos"] = np.cos(
    2 * np.pi * df["day_of_year"] / 365
)


# ============================================================
# 5. Thermal features
# ============================================================

print("Creating thermal features...")

# Difference between fire-channel brightness
# and thermal background.

df["brightness_difference"] = (
    df["brightness"] - df["bright_t31"]
)


# FRP can be highly skewed.
# log1p reduces the effect of very large FRP values.

df["frp_log"] = np.log1p(df["frp"])


# Brightness difference can also be transformed.

df["brightness_difference_abs"] = (
    df["brightness_difference"].abs()
)


# ============================================================
# 6. Basic spatial features
# ============================================================

print("Creating spatial features...")

# Latitude converted to radians.

lat_rad = np.radians(df["latitude"])

# Approximate distance from the equator.
# This is NOT used as a classification label.
# It is simply a derived geographic feature.

EARTH_RADIUS_KM = 6371.0

df["latitude_distance_km"] = (
    EARTH_RADIUS_KM * lat_rad
)


# ============================================================
# 7. Data quality indicators
# ============================================================

print("Creating data-quality features...")

df["has_high_confidence"] = (
    df["confidence"] == "HIGH"
).astype(int)

df["has_nominal_confidence"] = (
    df["confidence"] == "NOMINAL"
).astype(int)

df["has_low_confidence"] = (
    df["confidence"] == "LOW"
).astype(int)


# ============================================================
# 8. Satellite observation features
# ============================================================

df["is_day"] = (
    df["daynight"] == "D"
).astype(int)


# ============================================================
# 9. Sort by time
# ============================================================

df = df.sort_values(
    by=["timestamp", "latitude", "longitude"]
).reset_index(drop=True)


# ============================================================
# 10. Final validation
# ============================================================

print("\n" + "=" * 60)
print("FEATURE ENGINEERING VALIDATION")
print("=" * 60)

print(f"\nFinal shape: {df.shape}")

print("\nNew columns:")

new_columns = [
    "day_of_week",
    "is_weekend",
    "hour_sin",
    "hour_cos",
    "day_of_year_sin",
    "day_of_year_cos",
    "frp_log",
    "brightness_difference_abs",
    "latitude_distance_km",
    "has_high_confidence",
    "has_nominal_confidence",
    "has_low_confidence",
    "is_day"
]

for column in new_columns:
    print(f"  {column}")


# ============================================================
# 11. Missing-value check
# ============================================================

missing = df.isnull().sum().sum()

print(f"\nTotal missing values: {missing}")


# ============================================================
# 12. Duplicate check
# ============================================================

duplicates = df.duplicated().sum()

print(f"Duplicate rows: {duplicates}")


# ============================================================
# 13. Feature statistics
# ============================================================

print("\nThermal feature statistics:")

print(
    df[
        [
            "brightness",
            "bright_t31",
            "brightness_difference",
            "brightness_difference_abs",
            "frp",
            "frp_log"
        ]
    ].describe()
)


# ============================================================
# 14. Save feature-engineered dataset
# ============================================================

df.to_csv(
    OUTPUT_FILE,
    index=False
)

print("\n" + "=" * 60)
print("FEATURE ENGINEERING COMPLETE")
print("=" * 60)

print(f"\nSaved:")
print(OUTPUT_FILE)