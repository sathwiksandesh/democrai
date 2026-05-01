import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Header from '../components/Header';

describe('Header Component', () => {
  it('renders the app title as h1', () => {
    render(<Header />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toBe('DemocrAI');
  });

  it('renders the "Beta" badge', () => {
    render(<Header />);
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('has role="banner" for accessibility', () => {
    render(<Header />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders the logo image', () => {
    render(<Header />);
    const img = document.querySelector('img[src="/logo.png"]');
    expect(img).toBeTruthy();
  });
});
