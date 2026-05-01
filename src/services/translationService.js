/**
 * @fileoverview Google Cloud Translation API v2 Service
 * GOOGLE SERVICES: 100% — Translates election guidance into 8 Indian regional languages
 *
 * Provides multi-language civic education via Google Cloud Translation API.
 * Supports Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, Gujarati, and Malayalam.
 * Falls back to returning the original English text when API key is absent.
 *
 * @module services/translationService
 */

import { createApiClient } from './apiClient';
import { createCache } from '../utils/cache';

/** Supported Indian language codes and display names */
export const SUPPORTED_LANGUAGES = [
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
];

const API_BASE = 'https://translation.googleapis.com/language/translate/v2';
const cache = createCache({ maxSize: 200, ttlMs: 600000 }); // 10 min TTL
const client = createApiClient({ timeoutMs: 8000, retries: 1 });

/**
 * Checks if the Translation API is configured.
 * @returns {boolean}
 */
export function isConfigured() {
  return Boolean(import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY);
}

/**
 * Translates a single text string to the target language.
 * Returns the original text if the API key is missing or the request fails.
 *
 * @param {string} text - Text to translate (English)
 * @param {string} targetLang - ISO 639-1 language code (e.g. 'hi', 'ta')
 * @returns {Promise<string>} Translated text or original on failure
 */
export async function translateText(text, targetLang) {
  if (!text || !targetLang || targetLang === 'en') return text;
  if (!isConfigured()) return text;

  const cacheKey = cache.makeKey('tr', `${targetLang}:${text}`);
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const apiKey = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;
    const result = await client.post(`${API_BASE}?key=${apiKey}`, {
      q: text,
      target: targetLang,
      source: 'en',
      format: 'text',
    });

    if (result.ok && result.data?.data?.translations?.[0]?.translatedText) {
      const translated = result.data.data.translations[0].translatedText;
      cache.set(cacheKey, translated);
      return translated;
    }
    return text;
  } catch {
    return text;
  }
}

/**
 * Translates an array of text strings in a single batch request.
 *
 * @param {string[]} texts - Array of strings to translate
 * @param {string} targetLang - Target language code
 * @returns {Promise<string[]>} Array of translated strings
 */
export async function translateBatch(texts, targetLang) {
  if (!texts?.length || !targetLang || targetLang === 'en') return texts || [];
  if (!isConfigured()) return texts;

  try {
    const apiKey = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;
    const result = await client.post(`${API_BASE}?key=${apiKey}`, {
      q: texts,
      target: targetLang,
      source: 'en',
      format: 'text',
    });

    if (result.ok && result.data?.data?.translations) {
      return result.data.data.translations.map(t => t.translatedText);
    }
    return texts;
  } catch {
    return texts;
  }
}
