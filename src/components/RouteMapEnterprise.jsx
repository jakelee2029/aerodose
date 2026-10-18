import { useEffect, useMemo, useRef } from 'react';

/**
 * Basemap. CARTO Dark Matter when VITE_CARTO_API_KEY is set (CARTO requires `?key=` on every tile,
 * otherwise it paints an "API KEY REQUIRED" watermark). Without a key, fall back to the free Esri
 * dark-gray canvas so the map never shows a watermark.
 */
const CARTO_KEY = import.meta.env.VITE_CARTO_API_KEY;
const BASEMAP = CARTO_KEY
  ? {
      url: `https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png?key=${encodeURIComponent(CARTO_KEY)}`,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>',
    }
  : {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    };

/**
 * Viridis, truncated to its brighter 60% so the low end stays visible on a dark basemap.
 * Perceptually uniform and color-vision-deficiency safe.
 */
const RAMP = ['#2C728E', '#21908D', '#27AD81', '#5DC863', '#AADC32', '#FDE725'];

function hexToRgb(h) { return [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); }
function rampColor(t) {
  const x = Math.max(0, Math.min(1, t)) * (RAMP.length - 1);
  const i = Math.min(RAMP.length - 2, Math.floor(x));
  const a = hexToRgb(RAMP[i]), b = hexToRgb(RAMP[i + 1]), f = x - i;
  return `rgb(${a.map((v, k) => Math.round(v + (b[k] - v) * f)).join(',')})`;
}

export default function RouteMapEnterprise({ waypoints }) {
  const mapRef = useRef(null);
  const leafletRef = useRef(null);

  const { minRate, maxRate } = useMemo(() => {
    const rates = (waypoints ?? []).map(w => w.doseRate);
    return { minRate: Math.min(...rates), maxRate: Math.max(...rates) };
  }, [waypoints]);

  useEffect(() => {
    if (!waypoints || waypoints.length === 0) return;
    let cancelled = false;

    const loadMap = async () => {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css'; link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      const L = (await import('leaflet')).default;
      if (cancelled || !mapRef.current) return;
      if (leafletRef.current) { leafletRef.current.remove(); leafletRef.current = null; }

      const midWp = waypoints[Math.floor(waypoints.length / 2)];
      const map = L.map(mapRef.current, {
        center: [midWp.lat, midWp.lon], zoom: 3,
        zoomControl: true, scrollWheelZoom: false, attributionControl: true,
      });
      leafletRef.current = map;
      L.tileLayer(BASEMAP.url, { attribution: BASEMAP.attribution, maxZoom: 16 }).addTo(map);

      const span = maxRate - minRate;
      const pts = i => [waypoints[i].lat, waypoints[i].lon];
      // Dark casing under the colored line keeps it legible over any map feature
      L.polyline(waypoints.map((_, i) => pts(i)), { color: '#0D1117', weight: 8, opacity: 0.7, lineCap: 'round' }).addTo(map);
      for (let i = 0; i < waypoints.length - 1; i++) {
        const t = span > 0.0001 ? (waypoints[i].doseRate - minRate) / span : 0.5;
        L.polyline([pts(i), pts(i + 1)], { color: rampColor(t), weight: 4.5, opacity: 1, lineCap: 'round' }).addTo(map);
      }

      const mkIcon = color => L.divIcon({
        html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #F0F6FC;"></div>`,
        className: '', iconSize: [14, 14], iconAnchor: [7, 7],
      });
      L.marker(pts(0), { icon: mkIcon('#388BFD'), title: 'Origin' }).addTo(map).bindTooltip('Origin');
      L.marker(pts(waypoints.length - 1), { icon: mkIcon('#F0F6FC'), title: 'Destination' }).addTo(map).bindTooltip('Destination');

      map.fitBounds(L.latLngBounds(waypoints.map(w => [w.lat, w.lon])), { padding: [28, 28] });
    };

    loadMap().catch(console.error);
    return () => { cancelled = true; if (leafletRef.current) { leafletRef.current.remove(); leafletRef.current = null; } };
  }, [waypoints, minRate, maxRate]);

  const mid = (minRate + maxRate) / 2;
  const ticks = [minRate, mid, maxRate];

  return (
    <div className="panel overflow-hidden">
      <div ref={mapRef} role="img" aria-label="Map of the great-circle flight path, colored by dose rate" style={{ height: '320px', width: '100%', background: '#0D1117' }} />
      <div className="border-t border-line px-4 py-3">
        <div className="mb-1.5 text-[0.8125rem] font-medium text-fg-soft">Dose rate along the path (µSv/hr)</div>
        <div className="h-3 rounded-full" style={{ background: `linear-gradient(90deg, ${RAMP.join(', ')})` }} role="presentation" />
        <div className="mono mt-1 flex justify-between text-[0.8125rem] text-fg">
          {ticks.map((t, i) => <span key={i}>{t.toFixed(2)}</span>)}
        </div>
        <div className="mt-0.5 flex justify-between text-xs text-fg-muted"><span>Lower</span><span>Higher</span></div>
      </div>
    </div>
  );
}
