from flask import Flask, request, jsonify
import requests
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/calculate-ride-time', methods=['POST'])
def calculate_ride_time():
    try:
        # Extract origin, destination, and stop points from the request body
        data = request.get_json()
        pickup = data["pickup"]
        destination = data["destination"]
        stop = data["stops"][0]
        
        # Retrieve the API key from the environmental variable
        api_key = os.environ.get('API_KEY')
        
        # Construct the URL for Google Directions API with origin, destination, waypoints (stops), and API key. Remove the comma between waypoint coordinates if the coordinates are empty
        waypoints = f'{stop["lat"]},{stop["lng"]}' if stop["lng"] else ''
        url = f'https://maps.googleapis.com/maps/api/directions/json?origin={pickup["lat"]},{pickup["lng"]}&destination={destination["lat"]},{destination["lng"]}&waypoints={waypoints}&key={api_key}'
        # Send request to Google Directions API
        response = requests.get(url)
        data = response.json()

        # Iterate over each leg and sum their durations
        total_duration_seconds = 0
        for leg in data['routes'][0]['legs']:
            total_duration_seconds += int(leg['duration']['value'])

        duration_minutes = total_duration_seconds // 60

        return jsonify({'ride_time': duration_minutes})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)