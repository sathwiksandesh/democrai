import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock firebase modules before importing the service
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(),
  getDocs: vi.fn(),
}));

import { fetchElectionEvents } from '../services/firebaseService';
import { getDocs, collection } from 'firebase/firestore';

describe('Firebase Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns mapped documents on successful fetch', async () => {
    getDocs.mockResolvedValue({
      docs: [
        { id: 'e1', data: () => ({ label: 'Registration', date: 'Oct 15, 2025' }) },
        { id: 'e2', data: () => ({ label: 'Election Day', date: 'Nov 5, 2025' }) },
      ],
    });

    const result = await fetchElectionEvents();
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('e1');
    expect(result[0].label).toBe('Registration');
  });

  it('returns null when Firestore fetch fails', async () => {
    getDocs.mockRejectedValue(new Error('Network error'));
    const result = await fetchElectionEvents();
    expect(result).toBeNull();
  });

  it('returns null when Firestore fetch times out', async () => {
    getDocs.mockImplementation(() => new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), 100)
    ));
    const result = await fetchElectionEvents();
    expect(result).toBeNull();
  });
});
