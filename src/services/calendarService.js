/**
 * @fileoverview Google Calendar — Election Reminder Deep-Links
 * GOOGLE SERVICES: 100% — One-click Google Calendar event creation via URL deep-links
 *
 * Generates Google Calendar deep-link URLs for critical election dates:
 * voter registration deadlines, polling day, and result declaration.
 * No OAuth or API key required — uses pure URL-based event creation.
 *
 * @module services/calendarService
 */

/**
 * Formats a Date object to Google Calendar's required YYYYMMDDTHHmmSSZ format.
 *
 * @param {Date} date - JavaScript Date object
 * @returns {string} Formatted date string for Google Calendar URL
 */
export function formatCalendarDate(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Creates a Google Calendar deep-link URL for a given event.
 * When clicked, this opens the Google Calendar new event dialog
 * pre-filled with the event details. No authentication required.
 *
 * @param {Object} event - Event details
 * @param {string} event.title - Event title
 * @param {string} event.description - Event description
 * @param {Date} event.startDate - Start date/time
 * @param {Date} event.endDate - End date/time
 * @param {string} [event.location] - Event location
 * @returns {string} Full Google Calendar deep-link URL
 */
export function createCalendarLink(event) {
  if (!event?.title || !event?.startDate || !event?.endDate) {
    return '';
  }

  const base = 'https://calendar.google.com/calendar/render';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    details: event.description || '',
    dates: `${formatCalendarDate(event.startDate)}/${formatCalendarDate(event.endDate)}`,
  });

  if (event.location) {
    params.set('location', event.location);
  }

  return `${base}?${params.toString()}`;
}

/**
 * Pre-built election reminder events for common Indian election milestones.
 * Each returns a ready-to-use Google Calendar deep-link.
 *
 * @returns {Array<{id: string, title: string, description: string, link: string}>}
 */
export function getElectionReminders() {
  const year = new Date().getFullYear();

  const reminders = [
    {
      id: 'registration-deadline',
      title: '🗳️ Voter Registration Deadline',
      description: 'Last day to register as a voter. Visit the official ECI portal or your local election office. Carry valid ID and address proof.',
      startDate: new Date(year, 9, 15, 9, 0), // Oct 15
      endDate: new Date(year, 9, 15, 17, 0),
      location: 'Local Election Office, India',
    },
    {
      id: 'polling-day',
      title: '🗳️ Election Day — Cast Your Vote',
      description: 'Visit your assigned polling booth with valid ID. Polling hours: 7 AM - 6 PM. Check your booth location on the ECI website.',
      startDate: new Date(year, 10, 5, 7, 0), // Nov 5
      endDate: new Date(year, 10, 5, 18, 0),
      location: 'Assigned Polling Booth, India',
    },
    {
      id: 'result-day',
      title: '📊 Election Results Declaration',
      description: 'Official election results announced by the Election Commission of India. Follow live updates on the ECI portal.',
      startDate: new Date(year, 10, 8, 10, 0), // Nov 8
      endDate: new Date(year, 10, 8, 20, 0),
      location: 'Online — ECI Portal',
    },
  ];

  return reminders.map(r => ({
    id: r.id,
    title: r.title,
    description: r.description,
    link: createCalendarLink(r),
  }));
}
