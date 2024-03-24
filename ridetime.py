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

        # Adding waypoint coordinates to an array
        stops = []
        waypointsFill = ""
        if data["waypoints"]:
            for element in data["waypoints"]:
                lat = element['geometry']['location']['lat']
                lng = element['geometry']['location']['lng']
                stops.append((lat, lng))
            # Forming a string for the waypoints in api
            waypoints = '|'.join([f'{stop[0]},{stop[1]}' for stop in stops])
            waypointsFill = f'&waypoints=optimize:true|{waypoints}'

        # Retrieve the API key from the environmental variable
        api_key = os.environ.get('API_KEY')
        # Construct the URL for Google Directions API with origin, destination, waypoints (stops), and API key. Remove the comma between waypoint coordinates if the coordinates are empty
        waypoints = '|'.join([f'{stop[0]},{stop[1]}' for stop in stops])
        url = f'https://maps.googleapis.com/maps/api/directions/json?origin={pickup["lat"]},{pickup["lng"]}&destination={destination["lat"]},{destination["lng"]}{waypointsFill}&key={api_key}'
        # Send request to Google Directions API
        response = requests.get(url)
        data = response.json()

        # Iterate over each leg and sum their durations
        total_duration_seconds = 0
        for leg in data['routes'][0]['legs']:
            total_duration_seconds += int(leg['duration']['value'])

        duration_minutes = total_duration_seconds // 60

        return jsonify({'ride_time': duration_minutes, 'routes': data['routes']})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)