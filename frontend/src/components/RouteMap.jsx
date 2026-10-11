// Leaflet map of a cluster's stops, numbered in route order with a line joining them.
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function RouteMap({ stops }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    mapRef.current = L.map(containerRef.current, { scrollWheelZoom: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapRef.current);
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const layer = L.layerGroup().addTo(map);
    const points = stops.filter((s) => s.lat != null && s.lng != null);

    points.forEach((s, i) => {
      const done = s.status === 'COLLECTED';
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:#fff;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);background:${done ? '#10b981' : '#0f766e'}">${done ? '✓' : (s.routeOrder ?? i + 1)}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      L.marker([s.lat, s.lng], { icon })
        .bindPopup(`<b>${s.userName}</b><br/>${s.address || ''}`)
        .addTo(layer);
    });

    if (points.length > 1) {
      L.polyline(points.map((s) => [s.lat, s.lng]), { color: '#14b8a6', weight: 4, dashArray: '6 8' }).addTo(layer);
    }
    if (points.length) {
      map.fitBounds(L.latLngBounds(points.map((s) => [s.lat, s.lng])), { padding: [30, 30], maxZoom: 17 });
    }
    return () => layer.remove();
  }, [stops]);

  return <div ref={containerRef} className="w-full h-64 rounded-2xl overflow-hidden border border-teal-100 z-0" />;
}
