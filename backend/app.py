from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import numpy as np
import time

# Note: You need to install these: pip install flask flask-socketio tflite-runtime numpy flask-cors

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
CORS(app) # Enable CORS for all routes
socketio = SocketIO(app, cors_allowed_origins="*")

# --- ML MODEL CONFIGURATION ---
MODEL_PATH = "sugarcane_model.tflite" # Put your .tflite file name here

try:
    import tflite_runtime.interpreter as tflite
    interpreter = tflite.Interpreter(model_path=MODEL_PATH)
    interpreter.allocate_tensors()
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    print(f"Model loaded successfully from {MODEL_PATH}")
    MODEL_LOADED = True
except Exception as e:
    print(f"Warning: Could not load {MODEL_PATH}. Using dummy logic. Error: {e}")
    MODEL_LOADED = False

def run_tflite_inference(data):
    if not MODEL_LOADED:
        # Dummy Logic if model is missing
        nir, moisture, temp = data
        prediction = (nir / 40) - (moisture / 15) + (temp / 20)
        return round(prediction, 2)

    try:
        # Actual TFLite Inference
        # Note: Data must be pre-processed if you used a scaler in training
        input_data = np.array([data], dtype=np.float32)
        interpreter.set_tensor(input_details[0]['index'], input_data)
        interpreter.invoke()
        output_data = interpreter.get_tensor(output_details[0]['index'])
        return round(float(output_data[0][0]), 2)
    except Exception as e:
        print(f"Inference error: {e}")
        return 0.0

@app.route('/')
def index():
    return "Sugarcane AI Backend is running!"

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        features = [
            float(data.get('nir', 0)),
            float(data.get('moisture', 0)),
            float(data.get('temp', 0))
        ]
        prediction = run_tflite_inference(features)
        return jsonify({"brix": prediction, "status": "success"})
    except Exception as e:
        return jsonify({"error": str(e), "status": "error"}), 400

@socketio.on('sensor_data')
def handle_sensor_data(data):
    """
    Handles incoming sensor data from ESP32 or other sources
    and broadcasts it to the frontend.
    """
    print(f"Received sensor data: {data}")
    # Broadcast to all connected clients (the dashboard)
    emit('update_dashboard', data, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
