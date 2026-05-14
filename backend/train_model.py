import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import confusion_matrix, classification_report, accuracy_score, precision_score, recall_score
import seaborn as sns

# 1. Load Dataset
try:
    df = pd.read_csv('sugarcane_data.csv')
except FileNotFoundError:
    print("Dataset not found. Run generate_dataset.py first.")
    exit()

X = df[['nir', 'moisture', 'temp']].values
y = df['brix'].values

# 2. Preprocessing
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 3. Build Model
model = models.Sequential([
    layers.Dense(64, activation='relu', input_shape=(3,)),
    layers.Dense(32, activation='relu'),
    layers.Dense(1)
])

model.compile(optimizer='adam', loss='mse', metrics=['mae'])

# 4. Train Model
print("Starting training...")
history = model.fit(X_train_scaled, y_train, epochs=50, validation_split=0.2, verbose=0)

# 5. Save Model
model.save('sugarcane_model.h5')
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()
with open('sugarcane_model.tflite', 'wb') as f:
    f.write(tflite_model)

# 6. Evaluation (Regression)
y_pred = model.predict(X_test_scaled)

# 7. Classification Metrics (Ready vs Not Ready)
# Threshold: 19% Brix is 'Ready'
y_test_class = (y_test >= 19).astype(int)
y_pred_class = (y_pred >= 19).astype(int)

accuracy = accuracy_score(y_test_class, y_pred_class)
precision = precision_score(y_test_class, y_pred_class)
recall = recall_score(y_test_class, y_pred_class)

print("\n--- Classification Metrics (Threshold: 19% Brix) ---")
print(f"Accuracy: {accuracy:.2f}")
print(f"Precision: {precision:.2f}")
print(f"Recall: {recall:.2f}")

# 8. Generate Confusion Matrix Plot
plt.figure(figsize=(6, 5))
cm = confusion_matrix(y_test_class, y_pred_class)
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=['Not Ready', 'Ready'], yticklabels=['Not Ready', 'Ready'])
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.title('Confusion Matrix (Harvest Readiness)')
plt.savefig('confusion_matrix.png')

# 9. Plot Loss
plt.figure(figsize=(10, 5))
plt.plot(history.history['loss'], label='Train Loss')
plt.plot(history.history['val_loss'], label='Val Loss')
plt.title('Model Training History')
plt.legend()
plt.savefig('training_history.png')

print("All results saved (sugarcane_model.tflite, confusion_matrix.png, training_history.png)")
