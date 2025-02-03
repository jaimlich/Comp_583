# config.py

import os

class Config:
    DEBUG = os.environ.get('DEBUG', True)
    TESTING = os.environ.get('TESTING', False)

    WEATHER_API_KEY = os.environ.get('WEATHER_API_KEY', 'your_openweathermap_api_key')
    GEOLocation_API_URL = "https://ipinfo.io/json"  # example endpoint
    CACHE_TYPE = "SimpleCache"
    CACHE_DEFAULT_TIMEOUT = 300