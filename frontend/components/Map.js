import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

const Map = ({ center }) => {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const [mountains, setMountains] = useState([]);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_MAPBOX_API_KEY) {
      console.error("Mapbox API Key is missing.");
      return;
    }

    if (!mapInstance.current) {
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;
      mapInstance.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-116.823348, 37.621193], // Default to Southern California
        zoom: 6,
      });
    }

    mapInstance.current.on('load', () => {
      console.log("Map loaded");
      document.querySelectorAll('.mapboxgl-ctrl-bottom-right, .mapboxgl-ctrl-bottom-left')
          .forEach(el => el.style.display = 'none');
    });

    mapInstance.current.on("load", () => {
      mapInstance.current.resize();
    });

    fetch('/api/mountains')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Fetched mountain data:", data);
        setMountains(data);
      })
      .catch(error => console.error("Error fetching mountain data:", error));
  }, []);

  useEffect(() => {
    mountains.forEach((mountain) => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundImage = `url(icons/SVG/mountain_no_snow.svg)`;
      el.style.width = '50px';
      el.style.height = '50px';
      el.style.backgroundSize = 'cover';
      el.style.cursor = 'pointer';
      el.title = mountain.name;

      if (!isNaN(mountain.longitude) && !isNaN(mountain.latitude)) {
        new mapboxgl.Marker(el)
          .setLngLat([mountain.longitude, mountain.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`<h3>${mountain.name}</h3>
                <p>Latitude: ${mountain.latitude}, Longitude: ${mountain.longitude}</p>
                <p>Weather: ${mountain.weather}</p>`)
          )
          .addTo(mapInstance.current);
      } else {
        console.error(`Invalid coordinates for ${mountain.name}:`, mountain);
      }
    });
  }, [mountains]);

  // Center map when `center` prop updates
  useEffect(() => {
    if (mapInstance.current && center) {
      mapInstance.current.flyTo({
        center: [center.lon, center.lat],
        zoom: 10,
        essential: true,
      });
    }
  }, [center]);

  return <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />;
};

export default Map;
