import joblib
from pathlib import Path

MODEL_DIR = Path(r"D:\Hackthon💻\SIH\project\ThermalX\models")

print("=" * 60)
print("THERMAL-X PKL FILE CHECK")
print("=" * 60)

pkl_files = list(MODEL_DIR.glob("*.pkl"))

if not pkl_files:
    print("\nNo .pkl files found!")
else:
    print(f"\nFound {len(pkl_files)} PKL file(s):")

    for pkl_file in pkl_files:

        print("\n" + "=" * 60)
        print("FILE:", pkl_file.name)
        print("=" * 60)

        try:
            obj = joblib.load(pkl_file)

            print("Object type:", type(obj))

            # Number of features
            if hasattr(obj, "n_features_in_"):
                print("Number of input features:",
                      obj.n_features_in_)

            # Feature names
            if hasattr(obj, "feature_names_in_"):
                print("\nFeature names:")
                for feature in obj.feature_names_in_:
                    print("  -", feature)

            # Classes
            if hasattr(obj, "classes_"):
                print("\nClasses:")
                print(obj.classes_)

            # Model parameters
            if hasattr(obj, "get_params"):
                print("\nModel parameters:")
                print(obj.get_params())

        except Exception as e:
            print("ERROR:", e)