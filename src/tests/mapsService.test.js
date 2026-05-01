import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchPollingLocations, getFallbackLocations, isConfigured } from '../services/mapsService';

describe('Maps Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns fallback locations when API key is missing', async () => {
    vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', '');
    expect(isConfigured()).toBe(false);
    const result = await searchPollingLocations('Delhi');
    expect(result.ok).toBe(true);
    expect(result.source).toBe('fallback');
    expect(result.data.length).toBeGreaterThan(0);
    vi.unstubAllEnvs();
  });

  it('returns error for invalid query', async () => {
    const result = await searchPollingLocations('');
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Invalid query');
  });

  it('returns error for null query', async () => {
    const result = await searchPollingLocations(null);
    expect(result.ok).toBe(false);
  });

  it('filters fallback locations by query', async () => {
    vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', '');
    const result = await searchPollingLocations('Delhi');
    expect(result.data.some(loc => loc.address.includes('Delhi'))).toBe(true);
    vi.unstubAllEnvs();
  });

  it('returns all fallbacks when no match found', async () => {
    vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', '');
    const result = await searchPollingLocations('xyznonexistent');
    expect(result.ok).toBe(true);
    expect(result.data.length).toBe(5); // all fallback locations
    vi.unstubAllEnvs();
  });

  it('getFallbackLocations returns static array', () => {
    const locations = getFallbackLocations();
    expect(locations).toHaveLength(5);
    expect(locations[0]).toHaveProperty('name');
    expect(locations[0]).toHaveProperty('address');
    expect(locations[0]).toHaveProperty('lat');
    expect(locations[0]).toHaveProperty('lng');
  });

  it('returns Google Maps results on successful API call', async () => {
    vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', 'test-key');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        status: 'OK',
        results: [
          { name: 'Test Booth', formatted_address: '123 Test St', geometry: { location: { lat: 28.6, lng: 77.2 } } },
        ],
      }),
    });

    const result = await searchPollingLocations('Test Area');
    expect(result.ok).toBe(true);
    expect(result.source).toBe('google-maps');
    expect(result.data[0].name).toBe('Test Booth');

    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('handles ZERO_RESULTS from Google Maps', async () => {
    vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', 'test-key');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'ZERO_RESULTS' }),
    });

    const result = await searchPollingLocations('Middle of Ocean');
    expect(result.ok).toBe(false);
    expect(result.error).toContain('No polling locations');

    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('handles REQUEST_DENIED from Google Maps', async () => {
    vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', 'bad-key');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'REQUEST_DENIED' }),
    });

    const result = await searchPollingLocations('Delhi unique query 123');
    expect(result.source).toBe('fallback');
    expect(result.data.length).toBeGreaterThan(0); // falls back to static

    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('falls back on network error', async () => {
    vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', 'test-key');
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

    const result = await searchPollingLocations('Mumbai');
    expect(result.ok).toBe(true);
    expect(result.source).toBe('fallback');

    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });
});
