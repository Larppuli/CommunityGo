from flask import Flask, request, jsonify
import requests
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/calculate-multi-point-ride-time', methods=['POST'])
def calculate_ride_time():
    api_key = os.environ.get('API_KEY')
    try:
        # Extract origin, destination, and stop points from the request body
        data = request.get_json()
        destination = data["destination"]
        # Adding waypoint coordinates to an array
        stops = []
        for element in data["waypoints"]:
            lat = element['lat']
            lng = element['lng']
            stops.append((lat, lng))

        # Optimizes the shortest duration between waypoint coordinates and destination
        origin = stops[0]
        stops.pop(0)
        waypoints = '|'.join([f'{stop[0]},{stop[1]}' for stop in stops])
        url = f'https://maps.googleapis.com/maps/api/directions/json?origin={origin[0]},{origin[1]}&destination={destination["lat"]},{destination["lng"]}&waypoints=optimize:true|{waypoints}&key={api_key}'
        response = requests.get(url)
        data = response.json()
        total_duration_seconds = 0
        for leg in data['routes'][0]['legs']:
            total_duration_seconds += int(leg['duration']['value'])
        shortest_duration = total_duration_seconds // 60
        bestRoutes = data['routes']
        bestUrl = url
        stops.insert(0, origin)
        for i in range(len(stops)-1):
            possibleOrigin = stops[i+1]
            stops.pop(i+1)
            total_duration_seconds = 0
            waypoints = '|'.join([f'{stop[0]},{stop[1]}' for stop in stops])
            url = f'https://maps.googleapis.com/maps/api/directions/json?origin={possibleOrigin[0]},{possibleOrigin[1]}&destination={destination["lat"]},{destination["lng"]}&waypoints=optimize:true|{waypoints}&key={api_key}'
            response = requests.get(url)
            data = response.json()
            for leg in data['routes'][0]['legs']:
                total_duration_seconds += int(leg['duration']['value'])
            duration_minutes = total_duration_seconds // 60
            stops.insert(i+1, possibleOrigin)
            if duration_minutes < shortest_duration:
                shortest_duration = duration_minutes
                origin = possibleOrigin
                bestRoutes = data['routes']

        return jsonify({'ride_time': shortest_duration, 'routes': bestRoutes})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001)