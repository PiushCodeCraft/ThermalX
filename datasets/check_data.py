import pandas as pd

# Load your merged dataset (update path if it's saved elsewhere)
df = pd.read_csv(r"merged_fire_data_v2.csv")

# 1. Shape
print(f"Shape: {df.shape[0]} rows, {df.shape[1]} columns\n")

# 2. Missing values per column
print("Missing values per column:")
print(df.isnull().sum())
print(f"\nTotal missing values: {df.isnull().sum().sum()}\n")

# 3. Duplicate rows (exact copies)
print(f"Duplicate rows: {df.duplicated().sum()}\n")

# 4. Data types (catches columns that got read in as the wrong type)
print("Data types:")
print(df.dtypes)
print()

# 5. Summary stats — helps spot impossible values (negative FRP, etc.)
print("Summary statistics:")
print(df.describe())
print()

# 6. Unique values in categorical columns — helps spot typos/bad entries
for col in ['satellite', 'instrument', 'confidence', 'version', 'daynight']:
    print(f"{col}: {df[col].unique()}")

# 7. Coordinates outside India's rough bounding box
bad_coords = df[(df['latitude'] < 6) | (df['latitude'] > 38) |
                (df['longitude'] < 68) | (df['longitude'] > 98)]
print(f"\nOut-of-bounds coordinates: {len(bad_coords)}")

# 8. acq_time should be a valid HHMM value (0–2359)
bad_time = df[(df['acq_time'] < 0) | (df['acq_time'] > 2359)]
print(f"Invalid acq_time values: {len(bad_time)}")