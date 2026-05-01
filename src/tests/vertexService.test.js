import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cosineSimilarity, keywordFallback, findRelevantFaq, isConfigured } from '../services/vertexService';

describe('Vertex AI Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('cosineSimilarity', () => {
    it('returns 1 for identical vectors', () => {
      expect(cosineSimilarity([1, 0, 0], [1, 0, 0])).toBeCloseTo(1.0);
    });

    it('returns 0 for orthogonal vectors', () => {
      expect(cosineSimilarity([1, 0, 0], [0, 1, 0])).toBeCloseTo(0.0);
    });

    it('returns 0 for length mismatch', () => {
      expect(cosineSimilarity([1, 2], [1])).toBe(0);
    });

    it('returns 0 for zero magnitude vectors', () => {
      expect(cosineSimilarity([0, 0], [0, 0])).toBe(0);
    });

    it('returns 0 for empty arrays', () => {
      expect(cosineSimilarity([], [])).toBe(0);
    });

    it('returns 0 for null/undefined input', () => {
      expect(cosineSimilarity(null, [1])).toBe(0);
      expect(cosineSimilarity([1], undefined)).toBe(0);
    });

    it('handles sparse vectors with missing values', () => {
      const result = cosineSimilarity([1, undefined, 3], [1, 2, undefined]);
      expect(typeof result).toBe('number');
    });
  });

  describe('keywordFallback', () => {
    it('finds FAQ matching voter registration keywords', () => {
      const result = keywordFallback('How do I register to vote?');
      expect(result).not.toBeNull();
      expect(result.answer.length).toBeGreaterThan(10);
    });

    it('finds FAQ matching polling booth keywords', () => {
      const result = keywordFallback('Where is my polling booth?');
      expect(result).not.toBeNull();
      expect(result.answer).toContain('polling');
    });

    it('returns null for completely irrelevant query', () => {
      const result = keywordFallback('What is the weather today xyz');
      expect(result).toBeNull();
    });

    it('finds FAQ for voter ID keywords', () => {
      const result = keywordFallback('How to get voter id card EPIC');
      expect(result).not.toBeNull();
      expect(result.score).toBeGreaterThan(0);
    });

    it('finds FAQ for EVM keywords', () => {
      const result = keywordFallback('How does the EVM electronic machine work?');
      expect(result).not.toBeNull();
    });
  });

  describe('findRelevantFaq', () => {
    it('returns null for empty query', async () => {
      expect(await findRelevantFaq('')).toBeNull();
      expect(await findRelevantFaq(null)).toBeNull();
    });

    it('uses keyword fallback when Vertex AI is not configured', async () => {
      vi.stubEnv('VITE_VERTEX_API_KEY', '');
      expect(isConfigured()).toBe(false);
      const result = await findRelevantFaq('register to vote');
      expect(result).not.toBeNull();
      expect(result.answer).toBeTruthy();
      vi.unstubAllEnvs();
    });

    it('returns result with score for keyword matches', async () => {
      vi.stubEnv('VITE_VERTEX_API_KEY', '');
      const result = await findRelevantFaq('eligible age 18 vote citizen');
      expect(result).not.toBeNull();
      expect(result.score).toBeGreaterThan(0.2);
      vi.unstubAllEnvs();
    });
  });
});
