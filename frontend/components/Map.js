import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

const Map = ({ mountains }) => {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);

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
        center: [-117.1611, 32.7157], // Default to Southern California
        zoom: 10,
      });
    }

    mapInstance.current.on('load', () => {
      console.log("Map loaded");

      // Remove Mapbox copyright/footer
      document.querySelectorAll('.mapboxgl-ctrl-bottom-right, .mapboxgl-ctrl-bottom-left')
          .forEach(el => el.style.display = 'none');
  });

    const getIcon = (hasSnow) => {
      if (hasSnow === "Snowing") return "snowflake-icon.png";
      return "mountain-icon.png";
  };
  
    mountains.forEach((mountain) => {
      const el = document.createElement('div');
      el.className = 'marker';
      let iconUrl = '/icons/mountain_no_snow.png';
      if (mountain.hasSnow) {
        iconUrl = '/icons/mountain_snow.png';
      } else if (mountain.forecastSnow) {
        iconUrl = '/icons/mountain_forecast.png';
      }

      el.style.backgroundImage = `url(/icons/${getIcon(mountain.hasSnow)})`;
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.backgroundSize = 'cover';
      el.style.cursor = 'pointer';
      el.title = mountain.name;

      if (!isNaN(mountain.longitude) && !isNaN(mountain.latitude)) {
        new mapboxgl.Marker(el)
          .setLngLat([mountain.longitude, mountain.latitude])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(`${mountain.name}: ${mountain.weather}`))
          .addTo(mapInstance.current);
      } else {
        console.error(`Invalid coordinates for ${mountain.name}:`, mountain);
      }
    });
  }, [mountains]);

  return <div ref={mapContainer} style={
    { width: '100%',
      height: '100%' }
    } />;
};

export default Map;
