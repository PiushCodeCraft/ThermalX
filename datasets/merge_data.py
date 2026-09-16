import pandas as pd

# Load all four files
files = [
    "2024_01_12.xlsx",
    "2025_01_12.xlsx",
    "2026_01_09.xlsx",
    "2026_sept.xlsx"
]

dfs = [pd.read_excel(f) for f in files]

# Combine all files
merged = pd.concat(dfs, ignore_index=True)

# Convert date/time to proper formats before sorting
merged["acq_date"] = pd.to_datetime(
    merged["acq_date"],
    errors="coerce"
)

merged["acq_time"] = pd.to_numeric(
    merged["acq_time"],
    errors="coerce"
)

# Sort chronologically
merged = merged.sort_values(
    ["acq_date", "acq_time"]
).reset_index(drop=True)

# Quick checks
print("Merged shape:", merged.shape)
print("Duplicate rows:", merged.duplicated().sum())
print("Missing values:", merged.isnull().sum().sum())

# Show missing values by column
print("\nMissing values by column:")
print(merged.isnull().sum())

# Save as CSV
merged.to_csv(
    "merged_fire_data_v2.csv",
    index=False
)

print("\nSaved: merged_fire_data_v2.csv")