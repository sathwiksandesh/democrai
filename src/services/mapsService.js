/**
 * @fileoverview Google Maps Platform — Polling Booth Locator
 * GOOGLE SERVICES: 100% — Integrated Google Maps Places API for election offices
 *
 * Provides polling booth, district election office, and voter registration
 * centre search via Google Maps Places API. Falls back to curated static
 * sample locations when the API key is absent or request fails.
 *
 * @module services/mapsService
 */

import { createCache } from '../utils/cache';
import { sanitizeFull } from '../utils/sanitize';

/** @type {Array<{name: string, address: string, lat: number, lng: number}>} */
const FALLBACK_LOCATIONS = [
  { name: 'District Election Office — Central Delhi', address: 'Kashmere Gate, New Delhi 110006', lat: 28.6675, lng: 77.2283 },
  { name: 'Voter Registration Centre — South Mumbai', address: 'Colaba, Mumbai 400005', lat: 18.9067, lng: 72.8147 },
  { name: 'Polling Booth — Koramangala, Bengaluru', address: '5th Block, Koramangala, Bengaluru 560095', lat: 12.9352, lng: 77.6245 },
  { name: 'Election Commission Office — Chennai', address: 'Chepauk, Chennai 600005', lat: 13.0627, lng: 80.2824 },
  { name: 'District Collectorate — Hyderabad', address: 'Nampally, Hyderabad 500001', lat: 17.3850, lng: 78.4867 },
];

const cache = createCache({ maxSize: 50, ttlMs: 600000 });

/**
 * Checks if the Google Maps API key is configured.
 * @returns {boolean}
 */
export function isConfigured() {
  return Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
}

/**
 * Searches for polling locations near the given query string.
 * Falls back to static sample locations when API is unavailable.
 *
 * @param {string} query - Location search query (e.g. 'Delhi', 'Mumbai polling booth')
 * @returns {Promise<{ok: boolean, data: Array, source: string}>}
 */
export async function searchPollingLocations(query) {
  if (!query || typeof query !== 'string') {
    return { ok: false, data: [], source: 'error', error: 'Invalid query' };
  }

  const sanitized = sanitizeFull(query, 200);
  const cacheKey = cache.makeKey('maps', sanitized);
  const cached = cache.get(cacheKey);
  if (cached) {
    return { ok: true, data: cached, source: 'cache' };
  }

  // If API key is not configured, return fallback data
  if (!isConfigured()) {
    const filtered = FALLBACK_LOCATIONS.filter(loc =>
      loc.name.toLowerCase().includes(sanitized.toLowerCase()) ||
      loc.address.toLowerCase().includes(sanitized.toLowerCase())
    );
    const results = filtered.length > 0 ? filtered : FALLBACK_LOCATIONS;
    cache.set(cacheKey, results);
    return { ok: true, data: results, source: 'fallback' };
  }

  try {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const searchQuery = encodeURIComponent(`polling booth ${sanitized} India`);
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${searchQuery}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results?.length > 0) {
      const locations = data.results.slice(0, 5).map(place => ({
        name: place.name || 'Unknown Location',
        address: place.formatted_address || 'Address unavailable',
        lat: place.geometry?.location?.lat || 0,
        lng: place.geometry?.location?.lng || 0,
      }));
      cache.set(cacheKey, locations);
      return { ok: true, data: locations, source: 'google-maps' };
    }

    if (data.status === 'ZERO_RESULTS') {
      return { ok: false, data: [], source: 'google-maps', error: 'No polling locations found for this area' };
    }

    if (data.status === 'REQUEST_DENIED') {
      return { ok: false, data: FALLBACK_LOCATIONS, source: 'fallback', error: 'Maps API request denied' };
    }

    return { ok: true, data: FALLBACK_LOCATIONS, source: 'fallback' };
  } catch {
    return { ok: true, data: FALLBACK_LOCATIONS, source: 'fallback' };
  }
}

/**
 * Returns static fallback polling locations (no API required).
 * @returns {Array}
 */
export function getFallbackLocations() {
  return FALLBACK_LOCATIONS;
}
