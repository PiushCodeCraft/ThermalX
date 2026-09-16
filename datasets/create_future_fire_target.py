import pandas as pd
import numpy as np

from sklearn.neighbors import BallTree


# ============================================================
# SETTINGS
# ============================================================

CSV_PATH = "feature_engineered_fire_data.csv"

# Distance around current hotspot
RADIUS_KM = 5

# Future prediction window
FUTURE_HOURS = 24

# Minimum FRP considered significant
MIN_FUTURE_FRP = 10


# ============================================================
# LOAD DATA
# ============================================================

df = pd.read_csv(CSV_PATH)

print("Original dataset:", df.shape)


# ============================================================
# CONVERT TIMESTAMP
# ============================================================

df["timestamp"] = pd.to_datetime(
    df["timestamp"],
    dayfirst=True,
    errors="coerce"
)

df = df.dropna(
    subset=[
        "timestamp",
        "latitude",
        "longitude"
    ]
)

df = df.sort_values("timestamp").reset_index(drop=True)


# ============================================================
# CLEAN NUMERIC DATA
# ============================================================

df["latitude"] = pd.to_numeric(
    df["latitude"],
    errors="coerce"
)

df["longitude"] = pd.to_numeric(
    df["longitude"],
    errors="coerce"
)

df["frp"] = pd.to_numeric(
    df["frp"],
    errors="coerce"
)

df = df.dropna(
    subset=[
        "latitude",
        "longitude",
        "frp"
    ]
)


# ============================================================
# PREPARE COORDINATES
# ============================================================

coordinates = np.radians(
    df[
        [
            "latitude",
            "longitude"
        ]
    ].values
)


# Earth's radius
EARTH_RADIUS_KM = 6371.0


# ============================================================
# BUILD SPATIAL INDEX
# ============================================================

tree = BallTree(
    coordinates,
    metric="haversine"
)


# ============================================================
# CREATE TARGET
# ============================================================

target = np.zeros(
    len(df),
    dtype=int
)


print("\nCreating future-fire target...")


for i in range(len(df)):

    current_time = df.loc[
        i,
        "timestamp"
    ]

    future_start = current_time

    future_end = (
        current_time
        + pd.Timedelta(
            hours=FUTURE_HOURS
        )
    )

    # --------------------------------------------------------
    # Find observations within radius
    # --------------------------------------------------------

    nearby_indices = tree.query_radius(
        coordinates[i:i+1],
        r=RADIUS_KM / EARTH_RADIUS_KM
    )[0]

    # --------------------------------------------------------
    # Remove current observation
    # --------------------------------------------------------

    nearby_indices = nearby_indices[
        nearby_indices != i
    ]

    if len(nearby_indices) == 0:
        continue

    # --------------------------------------------------------
    # Future observations only
    # --------------------------------------------------------

    future_rows = df.iloc[
        nearby_indices
    ]

    future_rows = future_rows[
        (future_rows["timestamp"] > future_start)
        &
        (future_rows["timestamp"] <= future_end)
    ]

    # --------------------------------------------------------
    # Significant future fire?
    # --------------------------------------------------------

    if (
        len(future_rows) > 0
        and
        future_rows["frp"].max()
        >= MIN_FUTURE_FRP
    ):

        target[i] = 1


# ============================================================
# ADD TARGET
# ============================================================

df["future_fire_24h"] = target


# ============================================================
# SHOW RESULTS
# ============================================================

print("\nTarget created!")

print(
    df[
        "future_fire_24h"
    ].value_counts()
)

print("\nTarget percentage:")

print(
    df[
        "future_fire_24h"
    ]
    .value_counts(
        normalize=True
    )
    * 100
)


# ============================================================
# SAVE
# ============================================================

OUTPUT_PATH = (
    "thermalx_future_fire_dataset.csv"
)

df.to_csv(
    OUTPUT_PATH,
    index=False
)

print("\nSaved:")
print(OUTPUT_PATH)