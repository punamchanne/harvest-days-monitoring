from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import numpy as np
import time
import os
from dotenv import load_dotenv
from pymongo import MongoClient

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'secret!')
CORS(app) # Enable CORS for all routes
socketio = SocketIO(app, cors_allowed_origins="*")

# --- MONGODB DATABASE CONFIGURATION ---
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/harvest_monitoring")
print(f"Connecting to MongoDB at: {MONGO_URI}")
client = MongoClient(MONGO_URI)
db = client.get_database() # Grabs database name from the URI
users_collection = db['users']
history_collection = db['history']

def init_db():
    try:
        # Check if database has any users, otherwise seed with default values
        if users_collection.count_documents({}) == 0:
            default_users = [
                {
                    'id': 1,
                    'role': 'farmer',
                    'username': 'vijaykadam@1977',
                    'password': 'kadam@123',
                    'name': 'Vijay Kadam',
                    'phone': '+91 9800000010',
                    'location': 'Pune West, Maharashtra',
                    'area': '12 Acres',
                    'variety': 'Co 86032',
                    'brix': '21.2%',
                    'status': 'Ready to Harvest',
                    'harvest_date': '20-Oct-2026'
                },
                {
                    'id': 2,
                    'role': 'farmer',
                    'username': 'mahadevpawar@1944',
                    'password': 'pawar@123',
                    'name': 'Mahadev Pawar',
                    'phone': '+91 9800000022',
                    'location': 'Satara North, Maharashtra',
                    'area': '8 Acres',
                    'variety': 'CoC 671',
                    'brix': '16.5%',
                    'status': 'In Growth',
                    'harvest_date': '15-Nov-2026'
                },
                {
                    'id': 3,
                    'role': 'farmer',
                    'username': 'girishtaware@1971',
                    'password': 'taware@123',
                    'name': 'Girish Taware',
                    'phone': '+91 9800000045',
                    'location': 'Sangli East, Maharashtra',
                    'area': '25 Acres',
                    'variety': 'Co 86032',
                    'brix': '20.8%',
                    'status': 'Ready to Harvest',
                    'harvest_date': '22-Oct-2026'
                },
                {
                    'id': 4,
                    'role': 'farmer',
                    'username': 'vijaysingh@1988',
                    'password': 'singh@123',
                    'name': 'Vijay Singh',
                    'phone': '+91 9800000088',
                    'location': 'Nashik Central, Maharashtra',
                    'area': '15 Acres',
                    'variety': 'Co 0265',
                    'brix': '14.2%',
                    'status': 'In Growth',
                    'harvest_date': '05-Dec-2026'
                },
                {
                    'id': 5,
                    'role': 'factory',
                    'username': 'factory_admin',
                    'password': 'factory123',
                    'name': 'Sahyadri Sugar Factory',
                    'phone': '+91 202345678',
                    'location': 'Kolhapur, Maharashtra',
                    'area': '',
                    'variety': '',
                    'brix': '',
                    'status': '',
                    'harvest_date': ''
                }
            ]
            users_collection.insert_many(default_users)
            print("Successfully seeded MongoDB database with default users.")
        else:
            print("MongoDB already contains user records. Skipping user seeding.")
            
        # Seed default history logs if empty
        if history_collection.count_documents({}) == 0:
            default_history = [
                {
                    'username': 'vijaykadam@1977',
                    'timestamp': '2026-05-18 10:30',
                    'brix': '20.1%',
                    'nir': 615.0,
                    'moisture': 46.0,
                    'temp': 29.8,
                    'status': 'Ready to Harvest',
                    'harvest_date': 'Ready to Harvest'
                },
                {
                    'username': 'vijaykadam@1977',
                    'timestamp': '2026-05-17 14:15',
                    'brix': '19.5%',
                    'nir': 622.0,
                    'moisture': 44.0,
                    'temp': 31.2,
                    'status': 'Ready to Harvest',
                    'harvest_date': 'Ready to Harvest'
                },
                {
                    'username': 'vijaykadam@1977',
                    'timestamp': '2026-05-16 09:45',
                    'brix': '18.2%',
                    'nir': 630.0,
                    'moisture': 50.0,
                    'temp': 28.6,
                    'status': 'In Growth',
                    'harvest_date': 'In 12 Days'
                },
                {
                    'username': 'vijaykadam@1977',
                    'timestamp': '2026-05-15 16:20',
                    'brix': '16.8%',
                    'nir': 642.0,
                    'moisture': 52.0,
                    'temp': 27.4,
                    'status': 'In Growth',
                    'harvest_date': 'In 21 Days'
                }
            ]
            history_collection.insert_many(default_history)
            print("Successfully seeded MongoDB history collection with default logs.")
    except Exception as e:
        print(f"Error seeding MongoDB: {e}")

init_db()

# --- ML MODEL CONFIGURATION ---
MODEL_PATH = os.path.join(os.path.dirname(__file__), "sugarcane_model.tflite")

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
        # Realistic Agriculture Dummy Logic mapping to Brix range 13.5% to 22.5%
        nir, moisture, temp = data
        # Lower moisture concentrates sugars (raises brix). Higher temp and NIR values map to better quality.
        base_brix = 18.0
        moisture_factor = (50.0 - moisture) * 0.18
        nir_factor = (nir - 620.0) * 0.06
        temp_factor = (temp - 29.0) * 0.12
        
        prediction = base_brix + moisture_factor + nir_factor + temp_factor
        prediction = max(13.5, min(22.5, prediction))
        return round(prediction, 2)

    try:
        # Actual TFLite Inference
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
    return "Smart Sugarcane Quality Monitoring and Prediction Device Backend is running with MongoDB Compass!"

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        username = data.get('username') # optional user association
        features = [
            float(data.get('nir', 0)),
            float(data.get('moisture', 0)),
            float(data.get('temp', 0))
        ]
        prediction = run_tflite_inference(features)
        
        # Calculate status and harvest date dynamically
        status = 'MATURE (Peak)' if prediction >= 19.0 else 'In Growth'
        days_left = max(0, int((20 - prediction) / 0.15)) if prediction < 19.0 else 0
        
        # Format harvest date text
        if status == 'MATURE (Peak)':
            harvest_date = 'Ready to Harvest'
            status_text = 'Ready to Harvest'
        else:
            harvest_date = f"In {days_left} Days"
            status_text = 'In Growth'

        # If username is provided, update their database record automatically!
        if username:
            users_collection.update_one(
                {'username': username, 'role': 'farmer'},
                {'$set': {
                    'brix': f"{prediction}%",
                    'status': status_text,
                    'harvest_date': harvest_date
                }}
            )
            
            # Save history entry in MongoDB
            import datetime
            history_record = {
                'username': username,
                'timestamp': datetime.datetime.now().strftime('%Y-%m-%d %H:%M'),
                'brix': f"{prediction}%",
                'nir': float(data.get('nir', 0)),
                'moisture': float(data.get('moisture', 0)),
                'temp': float(data.get('temp', 0)),
                'status': status_text,
                'harvest_date': harvest_date
            }
            try:
                history_collection.insert_one(history_record)
                print(f"Logged sensor history for {username}")
            except Exception as ex:
                print(f"Error logging sensor history: {ex}")

        return jsonify({
            "brix": prediction, 
            "status": "success",
            "prediction_status": status_text,
            "harvest_date": harvest_date
        })
    except Exception as e:
        return jsonify({"error": str(e), "status": "error"}), 400

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.json
        role = data.get('role')
        username = data.get('username')
        password = data.get('password')
        name = data.get('name')
        phone = data.get('phone', '')
        location = data.get('location', '')
        area = data.get('area', '')
        variety = data.get('variety', '')

        if not role or not username or not password or not name:
            return jsonify({"status": "error", "message": "Missing required fields"}), 400

        # Check if username already exists
        if users_collection.find_one({'username': username}):
            return jsonify({"status": "error", "message": "Username already exists"}), 400

        # Generate next dynamic integer id
        max_user = users_collection.find_one(sort=[("id", -1)])
        next_id = (max_user["id"] + 1) if (max_user and "id" in max_user) else 1

        new_user = {
            'id': next_id,
            'role': role,
            'username': username,
            'password': password,
            'name': name,
            'phone': phone,
            'location': location,
            'area': area,
            'variety': variety,
            'brix': '0.0%',
            'status': 'In Growth',
            'harvest_date': 'TBD'
        }
        
        users_collection.insert_one(new_user)
        new_user.pop('_id', None) # remove mongo object id from response dict
        new_user.pop('password', None) # hide password

        return jsonify({"status": "success", "user": new_user})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        role = data.get('role')
        username = data.get('username')
        password = data.get('password')

        if not role or not username or not password:
            return jsonify({"status": "error", "message": "Missing credentials"}), 400

        user = users_collection.find_one({
            'role': role,
            'username': username,
            'password': password
        })
        
        if not user:
            return jsonify({"status": "error", "message": "Invalid username, password, or role"}), 401
        
        user['_id'] = str(user['_id'])
        user.pop('password', None)

        return jsonify({"status": "success", "user": user})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/farmers', methods=['GET'])
def get_farmers():
    try:
        farmers = list(users_collection.find({'role': 'farmer'}))
        for f in farmers:
            f['_id'] = str(f['_id'])
            f.pop('password', None)
        return jsonify({"status": "success", "farmers": farmers})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/farmers/add', methods=['POST'])
def add_farmer():
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password', 'farmer@123')
        name = data.get('name')
        phone = data.get('phone', '')
        location = data.get('location', '')
        area = data.get('area', '')
        variety = data.get('variety', '')
        brix = data.get('brix', '0.0%')
        status = data.get('status', 'In Growth')
        harvest_date = data.get('harvest_date', 'TBD')

        if not username or not name:
            return jsonify({"status": "error", "message": "Username and name are required"}), 400

        if users_collection.find_one({'username': username}):
            return jsonify({"status": "error", "message": "Farmer Username already exists"}), 400

        max_user = users_collection.find_one(sort=[("id", -1)])
        next_id = (max_user["id"] + 1) if (max_user and "id" in max_user) else 1

        new_farmer = {
            'id': next_id,
            'role': 'farmer',
            'username': username,
            'password': password,
            'name': name,
            'phone': phone,
            'location': location,
            'area': area,
            'variety': variety,
            'brix': brix,
            'status': status,
            'harvest_date': harvest_date
        }
        
        users_collection.insert_one(new_farmer)
        return jsonify({"status": "success", "message": "Farmer added successfully"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/farmers/<username>', methods=['DELETE'])
def delete_farmer(username):
    try:
        res = users_collection.delete_one({'username': username, 'role': 'farmer'})
        if res.deleted_count == 0:
            return jsonify({"status": "error", "message": "Farmer not found"}), 404
        
        # Clean up their history as well
        history_collection.delete_many({'username': username})
        return jsonify({"status": "success", "message": "Farmer deleted successfully"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/update_brix', methods=['POST'])
def update_brix():
    try:
        data = request.json
        username = data.get('username')
        brix = data.get('brix')
        status = data.get('status')
        harvest_date = data.get('harvest_date', 'TBD')

        if not username or not brix or not status:
            return jsonify({"status": "error", "message": "Username, brix, and status are required"}), 400

        users_collection.update_one(
            {'username': username, 'role': 'farmer'},
            {'$set': {
                'brix': brix,
                'status': status,
                'harvest_date': harvest_date
            }}
        )

        return jsonify({"status": "success", "message": "Brix status updated successfully"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/history/<username>', methods=['GET'])
def get_user_history(username):
    try:
        logs = list(history_collection.find({'username': username}).sort('timestamp', -1))
        for log in logs:
            log['_id'] = str(log['_id'])
        return jsonify({"status": "success", "history": logs})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

background_thread = None

def sensor_simulation_task():
    import random
    print("Background Sensor Simulator Thread Started...")
    while True:
        data = {
            "nir": random.randint(600, 650),
            "moisture": random.randint(40, 60),
            "temp": round(random.uniform(25.0, 35.0), 1)
        }
        # Broadcast to all connected clients
        socketio.emit('update_dashboard', data)
        socketio.sleep(4)

@socketio.on('connect')
def handle_connect():
    global background_thread
    print("React Frontend Client Connected to SocketIO!")
    if background_thread is None:
        background_thread = socketio.start_background_task(sensor_simulation_task)

@socketio.on('sensor_data')
def handle_sensor_data(data):
    """
    Handles incoming raw sensor data from a physical ESP32
    and broadcasts it to the frontend.
    """
    print(f"Received raw ESP32 data: {data}")
    socketio.emit('update_dashboard', data)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
