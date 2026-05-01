import { describe, it, expect } from 'vitest';
import { formatCalendarDate, createCalendarLink, getElectionReminders } from '../services/calendarService';

describe('Calendar Service', () => {
  describe('formatCalendarDate', () => {
    it('formats a Date to Google Calendar format', () => {
      const date = new Date('2025-11-05T07:00:00Z');
      const result = formatCalendarDate(date);
      expect(result).toMatch(/^\d{8}T\d{6}Z$/);
      expect(result).toContain('20251105');
    });

    it('returns empty string for invalid date', () => {
      expect(formatCalendarDate(new Date('invalid'))).toBe('');
      expect(formatCalendarDate(null)).toBe('');
      expect(formatCalendarDate('not-a-date')).toBe('');
    });
  });

  describe('createCalendarLink', () => {
    it('creates a valid Google Calendar deep-link URL', () => {
      const link = createCalendarLink({
        title: 'Election Day',
        description: 'Cast your vote',
        startDate: new Date('2025-11-05T07:00:00Z'),
        endDate: new Date('2025-11-05T18:00:00Z'),
        location: 'Polling Booth, Delhi',
      });

      expect(link).toContain('https://calendar.google.com/calendar/render');
      expect(link).toContain('action=TEMPLATE');
      expect(link).toContain('Election+Day');
      expect(link).toContain('location=');
    });

    it('works without optional location', () => {
      const link = createCalendarLink({
        title: 'Test Event',
        description: 'Desc',
        startDate: new Date('2025-01-01T10:00:00Z'),
        endDate: new Date('2025-01-01T11:00:00Z'),
      });

      expect(link).toContain('calendar.google.com');
      expect(link).not.toContain('location=');
    });

    it('returns empty string for missing required fields', () => {
      expect(createCalendarLink({})).toBe('');
      expect(createCalendarLink({ title: 'No dates' })).toBe('');
      expect(createCalendarLink(null)).toBe('');
    });
  });

  describe('getElectionReminders', () => {
    it('returns 3 election reminder events', () => {
      const reminders = getElectionReminders();
      expect(reminders).toHaveLength(3);
    });

    it('each reminder has id, title, description, and link', () => {
      const reminders = getElectionReminders();
      for (const r of reminders) {
        expect(r.id).toBeTruthy();
        expect(r.title).toBeTruthy();
        expect(r.description).toBeTruthy();
        expect(r.link).toContain('calendar.google.com');
      }
    });

    it('includes registration, polling, and result reminders', () => {
      const reminders = getElectionReminders();
      const ids = reminders.map(r => r.id);
      expect(ids).toContain('registration-deadline');
      expect(ids).toContain('polling-day');
      expect(ids).toContain('result-day');
    });
  });
});
