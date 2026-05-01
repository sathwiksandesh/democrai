import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import StepCard from '../components/StepCard';

describe('StepCard', () => {
  const mockStep = {
    id: 'step-1',
    stepNumber: 1,
    title: 'Test Step',
    description: 'Test description',
    userAction: 'Test action',
    icon: '📝'
  };

  it('renders step title correctly', () => {
    render(<StepCard step={mockStep} isActive={false} isCompleted={false} onClick={() => {}} />);
    expect(screen.getByText('Test Step')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('Test action')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('applies active styles when isActive=true', () => {
    render(<StepCard step={mockStep} isActive={true} isCompleted={false} onClick={() => {}} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button.className).toContain('border-black');
    expect(button.className).toContain('shadow-premium');
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<StepCard step={mockStep} isActive={false} isCompleted={false} onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('has correct aria-label', () => {
    render(<StepCard step={mockStep} isActive={false} isCompleted={false} onClick={() => {}} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Step 1: Test Step');
  });
});
