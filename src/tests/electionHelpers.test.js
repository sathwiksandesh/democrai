import { describe, it, expect } from 'vitest';
import { validateChatInput, truncateHistory, formatTimelineDate } from '../utils/electionHelpers';

describe('electionHelpers', () => {
  describe('validateChatInput', () => {
    it('returns valid: false for empty string', () => {
      expect(validateChatInput('')).toEqual({ valid: false, error: 'Message cannot be empty.' });
      expect(validateChatInput('   ')).toEqual({ valid: false, error: 'Message cannot be empty.' });
      expect(validateChatInput(null)).toEqual({ valid: false, error: 'Message cannot be empty.' });
    });

    it('returns valid: false for string over 500 chars', () => {
      const longString = 'a'.repeat(501);
      expect(validateChatInput(longString)).toEqual({ valid: false, error: 'Message exceeds the 500 character limit.' });
    });

    it('returns valid: true for normal message', () => {
      expect(validateChatInput('How do I vote?')).toEqual({ valid: true, error: '' });
    });
  });

  describe('truncateHistory', () => {
    it('returns last 10 items when given 15', () => {
      const history = Array.from({ length: 15 }, (_, i) => ({ id: i }));
      const result = truncateHistory(history, 10);
      expect(result).toHaveLength(10);
      expect(result[0].id).toBe(5);
      expect(result[9].id).toBe(14);
    });

    it('returns full array when given fewer than 10', () => {
      const history = Array.from({ length: 5 }, (_, i) => ({ id: i }));
      const result = truncateHistory(history, 10);
      expect(result).toHaveLength(5);
    });
  });

  describe('formatTimelineDate', () => {
    it('formats abbreviated month to full month name', () => {
      expect(formatTimelineDate('Nov 5, 2025')).toBe('November 5, 2025');
      expect(formatTimelineDate('Oct 15, 2025')).toBe('October 15, 2025');
    });

    it('returns original string if not in expected format', () => {
      expect(formatTimelineDate('2025-11-05')).toBe('2025-11-05');
      expect(formatTimelineDate('')).toBe('');
    });
  });
});
