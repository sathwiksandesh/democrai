import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Firebase project credentials are stored in .env and injected by Vite at build time.
// Never commit real keys — use .env.example as a template for team members.
const firebaseConfig = {
  apiKey:    import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId:     import.meta.env.VITE_FIREBASE_APP_ID,
};

// Use module-level vars so Firebase is initialised once per page load.
let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  db  = getFirestore(app);
} catch (error) {
  // Likely caused by missing or invalid env vars.
  console.error('Firebase initialization failed:', error);
}

/**
 * Executes an async function with a timeout and retry mechanism.
 * @param {Function} fn - The async function to execute.
 * @param {number} retries - Number of retry attempts.
 * @param {number} timeoutMs - Timeout per attempt in milliseconds.
 */
async function withTimeoutAndRetry(fn, retries = 2, timeoutMs = 5000) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await Promise.race([
        fn(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
        )
      ]);
      return result;
    } catch (error) {
      if (attempt === retries) throw error;
      // Wait before retrying (exponential backoff)
      await new Promise(res => setTimeout(res, 500 * Math.pow(2, attempt)));
    }
  }
}

/**
 * Fetches election events from the Firestore `electionEvents` collection.
 *
 * Returns an empty array (not null) on success so callers don't need null checks.
 * Returns null on failure so callers can detect the error and fall back gracefully.
 *
 * @returns {Promise<Array|null>} Array of event objects, or null on error.
 */
export async function fetchElectionEvents() {
  // Short-circuit if Firebase failed to initialise (e.g. missing env vars)
  if (!db) return null;

  try {
    const snapshot = await withTimeoutAndRetry(() => getDocs(collection(db, 'electionEvents')));

    // Map each Firestore document to a plain object, preserving the doc ID
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    // Non-fatal — ad-blockers and network issues land here frequently.
    // Warn instead of error so it doesn't look alarming in production logs.
    console.warn('fetchElectionEvents: could not reach Firestore, using static fallback.', error);
    return null;
  }
}
