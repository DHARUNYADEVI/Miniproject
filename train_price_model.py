# backend/train_price_model.py
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
from joblib import dump
import os

DATA_PATH = os.path.join("data", "prices_history.csv")
MODEL_PATH = os.path.join("data", "price_model.joblib")
COLS_PATH = os.path.join("data", "price_model_columns.joblib")

def main():
    # 1. Load CSV
    df = pd.read_csv(DATA_PATH)

    # 2. Convert date to numeric features
    df["date"] = pd.to_datetime(df["date"])
    df["day"] = df["date"].dt.day
    df["month"] = df["date"].dt.month
    df["year"] = df["date"].dt.year

    # 3. One-hot encode categorical features
    df = pd.get_dummies(df, columns=["product_id", "retailer"], drop_first=True)

    # 4. Split features/target
    X = df.drop(columns=["price", "date"])
    y = df["price"]

    # 5. Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # 6. Train model
    model = RandomForestRegressor(
        n_estimators=200,
        random_state=42
    )
    model.fit(X_train, y_train)

    # 7. Evaluate
    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    print("Mean Absolute Error:", mae)

    # 8. Save model + column names for inference
    dump(model, MODEL_PATH)
    dump(list(X.columns), COLS_PATH)
    print("Saved model to:", MODEL_PATH)
    print("Saved columns to:", COLS_PATH)

if __name__ == "__main__":
    main()
