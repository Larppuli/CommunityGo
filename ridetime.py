from flask import Flask, request, jsonify
import requests
import os

app = Flask(__name__)

@app.route('/calculate-ride-time', methods=['POST'])
def calculate_ride_time():
    try:
        # Extract origin, destination, and stop points from the request body
        data = request.get_json()
        pickup = [data['pickup']['pickup']['location']['lat'], data['pickup']['pickup']['location']['lng']]
        destination = [data['destination']['geometry']['location']['lat'], data['destination']['geometry']['location']['lng']]
        stops = '|'.join(data.get('stops', []))
        # Retrieve the API key from the environmental variable
        api_key = os.environ.get('API_KEY')
        url = f'https://maps.googleapis.com/maps/api/directions/json?origin=' + str(pickup[0]) + ',' + str(pickup[1]) + '&destination=' + str(destination[0]) + ',' + str(destination[1]) + '&waypoints=' + stops + '&key=' + api_key
        response = requests.get(url)
        data = response.json()

        # Extract the duration from the response
        duration_seconds = data['routes'][0]['legs'][0]['duration']['value']
        duration_minutes = duration_seconds // 60

        return jsonify({'ride_time': duration_minutes})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)