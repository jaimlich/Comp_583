import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getTimeAgo } from "../utils/dateHelpers";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE || "";

const Map = ({ center, filters, onMountainHover, onMountainSelect, lockedMountain }) => {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const popupRef = useRef(null);
  const [mountains, setMountains] = useState([]);
  const [closures, setClosures] = useState([]);
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
    
      // DEM source for terrain
      mapInstance.current.addSource("terrain-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });
    
      // DEM source for hillshade (separate instance)
      mapInstance.current.addSource("hillshade-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });
    
      // Apply terrain
      mapInstance.current.setTerrain({
        source: "terrain-dem",
        exaggeration: 1.5,
      });
    
      // Hillshade layer using different DEM source
      mapInstance.current.addLayer({
        id: "hillshading",
        source: "hillshade-dem",
        type: "hillshade",
        paint: {
          "hillshade-exaggeration": 0.5,
        },
      });
    
      // Hide Mapbox branding
      document.querySelectorAll(".mapboxgl-ctrl-bottom-left, .mapboxgl-ctrl-bottom-right")
        .forEach(el => el.style.display = "none");
    });    
  }, []);

  useEffect(() => {
    fetch(`${baseUrl}/api/mountains`)
      .then((res) => res.ok ? res.json() : Promise.reject(res.statusText))
      .then(setMountains)
      .catch((err) => console.error("❌ Error fetching mountains:", err));

    fetch(`${baseUrl}/api/road-closures`)
      .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
      .then(data => {
        console.log("🚧 Closures received:", data);
        setClosures(data);
      })
      .catch(err => console.error("❌ Road closures fetch failed:", err));
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

    // 🏔️ Mountain markers
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
          🚗 Chains: ${mountain.chainsRequired ? "Yes" : "No"}<br/>
          <span style="color: #888; font-size: 12px;">Last updated: ${getTimeAgo(mountain.lastUpdated)}</span>
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
    if (!mapReady || !mapInstance.current) {
      console.warn("⏳ Map not ready — skipping closure render");
      return;
    }

    console.log("🔄 Rendering closures:", closures.length);

    closures.forEach((closure) => {
      if (!closure.lat || !closure.lon) return;

      if (!mapInstance.current.loaded()) {
        console.warn("⚠️ Map not fully loaded. Skipping:", closure.location);
        return;
      }

      const el = document.createElement("div");
      el.className = "closure-marker";
      el.style.width = "32px";
      el.style.height = "32px";
      el.style.backgroundSize = "contain";
      el.style.backgroundRepeat = "no-repeat";
      el.style.cursor = "pointer";
      el.style.animation = "pulse 1.6s infinite ease-in-out";
      el.style.backgroundImage = `url(/icons/SVG/road_closure.svg)`;

      // Fallback
      el.style.backgroundColor = "rgba(255, 100, 100, 0.4)";
      el.style.border = "1px solid red";
      el.style.borderRadius = "50%";

      const html = `
        <div style="padding: 10px; background: #fff3f3; color: #000; border-radius: 8px; font-size: 13px;">
          ⚠️ <strong>${closure.location}</strong><br/>
          ${closure.details}<br/>
          <a href="${closure.source}" target="_blank" style="color: #1976d2; text-decoration: underline;">View Source</a>
        </div>
      `;

      console.log("📍 Creating closure marker:", closure.location, closure.lat, closure.lon);

      new mapboxgl.Marker(el)
        .setLngLat([closure.lon, closure.lat])
        .setPopup(new mapboxgl.Popup({ offset: 20 }).setHTML(html))
        .addTo(mapInstance.current);
    });
  }, [closures, mapReady]);

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
