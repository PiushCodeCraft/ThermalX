# 🔥 THERMAL-X ML PIPELINE
## Complete Execution Order

This document explains which Python file should be executed first
and which file should be executed next.

---

# STEP 0 — Install ML Libraries

Run this only once on the computer.

<!-- powershell -->
py -m pip install xgboost lightgbm scikit-learn pandas numpy joblib openpyxl

# STEP 1 — Check Raw Data

File: check_data.py

# STEP 2 — Merge Historical Data

File:   merge_data.py

# STEP 3 — Preprocess Data

File:   preprocess_data.py

# STEP 4 — Feature Engineering

File:   feature_engineering.py

# STEP 5 — Create Future Fire Prediction Target

File:   create_future_fire_target.py

# STEP 6 — Train Single XGBoost Model

File:   train_model.py

# STEP 7 — Train Ensemble Model

File:   train_ensemble.py
