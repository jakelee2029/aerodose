import { useEffect, useRef } from 'react';

export default function RouteMap({ waypoints }) {
  const mapRef = useRef(null);
  const leafletRef = useRef(null);

  useEffect(() => {
    if (!waypoints || waypoints.length === 0) return;
    
    // Load Leaflet dynamically
    const loadLeaflet = async () => {
      if (!window.L) {
        // Load leaflet CSS
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }
        await import('leaflet');
      }
      const L = (await import('leaflet')).default;
      if (leafletRef.current) {
        leafletRef.current.remove();
      }
      const map = L.map(mapRef.current, {
        center: [waypoints[Math.floor(waypoints.length/2)].lat, waypoints[Math.floor(waypoints.length/2)].lon],
        zoom: 3,
        zoomControl: true,
        scrollWheelZoom: false,
      });
      leafletRef.current = map;

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd', maxZoom: 19,
      }).addTo(map);

      // Draw route with dose-rate color gradient
      const maxRate = Math.max(...waypoints.map(w => w.doseRate));
      const minRate = Math.min(...waypoints.map(w => w.doseRate));
      for (let i = 0; i < waypoints.length - 1; i++) {
        const t = (waypoints[i].doseRate - minRate) / (maxRate - minRate + 0.001);
        const r = Math.round(59 + t * (244 - 59));
        const g = Math.round(142 - t * (142 - 67));
        const b = Math.round(243 - t * (243 - 54));
        const color = `rgb(${r},${g},${b})`;
        L.polyline([
          [waypoints[i].lat, waypoints[i].lon],
          [waypoints[i+1].lat, waypoints[i+1].lon],
        ], { color, weight: 3.5, opacity: 0.9 }).addTo(map);
      }

      // Origin / Dest markers
      const origin = waypoints[0];
      const dest = waypoints[waypoints.length - 1];
      const markerStyle = (color) => L.divIcon({
        html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 8px ${color}"></div>`,
        className: '', iconSize: [12,12], iconAnchor: [6,6],
      });
      L.marker([origin.lat, origin.lon], { icon: markerStyle('#06d6d6') }).addTo(map).bindPopup(`Origin: (${origin.lat.toFixed(2)}°, ${origin.lon.toFixed(2)}°)`);
      L.marker([dest.lat, dest.lon], { icon: markerStyle('#f4c430') }).addTo(map).bindPopup(`Destination: (${dest.lat.toFixed(2)}°, ${dest.lon.toFixed(2)}°)`);

      // Fit bounds
      const latLngs = waypoints.map(w => [w.lat, w.lon]);
      map.fitBounds(L.latLngBounds(latLngs), { padding: [30, 30] });
    };

    loadLeaflet().catch(console.error);
    return () => { if (leafletRef.current) { leafletRef.current.remove(); leafletRef.current = null; } };
  }, [waypoints]);

  return (
    <div className="glass-card" style={{ padding: '0', overflow: 'hidden', marginBottom: '24px' }}>
      <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Great-Circle Route</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ display: 'inline-block', width: '20px', height: '3px', background: 'linear-gradient(90deg, #3b8ef3, #f44336)', borderRadius: '2px' }} />
            Low → High dose rate
          </span>
        </div>
      </div>
      <div ref={mapRef} style={{ height: '300px', width: '100%', marginTop: '16px' }} />
    </div>
  );
}
