import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import GuidanceBanner from '../components/GuidanceBanner';

describe('GuidanceBanner Component', () => {
  it('renders the "Current Guidance" label', () => {
    render(<GuidanceBanner completedCount={0} />);
    expect(screen.getByText('Current Guidance')).toBeInTheDocument();
  });

  it('shows step 0 guidance when no steps completed', () => {
    render(<GuidanceBanner completedCount={0} />);
    expect(screen.getByText(/Complete your voter registration/)).toBeInTheDocument();
  });

  it('shows step 1 guidance when 1 step completed', () => {
    render(<GuidanceBanner completedCount={1} />);
    expect(screen.getByText(/Wait for verification/)).toBeInTheDocument();
  });

  it('shows step 2 guidance when 2 steps completed', () => {
    render(<GuidanceBanner completedCount={2} />);
    expect(screen.getByText(/Prepare your ID/)).toBeInTheDocument();
  });

  it('shows completion message when all steps done', () => {
    render(<GuidanceBanner completedCount={4} />);
    expect(screen.getByText(/You're all set/)).toBeInTheDocument();
  });

  it('has live region for screen readers', () => {
    render(<GuidanceBanner completedCount={0} />);
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion.getAttribute('aria-live')).toBe('polite');
  });
});
