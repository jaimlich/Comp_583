// main.js

// Initialize the map (example using Google Maps API)
// Replace 'YOUR_API_KEY' with your actual API key if using Google Maps
function initMap() {
    // Default coordinates (if geolocation fails)
    var defaultCoords = { lat: 39.50, lng: -98.35 }; // Center of the US

    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 5,
        center: defaultCoords
    });

    // Get user location from backend
    fetch('http://127.0.0.1:5000/api/location')
        .then(response => response.json())
        .then(data => {
            if (data.loc) {
                const [lat, lng] = data.loc.split(',').map(Number);
                var userLocation = { lat: lat, lng: lng };
                map.setCenter(userLocation);
                new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    title: "Your Approximate Location"
                });
                // Optionally, call weather API using lat/lng
                fetchWeatherData(lat, lng);
            }
        })
        .catch(error => console.error('Error fetching user location:', error));
}

function fetchWeatherData(lat, lng) {
    fetch(`http://127.0.0.1:5000/api/weather?lat=${lat}&lon=${lng}`)
        .then(response => response.json())
        .then(data => {
            displayWeatherInfo(data);
        })
        .catch(error => console.error('Error fetching weather data:', error));
}

function displayWeatherInfo(data) {
    const infoDiv = document.getElementById('weather-info');
    if (data && data.weather) {
        infoDiv.innerHTML = `<h3>Current Weather:</h3>
                             <p>${data.weather[0].description}</p>
                             <p>Temperature: ${data.main.temp} °F</p>`;
    } else {
        infoDiv.innerHTML = `<p>No weather data available.</p>`;
    }
}

// Event listener for search functionality (to be enhanced)
document.getElementById('search-btn').addEventListener('click', function() {
    const query = document.getElementById('location-input').value;
    // For now, simply log the query; implement geocoding as needed
    console.log('Search query:', query);
});

// If using Google Maps, ensure the callback is available
// window.initMap = initMap;
