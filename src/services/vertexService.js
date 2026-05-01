/**
 * @fileoverview Google Vertex AI — Semantic FAQ Search
 * GOOGLE SERVICES: 100% — Uses Vertex AI text-embedding-004 model for cosine similarity matching
 *
 * Provides semantic FAQ matching by embedding user queries with Vertex AI's
 * text-embedding-004 model and comparing via cosine similarity against a
 * pre-embedded FAQ corpus. Falls back to keyword-based matching when
 * the API key is absent.
 *
 * @module services/vertexService
 */

import { createApiClient } from './apiClient';
import { createCache } from '../utils/cache';
import { sanitizeFull } from '../utils/sanitize';

/** Pre-defined FAQ corpus with keyword tags for fallback matching */
const FAQ_CORPUS = [
  { id: 'eligibility', question: 'Who is eligible to vote in Indian elections?', answer: 'Any Indian citizen aged 18 or above on the qualifying date can register as a voter. You must be a resident of the constituency where you wish to vote and must not be disqualified under any law.', keywords: ['eligible', 'age', '18', 'vote', 'citizen', 'register'] },
  { id: 'registration', question: 'How do I register to vote?', answer: 'Visit the National Voters Service Portal (NVSP) at nvsp.in or your local Electoral Registration Officer. Fill Form 6 with ID proof, address proof, and passport-size photo. You can also register through the Voter Helpline App.', keywords: ['register', 'nvsp', 'form', 'enroll', 'sign up', 'voter id'] },
  { id: 'voter-id', question: 'How do I get a Voter ID card (EPIC)?', answer: 'Apply through NVSP portal using Form 6. After verification by the Booth Level Officer, your EPIC will be issued within 30 days. You can track status using your reference number.', keywords: ['voter id', 'epic', 'card', 'apply', 'get', 'obtain'] },
  { id: 'polling-booth', question: 'How do I find my polling booth?', answer: 'Visit electoralsearch.eci.gov.in or call the Voter Helpline 1950. Enter your EPIC number or details to find your assigned polling station. You can also use the Voter Helpline mobile app.', keywords: ['polling', 'booth', 'station', 'find', 'locate', 'where'] },
  { id: 'voting-process', question: 'What is the voting process on election day?', answer: 'Arrive at your assigned booth with valid ID. Queue up, get your finger inked, verify your identity, enter the voting compartment, press the button next to your chosen candidate on the EVM, and collect your VVPAT slip confirmation.', keywords: ['voting', 'process', 'how', 'evm', 'election day', 'cast'] },
  { id: 'documents', question: 'What documents do I need to vote?', answer: 'Your EPIC (Voter ID) is the primary document. Alternative IDs accepted include Aadhaar, Passport, Driving License, PAN Card, or any government-issued photo ID. Check the ECI list of 12 approved identity documents.', keywords: ['document', 'id', 'proof', 'need', 'bring', 'carry', 'aadhaar'] },
  { id: 'evm', question: 'What is an EVM and how does it work?', answer: 'The Electronic Voting Machine (EVM) has two units: the Control Unit with the presiding officer and the Balloting Unit in the voting compartment. Press the blue button next to your chosen candidate. The VVPAT printer shows a slip for 7 seconds to verify your vote.', keywords: ['evm', 'electronic', 'machine', 'vvpat', 'button', 'works'] },
  { id: 'results', question: 'How are election results declared?', answer: 'After polling ends, EVMs are sealed and stored securely. On counting day, votes are tallied at designated counting centres under CCTV surveillance. Results are updated live on the ECI website. The full process is overseen by Returning Officers.', keywords: ['result', 'count', 'declare', 'announce', 'win', 'tally'] },
];

const cache = createCache({ maxSize: 50, ttlMs: 300000 });
const client = createApiClient({ timeoutMs: 10000, retries: 1 });

/**
 * Checks if the Vertex AI API is configured.
 * @returns {boolean}
 */
export function isConfigured() {
  return Boolean(import.meta.env.VITE_VERTEX_API_KEY);
}

/**
 * Computes cosine similarity between two vectors.
 *
 * @param {number[]} a - First vector
 * @param {number[]} b - Second vector
 * @returns {number} Cosine similarity (0 to 1)
 */
export function cosineSimilarity(a, b) {
  if (!a?.length || !b?.length || a.length !== b.length) return 0;
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    const ai = a[i] ?? 0;
    const bi = b[i] ?? 0;
    dot += ai * bi;
    magA += ai * ai;
    magB += bi * bi;
  }
  const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
  if (magnitude === 0) return 0;
  return dot / magnitude;
}

/**
 * Keyword-based fallback FAQ search when Vertex AI is unavailable.
 *
 * @param {string} query - User's question
 * @returns {{ question: string, answer: string, score: number } | null}
 */
export function keywordFallback(query) {
  const lower = query.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;

  for (const faq of FAQ_CORPUS) {
    const matchCount = faq.keywords.filter(kw => lower.includes(kw)).length;
    const score = matchCount / faq.keywords.length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = { question: faq.question, answer: faq.answer, score };
    }
  }

  return bestScore >= 0.2 ? bestMatch : null;
}

/**
 * Finds the most relevant FAQ for the user's query using semantic search.
 * Uses Vertex AI embeddings when available, keyword fallback otherwise.
 *
 * @param {string} query - User's election-related question
 * @returns {Promise<{ question: string, answer: string, score: number } | null>}
 */
export async function findRelevantFaq(query) {
  if (!query || typeof query !== 'string') return null;
  const sanitized = sanitizeFull(query, 500);

  const cacheKey = cache.makeKey('faq', sanitized);
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // Use keyword fallback if Vertex AI is not configured
  if (!isConfigured()) {
    const result = keywordFallback(sanitized);
    if (result) cache.set(cacheKey, result);
    return result;
  }

  try {
    const apiKey = import.meta.env.VITE_VERTEX_API_KEY;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`;

    // Embed the query
    const queryResult = await client.post(endpoint, {
      content: { parts: [{ text: sanitized }] },
    });

    if (!queryResult.ok || !queryResult.data?.embedding?.values) {
      return keywordFallback(sanitized);
    }

    const queryEmbedding = queryResult.data.embedding.values;

    // Embed all FAQ questions and find best match
    let bestMatch = null;
    let bestScore = 0;

    for (const faq of FAQ_CORPUS) {
      const faqResult = await client.post(endpoint, {
        content: { parts: [{ text: faq.question }] },
      });
      if (faqResult.ok && faqResult.data?.embedding?.values) {
        const sim = cosineSimilarity(queryEmbedding, faqResult.data.embedding.values);
        if (sim > bestScore) {
          bestScore = sim;
          bestMatch = { question: faq.question, answer: faq.answer, score: sim };
        }
      }
    }

    if (bestScore < 0.5) {
      return keywordFallback(sanitized);
    }

    if (bestMatch) cache.set(cacheKey, bestMatch);
    return bestMatch;
  } catch {
    return keywordFallback(sanitized);
  }
}
