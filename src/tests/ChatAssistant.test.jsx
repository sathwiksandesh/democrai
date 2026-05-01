import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChatAssistant from '../components/ChatAssistant';
import * as geminiService from '../services/geminiService';

vi.mock('../services/geminiService');

describe('ChatAssistant Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the floating open button initially', () => {
    render(<ChatAssistant />);
    expect(screen.getByLabelText('Open DemocrAI Assistant')).toBeInTheDocument();
  });

  it('opens the chat panel when button is clicked', async () => {
    render(<ChatAssistant />);
    const openBtn = screen.getByLabelText('Open DemocrAI Assistant');
    
    await act(async () => {
      fireEvent.click(openBtn);
    });

    expect(screen.getByText('DemocrAI Assistant')).toBeInTheDocument();
    expect(screen.getByText('Powered by Gemini 2.5 Flash')).toBeInTheDocument();
  });

  it('displays the welcome message', async () => {
    render(<ChatAssistant />);
    
    await act(async () => {
      fireEvent.click(screen.getByLabelText('Open DemocrAI Assistant'));
    });

    expect(screen.getByText(/I'm DemocrAI, powered by Google Gemini/)).toBeInTheDocument();
  });

  it('closes the panel when Close Assistant is clicked', async () => {
    render(<ChatAssistant />);
    
    await act(async () => {
      fireEvent.click(screen.getByLabelText('Open DemocrAI Assistant'));
    });

    const closeBtn = screen.getByLabelText('Close Assistant');
    
    await act(async () => {
      fireEvent.click(closeBtn);
    });

    // Open button should be visible again
    expect(screen.getByLabelText('Open DemocrAI Assistant')).toBeInTheDocument();
  });

  it('has accessible ARIA attributes', async () => {
    render(<ChatAssistant />);
    
    await act(async () => {
      fireEvent.click(screen.getByLabelText('Open DemocrAI Assistant'));
    });

    // Chat heading
    expect(screen.getByText('DemocrAI Assistant')).toBeInTheDocument();
    // Log role
    const log = document.querySelector('[role="log"]');
    expect(log).toBeTruthy();
    // aria-live
    expect(log.getAttribute('aria-live')).toBe('polite');
  });

  it('has a textarea with proper aria-label', async () => {
    render(<ChatAssistant />);
    
    await act(async () => {
      fireEvent.click(screen.getByLabelText('Open DemocrAI Assistant'));
    });

    const textarea = screen.getByLabelText('Ask an election question');
    expect(textarea).toBeInTheDocument();
    expect(textarea.getAttribute('maxlength')).toBe('500');
  });

  it('send button is disabled when input is empty', async () => {
    render(<ChatAssistant />);
    
    await act(async () => {
      fireEvent.click(screen.getByLabelText('Open DemocrAI Assistant'));
    });

    const sendBtn = screen.getByLabelText('Send message');
    expect(sendBtn).toBeDisabled();
  });

  it('shows character counter', async () => {
    render(<ChatAssistant />);
    
    await act(async () => {
      fireEvent.click(screen.getByLabelText('Open DemocrAI Assistant'));
    });

    expect(screen.getByText(/0/)).toBeInTheDocument();
    expect(screen.getByText(/500/)).toBeInTheDocument();
  });

  it('enables send button when text is entered', async () => {
    render(<ChatAssistant />);
    
    await act(async () => {
      fireEvent.click(screen.getByLabelText('Open DemocrAI Assistant'));
    });

    const textarea = screen.getByLabelText('Ask an election question');
    
    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'How do I register?' } });
    });

    const sendBtn = screen.getByLabelText('Send message');
    expect(sendBtn).not.toBeDisabled();
  });

  it('sends a message and displays AI response', async () => {
    vi.useRealTimers(); // Need real timers for async operations
    
    geminiService.askGemini.mockResolvedValue('Here is how to register as a voter.');
    render(<ChatAssistant />);

    fireEvent.click(screen.getByLabelText('Open DemocrAI Assistant'));

    const textarea = screen.getByLabelText('Ask an election question');
    fireEvent.change(textarea, { target: { value: 'How to register?' } });
    fireEvent.click(screen.getByLabelText('Send message'));

    // User message should appear
    expect(screen.getByText('How to register?')).toBeInTheDocument();

    // AI response should appear after mock resolves
    await waitFor(() => {
      expect(screen.getByText('Here is how to register as a voter.')).toBeInTheDocument();
    });

    expect(geminiService.askGemini).toHaveBeenCalledTimes(1);
  });

  it('shows error when Gemini API fails', async () => {
    vi.useRealTimers();

    geminiService.askGemini.mockRejectedValue(new Error('API error'));
    render(<ChatAssistant />);

    fireEvent.click(screen.getByLabelText('Open DemocrAI Assistant'));

    const textarea = screen.getByLabelText('Ask an election question');
    fireEvent.change(textarea, { target: { value: 'test query' } });
    fireEvent.click(screen.getByLabelText('Send message'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
