import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const MapComponent = ({ center, markers }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return; // Initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [center.lon, center.lat],
      zoom: 10
    });

    markers.forEach(marker => {
      new mapboxgl.Marker().setLngLat(marker.coordinates).addTo(map.current);
    });
  }, [center, markers]);

  return <div ref={mapContainer} style={{ width: '100%', height: '500px' }} />;
};

export default MapComponent;
