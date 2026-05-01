import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Footer from '../components/Footer';

describe('Footer Component', () => {
  it('renders the brand name', () => {
    render(<Footer onOpenLegal={vi.fn()} />);
    expect(screen.getByText('DemocrAI')).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<Footer onOpenLegal={vi.fn()} />);
    expect(screen.getByText(/Demystifying the democratic process/)).toBeInTheDocument();
  });

  it('renders platform links', () => {
    render(<Footer onOpenLegal={vi.fn()} />);
    expect(screen.getByText('Voter Registration')).toBeInTheDocument();
    expect(screen.getByText('Election Tracking')).toBeInTheDocument();
  });

  it('renders legal links', () => {
    render(<Footer onOpenLegal={vi.fn()} />);
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    expect(screen.getByText('Data Guidelines')).toBeInTheDocument();
  });

  it('calls onOpenLegal with "privacy" when Privacy Policy is clicked', () => {
    const onOpenLegal = vi.fn();
    render(<Footer onOpenLegal={onOpenLegal} />);
    fireEvent.click(screen.getByText('Privacy Policy'));
    expect(onOpenLegal).toHaveBeenCalledWith('privacy');
  });

  it('calls onOpenLegal with "terms" when Terms is clicked', () => {
    const onOpenLegal = vi.fn();
    render(<Footer onOpenLegal={onOpenLegal} />);
    fireEvent.click(screen.getByText('Terms of Service'));
    expect(onOpenLegal).toHaveBeenCalledWith('terms');
  });

  it('calls onOpenLegal with "data" when Data Guidelines is clicked', () => {
    const onOpenLegal = vi.fn();
    render(<Footer onOpenLegal={onOpenLegal} />);
    fireEvent.click(screen.getByText('Data Guidelines'));
    expect(onOpenLegal).toHaveBeenCalledWith('data');
  });

  it('renders the copyright with current year', () => {
    render(<Footer onOpenLegal={vi.fn()} />);
    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()}`))).toBeInTheDocument();
  });

  it('renders "All systems operational" status', () => {
    render(<Footer onOpenLegal={vi.fn()} />);
    expect(screen.getByText(/All systems operational/)).toBeInTheDocument();
  });

  it('has contentinfo role for accessibility', () => {
    render(<Footer onOpenLegal={vi.fn()} />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
