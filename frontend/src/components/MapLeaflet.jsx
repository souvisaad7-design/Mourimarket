// Interactive map (Leaflet + OpenStreetMap tiles). Loaded on demand through <Map /> in
// MapView.jsx, so pages without a map never download Leaflet.
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';

// A pin in the site's colours (no image files needed).
const pinIcon = (variant = 'brand') => L.divIcon({
  className: 'mm-pin',
  html: `<svg viewBox="0 0 32 42" width="32" height="42" aria-hidden="true">
    <path d="M16 1C8 1 2 7 2 15c0 10 14 25 14 25s14-15 14-25C30 7 24 1 16 1z"
      style="fill:${variant === 'me' ? 'rgb(var(--gold-400))' : 'rgb(var(--brand-700))'}" stroke="#fff" stroke-width="2"/>
    <circle cx="16" cy="15" r="5.5" style="fill:${variant === 'me' ? 'rgb(var(--brand-900))' : 'rgb(var(--gold-400))'}"/></svg>`,
  iconSize: [32, 42],
  iconAnchor: [16, 40],
  popupAnchor: [0, -36],
});

// Leaflet draws circles with plain colours: read the site's current palette (admin colours included).
const cssColor = (name, fallback) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v ? `rgb(${v})` : fallback;
};

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/**
 * props:
 *  center [lat, lng], zoom
 *  markers  [{ id, lat, lng, title, subtitle, href }]  – listings (popup with a link)
 *  me       { lat, lng } | null                         – the visitor (gold pin)
 *  area     { lat, lng, radius }                        – a circle for an approximate place
 *  picker   { lat, lng } | null + onPick(lat, lng)      – click / drag to place a pin
 *  onOpen(href)                                         – follow a popup link inside the app
 */
export default function MapLeaflet({ center, zoom = 12, markers = [], me = null, area = null, picker, onPick, onOpen, className = 'h-72', label }) {
  const el = useRef(null);
  const map = useRef(null);
  const layer = useRef(null);
  const pickRef = useRef(onPick);
  pickRef.current = onPick;
  const openRef = useRef(onOpen);
  openRef.current = onOpen;

  useEffect(() => {
    const m = L.map(el.current, { scrollWheelZoom: false, tap: true, attributionControl: true }).setView(center, zoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
    }).addTo(m);
    m.on('click', (e) => { if (pickRef.current) pickRef.current(e.latlng.lat, e.latlng.lng); });
    // Links inside popups stay in the app (no full page reload).
    m.on('popupopen', (e) => {
      const a = e.popup.getElement()?.querySelector('a[data-href]');
      if (a) a.addEventListener('click', (ev) => { ev.preventDefault(); openRef.current?.(a.dataset.href); });
    });
    layer.current = L.layerGroup().addTo(m);
    map.current = m;
    // The container can be sized after mount (tabs, modals).
    const ro = new ResizeObserver(() => m.invalidateSize());
    ro.observe(el.current);
    return () => { ro.disconnect(); m.remove(); map.current = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Redraw markers whenever the data changes.
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    const g = layer.current;
    g.clearLayers();
    const bounds = [];
    for (const mk of markers) {
      if (mk.lat == null || mk.lng == null) continue;
      const html = `<div class="mm-popup"><strong>${escapeHtml(mk.title)}</strong>${mk.subtitle ? `<br><span>${escapeHtml(mk.subtitle)}</span>` : ''}${mk.href ? `<br><a href="${escapeHtml(mk.href)}" data-href="${escapeHtml(mk.href)}">${escapeHtml(mk.linkLabel || '→')}</a>` : ''}</div>`;
      L.marker([mk.lat, mk.lng], { icon: pinIcon(), title: mk.title, keyboard: true }).bindPopup(html).addTo(g);
      bounds.push([mk.lat, mk.lng]);
    }
    if (area) {
      L.circle([area.lat, area.lng], { radius: area.radius, color: cssColor('--brand-700', '#305a4e'), weight: 2, fillColor: cssColor('--gold-400', '#d0af6c'), fillOpacity: 0.25 }).addTo(g);
      bounds.push([area.lat, area.lng]);
    }
    if (me) {
      L.marker([me.lat, me.lng], { icon: pinIcon('me'), title: me.title || '', zIndexOffset: 1000 }).addTo(g);
      bounds.push([me.lat, me.lng]);
    }
    if (picker) {
      const pin = L.marker([picker.lat, picker.lng], { icon: pinIcon(), draggable: true, autoPan: true }).addTo(g);
      pin.on('dragend', () => { const p = pin.getLatLng(); pickRef.current?.(p.lat, p.lng); });
      m.setView([picker.lat, picker.lng], Math.max(m.getZoom(), 14));
    } else if (bounds.length > 1) {
      m.fitBounds(bounds, { paddingTopLeft: [40, 56], paddingBottomRight: [40, 24], maxZoom: 14 });
    } else if (bounds.length === 1) {
      m.setView(bounds[0], area ? 13 : Math.max(zoom, 13));
    }
  }, [markers, me, area, picker]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={el} className={`mm-map relative z-0 w-full overflow-hidden rounded-2xl ring-1 ring-slate-200 ${className}`} role="application" aria-label={label} />;
}
