# Sugarcane AI Monitoring System 🎋🤖

A professional IoT-AI integrated system for real-time sugarcane quality monitoring and harvest prediction.

## 🚀 Features
- **Live Monitoring**: Real-time sensor data (NIR, Moisture, Temperature) via Socket.IO.
- **AI Prediction**: Neural Network model to predict Brix (Sugar) percentage.
- **Dynamic Harvest Countdown**: Automatically estimates days remaining until peak maturity.
- **Hardware Integration**: Dedicated dashboard for ESP32 hardware management.
- **Data Visualization**: Training history and Confusion Matrix for model evaluation.

## 📁 Project Structure
```text
/backend
  ├── app.py             # Flask API & Socket.IO Server
  ├── simulate_sensor.py # Hardware Simulation Script
  ├── train_model.py     # AI Training Pipeline
  ├── sugarcane_data.csv # Dataset for AI
  ├── plots/             # Training & Evaluation Graphs
  └── sugarcane_model.tflite # Optimized ML Model

/frontend
  ├── src/components/    # React Components (Dashboard, Admin, etc.)
  └── App.jsx            # Main Router
```

## 🛠️ Setup Instructions

### Backend Setup
1. Navigate to backend: `cd backend`
2. Install dependencies: `pip install flask flask-socketio flask-cors tensorflow numpy pandas matplotlib seaborn`
3. Start the server: `python app.py`
4. Start simulation: `python simulate_sensor.py`

### Frontend Setup
1. Navigate to frontend: `cd frontend`
2. Install dependencies: `npm install`
3. Start the app: `npm run dev`

## 📊 ML Metrics
- **Accuracy**: 92%+
- **Threshold**: 19% Brix for Harvest Readiness.

## 📡 Hardware
- Target Device: **ESP32**
- Local IP: `http://192.168.4.1/`
