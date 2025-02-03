# app.py

from flask import Flask, jsonify, request
from flask_caching import Cache
import requests
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
cache = Cache(app)

# Helper function: get user location based on IP (using ipinfo.io as example)
@cache.cached(timeout=300, key_prefix="user_location")
def get_user_location():
    try:
        response = requests.get(Config.GEOLocation_API_URL)
        if response.status_code == 200:
            return response.json()  # Contains city, region, loc, etc.
    except Exception as e:
        print("Error fetching user location:", e)
    return {}

# Example endpoint to get weather data (current or forecast) based on lat,lon
@app.route('/api/weather', methods=['GET'])
def get_weather():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    if not lat or not lon:
        return jsonify({'error': 'Missing lat or lon parameters'}), 400

    # weather_api_key = Config.WEATHER_API_KEY
    # weather_url = (
    #     f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={weather_api_key}&units=imperial"
    # )

    # try:
    #     response = requests.get(weather_url)
    #     data = response.json()
    #     return jsonify(data)
    # except Exception as e:
    #     return jsonify({'error': str(e)}), 500

# Endpoint to get the user location
@app.route('/api/location', methods=['GET'])
def user_location():
    location = get_user_location()
    return jsonify(location)

if __name__ == '__main__':
    app.run(debug=True)
