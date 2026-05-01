import { describe, it, expect, vi, beforeEach } from 'vitest';
import { normaliseSentiment, trackQuery, isNlpConfigured, isFirestoreConfigured } from '../services/analyticsService';

describe('Analytics Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('normaliseSentiment', () => {
    it('returns positive for score > 0.15', () => {
      expect(normaliseSentiment({ score: 0.5, magnitude: 1.0 })).toBe('positive');
    });

    it('returns negative for score < -0.15', () => {
      expect(normaliseSentiment({ score: -0.5, magnitude: 1.0 })).toBe('negative');
    });

    it('returns neutral for score between -0.15 and 0.15', () => {
      expect(normaliseSentiment({ score: 0.0, magnitude: 0.1 })).toBe('neutral');
      expect(normaliseSentiment({ score: 0.1, magnitude: 0.1 })).toBe('neutral');
      expect(normaliseSentiment({ score: -0.1, magnitude: 0.5 })).toBe('neutral');
    });

    it('returns neutral when sentiment is undefined', () => {
      expect(normaliseSentiment(undefined)).toBe('neutral');
      expect(normaliseSentiment(null)).toBe('neutral');
    });
  });

  describe('isNlpConfigured', () => {
    it('returns false when API key is missing', () => {
      vi.stubEnv('VITE_GOOGLE_NLP_API_KEY', '');
      expect(isNlpConfigured()).toBe(false);
      vi.unstubAllEnvs();
    });

    it('returns true when API key is set', () => {
      vi.stubEnv('VITE_GOOGLE_NLP_API_KEY', 'test-key');
      expect(isNlpConfigured()).toBe(true);
      vi.unstubAllEnvs();
    });
  });

  describe('isFirestoreConfigured', () => {
    it('returns false when project ID is missing', () => {
      vi.stubEnv('VITE_FIREBASE_PROJECT_ID', '');
      expect(isFirestoreConfigured()).toBe(false);
      vi.unstubAllEnvs();
    });
  });

  describe('trackQuery', () => {
    it('completes without error even when APIs are unconfigured', async () => {
      vi.stubEnv('VITE_GOOGLE_NLP_API_KEY', '');
      vi.stubEnv('VITE_FIREBASE_PROJECT_ID', '');
      await expect(trackQuery('test query')).resolves.toBeUndefined();
      vi.unstubAllEnvs();
    });

    it('completes without error when NLP call fails', async () => {
      vi.stubEnv('VITE_GOOGLE_NLP_API_KEY', 'test-key');
      vi.stubEnv('VITE_FIREBASE_PROJECT_ID', '');
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('NLP down'));

      await expect(trackQuery('test crash')).resolves.toBeUndefined();

      vi.restoreAllMocks();
      vi.unstubAllEnvs();
    });

    it('is fail-silent — never throws', async () => {
      vi.stubEnv('VITE_GOOGLE_NLP_API_KEY', 'key');
      vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'proj');
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('total failure'));

      // Should NOT throw
      await expect(trackQuery('anything')).resolves.toBeUndefined();

      vi.restoreAllMocks();
      vi.unstubAllEnvs();
    });
  });
});
