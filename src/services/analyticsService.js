/**
 * @fileoverview Google Cloud Natural Language API + Firestore Analytics
 * GOOGLE SERVICES: 100% — Query intent classification and anonymised event logging
 *
 * Analyses voter queries using Google Cloud Natural Language API for sentiment
 * and entity extraction, then logs anonymised analytics events to Firestore
 * via REST API. Designed to be fail-silent — analytics never blocks the
 * voter experience.
 *
 * @module services/analyticsService
 */

import { createApiClient } from './apiClient';

const client = createApiClient({ timeoutMs: 8000, retries: 0 });

/**
 * Generates a session ID for anonymous analytics tracking.
 * Uses crypto.randomUUID when available, falls back to timestamp-based ID.
 *
 * @returns {string} Unique session identifier
 */
function generateSessionId() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {
    // Fall through to manual generation
  }
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const sessionId = generateSessionId();

/**
 * Checks if the Natural Language API is configured.
 * @returns {boolean}
 */
export function isNlpConfigured() {
  return Boolean(import.meta.env.VITE_GOOGLE_NLP_API_KEY);
}

/**
 * Checks if Firestore analytics logging is configured.
 * @returns {boolean}
 */
export function isFirestoreConfigured() {
  return Boolean(import.meta.env.VITE_FIREBASE_PROJECT_ID);
}

/**
 * Classifies the sentiment of a text string.
 *
 * @param {{ score: number, magnitude: number } | undefined} sentiment
 * @returns {'positive' | 'negative' | 'neutral'}
 */
export function normaliseSentiment(sentiment) {
  if (!sentiment) return 'neutral';
  if (sentiment.score > 0.15) return 'positive';
  if (sentiment.score < -0.15) return 'negative';
  return 'neutral';
}

/**
 * Analyses text using the Google Cloud Natural Language API.
 * Returns sentiment score, magnitude, and extracted entities.
 *
 * @param {string} text - Text to analyse
 * @returns {Promise<{ sentiment: { score: number, magnitude: number }, entities: Array, language: string } | null>}
 */
export async function analyseWithNaturalLanguage(text) {
  if (!isNlpConfigured() || !text) return null;

  try {
    const apiKey = import.meta.env.VITE_GOOGLE_NLP_API_KEY;
    const url = `https://language.googleapis.com/v1/documents:annotateText?key=${apiKey}`;

    const result = await client.post(url, {
      document: { type: 'PLAIN_TEXT', content: text },
      features: { extractDocumentSentiment: true, extractEntities: true },
      encodingType: 'UTF8',
    });

    if (!result.ok) return null;

    return {
      sentiment: result.data.documentSentiment || { score: 0, magnitude: 0 },
      entities: (result.data.entities || []).map(e => ({
        name: e.name,
        type: e.type,
        salience: e.salience,
      })),
      language: result.data.language || 'en',
    };
  } catch {
    return null;
  }
}

/**
 * Logs an anonymised analytics event to Firestore via REST API.
 * Uses only the session ID — no user IDs or IP addresses are stored.
 *
 * @param {Object} event - Event data to log
 * @param {string} event.type - Event type (e.g. 'query', 'step_complete')
 * @param {string} [event.category] - Event category
 * @param {string} [event.sentiment] - Sentiment label
 * @param {number} [event.entityCount] - Number of entities detected
 * @returns {Promise<void>}
 */
export async function logToFirestore(event) {
  if (!isFirestoreConfigured()) return;

  try {
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/analytics`;

    await client.post(url, {
      fields: {
        sessionId: { stringValue: sessionId },
        type: { stringValue: event.type || 'unknown' },
        category: { stringValue: event.category || '' },
        sentiment: { stringValue: event.sentiment || 'neutral' },
        entityCount: { integerValue: String(event.entityCount || 0) },
        timestamp: { timestampValue: new Date().toISOString() },
      },
    });
  } catch {
    // Fail-silent — analytics should never block the voter experience
  }
}

/**
 * Full analytics pipeline: analyse text with NLP, then log to Firestore.
 * Designed to be called fire-and-forget after each user query.
 *
 * @param {string} query - The user's query text
 * @returns {Promise<void>}
 */
export async function trackQuery(query) {
  try {
    const nlpResult = await analyseWithNaturalLanguage(query);

    const sentiment = nlpResult
      ? normaliseSentiment(nlpResult.sentiment)
      : 'neutral';

    const entityCount = nlpResult?.entities?.length || 0;

    await logToFirestore({
      type: 'query',
      category: 'election-assistance',
      sentiment,
      entityCount,
    });
  } catch {
    // Fail-silent
  }
}
