import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';

// Mock all child components to isolate App logic
vi.mock('../components/Header', () => ({
  default: () => <header data-testid="header">Header</header>,
}));

vi.mock('../components/StepGuide', () => ({
  default: ({ activeStep, onStepClick, onMarkAsDone, isStepLocked }) => (
    <div data-testid="step-guide">
      <span data-testid="active-step">{activeStep}</span>
      <button data-testid="click-step-1" onClick={() => onStepClick(1)}>Click Step 1</button>
      <button data-testid="mark-done-step-1" onClick={() => onMarkAsDone('step-1')}>Mark Step 1 Done</button>
      <span data-testid="step-1-locked">{String(isStepLocked(1))}</span>
    </div>
  ),
}));

vi.mock('../components/GuidanceBanner', () => ({
  default: ({ completedCount }) => <div data-testid="guidance-banner">Completed: {completedCount}</div>,
}));

vi.mock('../components/Timeline', () => ({
  default: () => <div data-testid="timeline">Timeline</div>,
}));

vi.mock('../components/ChatAssistant', () => ({
  default: () => <div data-testid="chat-assistant">ChatAssistant</div>,
}));

vi.mock('../components/Footer', () => ({
  default: ({ onOpenLegal }) => (
    <footer data-testid="footer">
      <button onClick={() => onOpenLegal('privacy')}>Terms &amp; Privacy</button>
    </footer>
  ),
}));

vi.mock('../components/LegalModal', () => ({
  default: ({ docType, onClose }) => (
    <div data-testid="legal-modal">
      <span>{docType}</span>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all main sections', () => {
    render(<App />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('step-guide')).toBeInTheDocument();
    expect(screen.getByTestId('guidance-banner')).toBeInTheDocument();
    expect(screen.getByTestId('timeline')).toBeInTheDocument();
    expect(screen.getByTestId('chat-assistant')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders hero section with title', () => {
    render(<App />);
    expect(screen.getByText('Democracy,')).toBeInTheDocument();
    expect(screen.getByText('simplified.')).toBeInTheDocument();
  });

  it('starts with step 0 active', () => {
    render(<App />);
    expect(screen.getByTestId('active-step').textContent).toBe('0');
  });

  it('step 1 is locked initially', () => {
    render(<App />);
    expect(screen.getByTestId('step-1-locked').textContent).toBe('true');
  });

  it('marks step 1 done and unlocks step 2', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('mark-done-step-1'));
    // After marking step-1 done, step 1 index should be unlocked
    expect(screen.getByTestId('step-1-locked').textContent).toBe('false');
    // Active step advances to 1
    expect(screen.getByTestId('active-step').textContent).toBe('1');
    // Completed count should be 1
    expect(screen.getByText('Completed: 1')).toBeInTheDocument();
  });

  it('opens and closes legal modal', () => {
    render(<App />);
    expect(screen.queryByTestId('legal-modal')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Terms & Privacy'));
    expect(screen.getByTestId('legal-modal')).toBeInTheDocument();
    expect(screen.getByText('privacy')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByTestId('legal-modal')).not.toBeInTheDocument();
  });

  it('does not allow clicking locked step', () => {
    render(<App />);
    // Step 1 is locked, clicking should not change activeStep
    fireEvent.click(screen.getByTestId('click-step-1'));
    expect(screen.getByTestId('active-step').textContent).toBe('0');
  });
});
