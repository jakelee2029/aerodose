import { useEffect, useRef } from 'react';

/**
 * Esri World Dark Gray Canvas Base — completely free, no API key required.
 * ArcGIS Online basemap tiles are available for free for development and
 * non-commercial use.
 * Reference: https://www.arcgis.com/home/item.html?id=1970c1995b8f44749f4b9b6e81b5ba45
 */
const TILE_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
const TILE_ATTRIBUTION = 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ';

export default function RouteMapEnterprise({ waypoints }) {
  const mapRef = useRef(null);
  const leafletRef = useRef(null);

  useEffect(() => {
    if (!waypoints || waypoints.length === 0) return;

    const loadMap = async () => {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css'; link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      const L = (await import('leaflet')).default;
      if (leafletRef.current) { leafletRef.current.remove(); leafletRef.current = null; }

      const midWp = waypoints[Math.floor(waypoints.length / 2)];
      const map = L.map(mapRef.current, {
        center: [midWp.lat, midWp.lon], zoom: 3,
        zoomControl: true, scrollWheelZoom: false,
        attributionControl: true,
      });
      leafletRef.current = map;

      // Esri World Dark Gray Canvas — free, no API key required
      L.tileLayer(TILE_URL, {
        attribution: TILE_ATTRIBUTION,
        maxZoom: 16,
      }).addTo(map);

      // Route segments colored by dose rate (blue–amber scale)
      const maxRate = Math.max(...waypoints.map(w => w.doseRate));
      const minRate = Math.min(...waypoints.map(w => w.doseRate));
      for (let i = 0; i < waypoints.length - 1; i++) {
        const t = (waypoints[i].doseRate - minRate) / (maxRate - minRate + 0.001);
        // Blue (nominal) → Amber (elevated): #38BDF8 → #F59E0B
        const r = Math.round(56  + t * (245 - 56));
        const g = Math.round(189 + t * (158 - 189));
        const b = Math.round(248 + t * (11  - 248));
        L.polyline([[waypoints[i].lat, waypoints[i].lon], [waypoints[i+1].lat, waypoints[i+1].lon]], {
          color: `rgb(${r},${g},${b})`, weight: 2.5, opacity: 0.95,
        }).addTo(map);
      }

      // Endpoint markers
      const mkIcon = (color, label) => L.divIcon({
        html: `<div style="width:10px;height:10px;border-radius:2px;background:${color};border:1.5px solid #fff;"></div>`,
        className: '', iconSize: [10,10], iconAnchor: [5,5],
      });
      L.marker([waypoints[0].lat, waypoints[0].lon], { icon: mkIcon('#38BDF8', 'ORIG') })
        .addTo(map).bindTooltip('ORIGIN', { permanent: false, className: '' });
      L.marker([waypoints[waypoints.length-1].lat, waypoints[waypoints.length-1].lon], { icon: mkIcon('#F59E0B', 'DEST') })
        .addTo(map).bindTooltip('DESTINATION', { permanent: false });

      map.fitBounds(L.latLngBounds(waypoints.map(w => [w.lat, w.lon])), { padding: [24, 24] });
    };

    loadMap().catch(console.error);
    return () => { if (leafletRef.current) { leafletRef.current.remove(); leafletRef.current = null; } };
  }, [waypoints]);

  return (
    <div className="panel" style={{ overflow: 'hidden' }}>
      <div className="panel-header">
        <span className="panel-header-label">Great-Circle Track (dose-rate colormap: blue = low, amber = elevated)</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ width: '40px', height: '3px', background: 'linear-gradient(90deg, #38BDF8, #F59E0B)', borderRadius: '2px' }} />
        </div>
      </div>
      <div ref={mapRef} style={{ height: '280px', width: '100%' }} />
    </div>
  );
}
