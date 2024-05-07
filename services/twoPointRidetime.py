from flask import Flask, request, jsonify
import requests
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/calculate-two-point-ride-time', methods=['POST'])
def calculate_ride_time():
    api_key = os.environ.get('API_KEY')
    try:
        # Extract origin and destination from the request body
        data = request.get_json()
        print(data)
        destinationGeometryLoc = data["destination"]["geometry"]["location"]
        originGeometryLoc = data["origin"]["geometry"]["location"]
        url = f'https://maps.googleapis.com/maps/api/directions/json?origin={ originGeometryLoc["lat"]},{originGeometryLoc["lng"]}&destination={destinationGeometryLoc["lat"]},{destinationGeometryLoc["lng"]}&key={api_key}'
        response = requests.get(url)
        data = response.json()
        duration = data["routes"][0]["legs"][0]["duration"]["value"] // 60
        return jsonify({'ride_time': duration, 'routes': data['routes']})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)