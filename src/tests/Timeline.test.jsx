import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Timeline from '../components/Timeline';
import * as firebaseService from '../services/firebaseService';

vi.mock('../services/firebaseService');

describe('Timeline Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it('renders static fallback data immediately (no loading state)', () => {
    // Timeline starts with TIMELINE_EVENTS and loading=false
    firebaseService.fetchElectionEvents.mockResolvedValue(null);
    render(<Timeline />);

    // Static data labels from electionData.js
    expect(screen.getByText('Registration Deadline')).toBeInTheDocument();
    expect(screen.getByText('Election Day')).toBeInTheDocument();
    expect(screen.getByText('Result Declaration')).toBeInTheDocument();
  });

  it('renders the section heading', () => {
    firebaseService.fetchElectionEvents.mockResolvedValue(null);
    render(<Timeline />);
    expect(screen.getByText('Timeline')).toBeInTheDocument();
  });

  it('renders the footer caption', () => {
    firebaseService.fetchElectionEvents.mockResolvedValue(null);
    render(<Timeline />);
    expect(screen.getByText('Data synced securely')).toBeInTheDocument();
  });

  it('replaces static data with firebase data when available', async () => {
    firebaseService.fetchElectionEvents.mockResolvedValue([
      { id: '1', date: 'Jan 1, 2026', label: 'Test Event 1', description: 'Desc 1', status: 'upcoming' },
    ]);
    render(<Timeline />);

    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    });
    expect(screen.getByText('Desc 1')).toBeInTheDocument();
  });

  it('keeps static data when firebase returns empty array', async () => {
    firebaseService.fetchElectionEvents.mockResolvedValue([]);
    render(<Timeline />);

    // Wait for useEffect to settle
    await waitFor(() => {
      expect(firebaseService.fetchElectionEvents).toHaveBeenCalled();
    });

    // Static data should still be present
    expect(screen.getByText('Registration Deadline')).toBeInTheDocument();
  });

  it('keeps static data when firebase throws', async () => {
    firebaseService.fetchElectionEvents.mockRejectedValue(new Error('Network error'));
    render(<Timeline />);

    await waitFor(() => {
      expect(firebaseService.fetchElectionEvents).toHaveBeenCalled();
    });

    expect(screen.getByText('Registration Deadline')).toBeInTheDocument();
  });

  it('has proper ARIA attributes', () => {
    firebaseService.fetchElectionEvents.mockResolvedValue(null);
    render(<Timeline />);
    const section = screen.getByRole('region', { hidden: true }) || document.querySelector('[aria-labelledby="timeline-heading"]');
    expect(section).toBeTruthy();
  });
});
