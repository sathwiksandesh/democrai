import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StepGuide from '../components/StepGuide';

const defaultProps = {
  activeStep: 0,
  completedSteps: new Set(),
  onStepClick: vi.fn(),
  onMarkAsDone: vi.fn(),
  isStepLocked: (index) => index > 0,
};

describe('StepGuide Component', () => {
  it('renders the section heading', () => {
    render(<StepGuide {...defaultProps} />);
    expect(screen.getByText('Election Process')).toBeInTheDocument();
  });

  it('renders all 4 election steps', () => {
    render(<StepGuide {...defaultProps} />);
    expect(screen.getByText('Voter Registration')).toBeInTheDocument();
    expect(screen.getByText('Verification')).toBeInTheDocument();
    expect(screen.getByText('Voting Process')).toBeInTheDocument();
    expect(screen.getByText('Result Declaration')).toBeInTheDocument();
  });

  it('shows "Mark as Done" button for the active unlocked step', () => {
    render(<StepGuide {...defaultProps} />);
    expect(screen.getByText('Mark as Done')).toBeInTheDocument();
  });

  it('does not show "Mark as Done" for locked steps', () => {
    render(<StepGuide {...defaultProps} activeStep={1} />);
    // Step 1 is locked by default (index > 0), so Mark as Done should not appear
    expect(screen.queryByText('Mark as Done')).not.toBeInTheDocument();
  });

  it('does not show "Mark as Done" for completed steps', () => {
    render(<StepGuide {...defaultProps} completedSteps={new Set(['step-1'])} />);
    // Step 0 is active but completed
    expect(screen.queryByText('Mark as Done')).not.toBeInTheDocument();
  });

  it('calls onMarkAsDone when button is clicked', () => {
    const onMarkAsDone = vi.fn();
    render(<StepGuide {...defaultProps} onMarkAsDone={onMarkAsDone} />);
    fireEvent.click(screen.getByText('Mark as Done'));
    expect(onMarkAsDone).toHaveBeenCalledWith('step-1');
  });

  it('calls onStepClick when a step card is clicked', () => {
    const onStepClick = vi.fn();
    render(<StepGuide {...defaultProps} onStepClick={onStepClick} />);
    // Click on the first step card title
    fireEvent.click(screen.getByText('Voter Registration'));
    expect(onStepClick).toHaveBeenCalledWith(0);
  });

  it('has proper ARIA section labelling', () => {
    render(<StepGuide {...defaultProps} />);
    const heading = screen.getByText('Election Process');
    expect(heading.id).toBe('steps-heading');
  });
});
