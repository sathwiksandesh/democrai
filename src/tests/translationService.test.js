import { describe, it, expect, vi, beforeEach } from 'vitest';
import { translateText, translateBatch, isConfigured, SUPPORTED_LANGUAGES } from '../services/translationService';

describe('Translation Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('exports 8 supported Indian languages', () => {
    expect(SUPPORTED_LANGUAGES).toHaveLength(8);
    expect(SUPPORTED_LANGUAGES.map(l => l.code)).toContain('hi');
    expect(SUPPORTED_LANGUAGES.map(l => l.code)).toContain('ta');
  });

  it('returns original text when target is English', async () => {
    const result = await translateText('Hello', 'en');
    expect(result).toBe('Hello');
  });

  it('returns original text when input is empty', async () => {
    const result = await translateText('', 'hi');
    expect(result).toBe('');
  });

  it('returns original text when API key is missing', async () => {
    vi.stubEnv('VITE_GOOGLE_TRANSLATE_API_KEY', '');
    expect(isConfigured()).toBe(false);
    const result = await translateText('Hello', 'hi');
    expect(result).toBe('Hello');
    vi.unstubAllEnvs();
  });

  it('returns translated text on successful API call', async () => {
    vi.stubEnv('VITE_GOOGLE_TRANSLATE_API_KEY', 'test-key');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: { translations: [{ translatedText: 'नमस्ते' }] },
      }),
    });

    const result = await translateText('Hello', 'hi');
    expect(result).toBe('नमस्ते');

    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('returns cached result on second call', async () => {
    vi.stubEnv('VITE_GOOGLE_TRANSLATE_API_KEY', 'test-key');
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: { translations: [{ translatedText: 'cached' }] },
      }),
    });

    await translateText('cache test', 'ta');
    const result2 = await translateText('cache test', 'ta');
    expect(result2).toBe('cached');
    // fetch should only be called once due to cache
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('returns original text on API failure', async () => {
    vi.stubEnv('VITE_GOOGLE_TRANSLATE_API_KEY', 'test-key');
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('API down'));

    const result = await translateText('Fallback', 'hi');
    expect(result).toBe('Fallback');

    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('translateBatch returns originals when API key is missing', async () => {
    vi.stubEnv('VITE_GOOGLE_TRANSLATE_API_KEY', '');
    const result = await translateBatch(['Hello', 'World'], 'hi');
    expect(result).toEqual(['Hello', 'World']);
    vi.unstubAllEnvs();
  });

  it('translateBatch returns originals for English target', async () => {
    const result = await translateBatch(['Hello'], 'en');
    expect(result).toEqual(['Hello']);
  });

  it('translateBatch returns empty array for null input', async () => {
    const result = await translateBatch(null, 'hi');
    expect(result).toEqual([]);
  });
});
