import { route } from '../content/facts';

/** Great-circle distance in km. */
export function haversine(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6371;
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** Route stops projected (equirectangular, latitude-corrected) into a w×h box with padding. */
export function projectRoute(w: number, h: number, pad = 24) {
  const lons = route.map((r) => r.lon);
  const lats = route.map((r) => r.lat);
  const k = Math.cos((45 * Math.PI) / 180);
  const x0 = Math.min(...lons) * k, x1 = Math.max(...lons) * k;
  const y0 = Math.min(...lats), y1 = Math.max(...lats);
  const s = Math.min((w - pad * 2) / (x1 - x0), (h - pad * 2) / (y1 - y0));
  const ox = (w - (x1 - x0) * s) / 2;
  const oy = (h - (y1 - y0) * s) / 2;
  return route.map((r) => ({ ...r, x: ox + (r.lon * k - x0) * s, y: oy + (y1 - r.lat) * s }));
}

export const legKm = route.slice(1).map((r, i) => haversine(route[i], r));
export const totalKm = legKm.reduce((a, b) => a + b, 0);
