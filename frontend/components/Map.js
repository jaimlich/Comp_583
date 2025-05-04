import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

const Map = ({ center, filters, onMountainHover, onMountainSelect, lockedMountain }) => {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const popupRef = useRef(null);
  const [mountains, setMountains] = useState([]);
  const [mapReady, setMapReady] = useState(false);

  const US_BOUNDS = [[-140, 10], [-50, 72]];

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_MAPBOX_API_KEY || mapInstance.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;

    mapInstance.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [-97, 38],
      zoom: 3.7,
      maxBounds: US_BOUNDS,
      maxZoom: 10,
      minZoom: 1.5,
    });

    mapInstance.current.on("load", () => {
      mapInstance.current.resize();
      setMapReady(true);

      mapInstance.current.addSource("terrain-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.terrain-rgb",
        tileSize: 512,
        maxzoom: 14,
      });

      mapInstance.current.addSource("hillshade-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.terrain-rgb",
        tileSize: 512,
        maxzoom: 14,
      });

      mapInstance.current.setTerrain({ source: "terrain-dem", exaggeration: 1.5 });

      mapInstance.current.addLayer({
        id: "hillshading",
        source: "hillshade-dem",
        type: "hillshade",
        paint: { "hillshade-exaggeration": 0.5 },
      });

      document.querySelectorAll(".mapboxgl-ctrl-bottom-left, .mapboxgl-ctrl-bottom-right")
        .forEach(el => el.style.display = "none");
    });
  }, []);

  useEffect(() => {
    fetch(`${baseUrl}/api/mountains`)
      .then((res) => res.ok ? res.json() : Promise.reject(res.statusText))
      .then(setMountains)
      .catch((err) => console.error("❌ Error fetching mountains:", err));
  }, []);

  useEffect(() => {
    if (!popupRef.current) {
      popupRef.current = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 20
      });
    }

    document.querySelectorAll(".mapboxgl-marker").forEach(el => el.remove());

    mountains.forEach((mountain) => {
      const show =
        (mountain.hasSnow && filters.showHasSnow) ||
        (!mountain.hasSnow && mountain.forecastSnow && mountain.forecastDays <= filters.forecastDays && filters.showForecastSnow) ||
        (!mountain.hasSnow && !mountain.forecastSnow && filters.showNoSnow);

      if (!show) return;

      const iconPath = mountain.hasSnow
        ? "/icons/SVG/mountain_snow.svg"
        : mountain.forecastSnow && mountain.forecastDays <= filters.forecastDays
          ? "/icons/SVG/mountain_snow_forecast.svg"
          : "/icons/SVG/mountain_no_snow.svg";

      const el = document.createElement("div");
      el.className = "marker";
      el.style.backgroundImage = `url(${iconPath})`;
      el.style.width = "50px";
      el.style.height = "50px";
      el.style.backgroundSize = "cover";
      el.style.cursor = "pointer";

      const popupHTML = `
        <div style="border-radius: 10px; padding: 10px; background-color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.2); font-family: sans-serif; font-size: 14px;">
          <strong>${mountain.name}</strong><br/>
          🌤️ ${mountain.weather}<br/>
          🌡️ ${mountain.temperature}°F<br/>
          ❄️ Snow Depth: ${mountain.snowfallCurrent || 0}"<br/>
          🌧️ Rain (24h): ${mountain.rainLast24h || 0}"<br/>
          🌫️ Visibility: ${mountain.visibility} mi<br/>
          🚗 Chains: ${mountain.chainsRequired ? "Yes" : "No"}
        </div>
      `;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([mountain.longitude, mountain.latitude])
        .addTo(mapInstance.current);

      el.addEventListener("mouseenter", () => {
        popupRef.current.setHTML(popupHTML);
        popupRef.current.setLngLat([mountain.longitude, mountain.latitude]);
        popupRef.current.addTo(mapInstance.current);
        onMountainHover(mountain);
      });

      el.addEventListener("mouseleave", () => {
        if (!lockedMountain || lockedMountain.name !== mountain.name) {
          popupRef.current.remove();
          onMountainHover(null);
        }
      });

      el.addEventListener("click", () => {
        popupRef.current.setHTML(popupHTML);
        popupRef.current.setLngLat([mountain.longitude, mountain.latitude]);
        popupRef.current.addTo(mapInstance.current);
        onMountainSelect(mountain);
        onMountainHover(mountain);
      });
    });
  }, [mountains, filters, lockedMountain]);

  useEffect(() => {
    if (!lockedMountain || !popupRef.current || !mapInstance.current) return;

    const popupHTML = `
      <div style="border-radius: 10px; padding: 10px; background-color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.2); font-family: sans-serif; font-size: 14px;">
        <strong>${lockedMountain.name}</strong><br/>
        🌡️ ${lockedMountain.temperature}°F<br/>
        ❄️ Snow Depth: ${lockedMountain.snowfallCurrent || 0}"<br/>
        🌧️ Rain (24h): ${lockedMountain.rainLast24h || 0}"<br/>
        🌫️ Visibility: ${lockedMountain.visibility} mi<br/>
        🚗 Chains: ${lockedMountain.chainsRequired ? "Yes" : "No"}
      </div>
    `;

    popupRef.current.setHTML(popupHTML);
    popupRef.current.setLngLat([lockedMountain.longitude, lockedMountain.latitude]);
    popupRef.current.addTo(mapInstance.current);
  }, [lockedMountain]);

  useEffect(() => {
    if (mapInstance.current && center) {
      mapInstance.current.flyTo({
        center: [center.lon, center.lat],
        zoom: 8,
        essential: true
      });
    }
  }, [center]);

  return <div ref={mapContainer} style={{ width: "100%", height: "81.3%" }} />;
};

export default Map;
