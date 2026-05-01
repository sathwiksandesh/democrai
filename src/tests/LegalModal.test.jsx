import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LegalModal from '../components/LegalModal';

describe('LegalModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when docType is falsy', () => {
    const { container } = render(<LegalModal docType={null} onClose={vi.fn()} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders privacy policy content', () => {
    render(<LegalModal docType="privacy" onClose={vi.fn()} />);
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText(/your privacy is our priority/)).toBeInTheDocument();
    expect(screen.getByText('Data Collection')).toBeInTheDocument();
    expect(screen.getByText('AI Processing')).toBeInTheDocument();
    expect(screen.getByText('Data Sharing')).toBeInTheDocument();
  });

  it('renders terms of service content', () => {
    render(<LegalModal docType="terms" onClose={vi.fn()} />);
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    expect(screen.getByText('Educational Purpose')).toBeInTheDocument();
    expect(screen.getByText('User Conduct')).toBeInTheDocument();
    expect(screen.getByText('Disclaimer of Warranties')).toBeInTheDocument();
  });

  it('renders data guidelines content', () => {
    render(<LegalModal docType="data" onClose={vi.fn()} />);
    expect(screen.getByText('Data Guidelines')).toBeInTheDocument();
    expect(screen.getByText('Do Not Share PII')).toBeInTheDocument();
    expect(screen.getByText('Session Data')).toBeInTheDocument();
    expect(screen.getByText('Feedback Loop')).toBeInTheDocument();
  });

  it('calls onClose when "I Understand" button is clicked', () => {
    const onClose = vi.fn();
    render(<LegalModal docType="privacy" onClose={onClose} />);
    fireEvent.click(screen.getByText('I Understand'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close (X) button is clicked', () => {
    const onClose = vi.fn();
    render(<LegalModal docType="privacy" onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close modal'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    render(<LegalModal docType="terms" onClose={onClose} />);
    const backdrop = document.querySelector('[aria-hidden="true"]');
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('has proper dialog ARIA attributes', () => {
    render(<LegalModal docType="privacy" onClose={vi.fn()} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-labelledby')).toBe('modal-title');
  });

  it('prevents body scrolling when open', () => {
    render(<LegalModal docType="privacy" onClose={vi.fn()} />);
    expect(document.body.style.overflow).toBe('hidden');
  });
});
