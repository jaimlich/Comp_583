# Comp 583 - Snow Mountain Tracker

### By: Nima Shafie, Jack Konyan, and Jaime Soto

## Overview
Snow Mountain Tracker is a web application that helps users locate nearby mountains with current or forecasted snowfall. It uses IP geolocation to estimate the user’s location and displays an interactive map with markers for relevant snow data.

## Project Structure
- **backend/**: Contains the Python Flask application.
- **frontend/**: Contains the HTML, CSS, and JavaScript files for the user interface.

## Setup Instructions

### Backend Setup
1. Navigate to the `backend/` directory.
2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   OR
   python3 -m venv .venv --without-pip
   source venv/bin/activate  # On Windows: .venv\Scripts\Activate.ps1
   ```
   Confirm your enviornment is correct by running the following commands to make sure you are using the virtual Python enviornment<p>
   Linux/OS: ```which python``` OR ```which python3```<p>
   Windows: ```where python```OR ```where python3```<p>
3. Install dependencies
    ```pip install -r requirements.txt```
4. Run the Flask app:
    ```python app.py```

The backend server should start at http://127.0.0.1:5000.

### Frontend Setup
1. Open frontend/index.html in your browser.
2. The frontend will make API calls to the Flask backend for location and weather data.

Future Work
- Enhance error handling and caching.
- Add user authentication.
- Expand the “Popular Destinations” feature.
