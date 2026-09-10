import pandas as pd

# Load all three files
files = ["2024_01_12.xlsx", "2025_01_12.xlsx", "2026_01_09.xlsx"]
dfs = [pd.read_excel(f) for f in files]

# Combine them into one
merged = pd.concat(dfs, ignore_index=True)

# Sort chronologically by date and time
merged = merged.sort_values(['acq_date', 'acq_time']).reset_index(drop=True)

# Quick check before saving
print("Merged shape:", merged.shape)
print("Duplicate rows:", merged.duplicated().sum())
print("Missing values:", merged.isnull().sum().sum())

# Save as CSV (not xlsx!)

merged.to_csv("merged_fire_data_v2.csv", index=False)
print("Saved merged_fire_data_v2.csv")