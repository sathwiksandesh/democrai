import { GUIDANCE_MESSAGES } from '../constants/electionData';

/**
 * Sanitizes input to prevent XSS.
 * @param {string} text - The input text to sanitize.
 * @returns {string} The sanitized text.
 */
export function sanitizeInput(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Validates the user chat input.
 * @param {string} text - The input text to validate.
 * @returns {{ valid: boolean, error: string }}
 */
export function validateChatInput(text) {
  if (!text || typeof text !== 'string') {
    return { valid: false, error: 'Message cannot be empty.' };
  }
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Message cannot be empty.' };
  }
  if (trimmed.length > 500) {
    return { valid: false, error: 'Message exceeds the 500 character limit.' };
  }
  return { valid: true, error: '' };
}

/**
 * Retrieves the guidance message based on the completed steps count.
 * @param {number} completedCount - The number of completed steps.
 * @returns {string} The guidance message.
 */
export function getGuidanceMessage(completedCount) {
  return GUIDANCE_MESSAGES[completedCount] || GUIDANCE_MESSAGES[0];
}

/**
 * Formats a short timeline date string into a full string.
 * e.g., "Nov 5, 2025" -> "November 5, 2025"
 * @param {string} dateString - The date string to format.
 * @returns {string} The formatted date string.
 */
export function formatTimelineDate(dateString) {
  if (!dateString) return '';
  const parts = dateString.split(' ');
  if (parts.length < 3) return dateString;
  
  const monthMap = {
    'Jan': 'January', 'Feb': 'February', 'Mar': 'March', 'Apr': 'April',
    'May': 'May', 'Jun': 'June', 'Jul': 'July', 'Aug': 'August',
    'Sep': 'September', 'Oct': 'October', 'Nov': 'November', 'Dec': 'December'
  };
  
  const month = monthMap[parts[0]] || parts[0];
  return `${month} ${parts[1]} ${parts[2]}`;
}

/**
 * Truncates the conversation history to the last maxItems.
 * @param {Array} history - The history array.
 * @param {number} maxItems - Maximum number of items to keep.
 * @returns {Array} The truncated history array.
 */
export function truncateHistory(history, maxItems = 10) {
  if (!Array.isArray(history)) return [];
  if (history.length <= maxItems) return history;
  return history.slice(history.length - maxItems);
}
