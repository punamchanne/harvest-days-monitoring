import socketio
import time
import random

# This script simulates an ESP32 sending data to the Python Backend
# pip install "python-socketio[client]"

sio = socketio.Client()

@sio.event
def connect():
    print('Connected to Backend')

@sio.event
def disconnect():
    print('Disconnected from Backend')

def send_fake_sensor_data():
    while True:
        data = {
            "brix": round(random.uniform(15, 22), 2),
            "nir": random.randint(600, 650),
            "moisture": random.randint(40, 60),
            "temp": round(random.uniform(25, 35), 1)
        }
        print(f"Sending data: {data}")
        sio.emit('sensor_data', data)
        time.sleep(5)

if __name__ == '__main__':
    try:
        sio.connect('http://localhost:5000')
        send_fake_sensor_data()
    except Exception as e:
        print(f"Error: {e}")
