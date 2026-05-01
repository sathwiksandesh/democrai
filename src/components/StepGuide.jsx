import React from 'react';
import StepCard from './StepCard';
import { ELECTION_STEPS } from '../constants/electionData';

/**
 * StepGuide — renders the full election step grid.
 *
 * Props:
 *   activeStep     {number}   Index of the currently expanded step
 *   completedSteps {Set}      Set of completed step IDs
 *   onStepClick    {Function} Called with (index) when a step card is clicked
 *   onMarkAsDone   {Function} Called with (stepId) when the "Mark as Done" button is clicked
 *   isStepLocked   {Function} Called with (index), returns true if the step is locked
 */
export default function StepGuide({ activeStep, completedSteps, onStepClick, onMarkAsDone, isStepLocked }) {
  return (
    <section aria-labelledby="steps-heading">
      {/* Section header with a decorative divider line */}
      <div className="flex items-center gap-4 mb-10">
        <h2 id="steps-heading" className="text-xs font-bold text-[#111111] uppercase tracking-[0.2em] opacity-80">
          Election Process
        </h2>
        <div className="h-px bg-gradient-to-r from-[#e5e5e5] to-transparent flex-grow"></div>
      </div>

      {/* 2-column grid on medium+ screens */}
      <div className="grid gap-6 md:grid-cols-2">
        {ELECTION_STEPS.map((step, index) => {
          const isActive    = activeStep === index;
          const isCompleted = completedSteps.has(step.id);
          const isLocked    = isStepLocked(index);

          return (
            <div
              key={step.id}
              className={`flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 ${isLocked ? 'opacity-50' : 'opacity-100'}`}
            >
              <StepCard
                step={step}
                isActive={isActive}
                isCompleted={isCompleted}
                isLocked={isLocked}
                onClick={() => onStepClick(index)}
              />

              {/* "Mark as Done" button — only shown for the active, unlocked, incomplete step */}
              {isActive && !isCompleted && !isLocked && (
                <button
                  onClick={() => onMarkAsDone(step.id)}
                  className="mt-4 mx-auto px-8 py-2 bg-black text-white text-xs font-bold rounded uppercase tracking-widest hover:bg-[#333333] active:scale-95 transition-all duration-200 shadow-sm"
                >
                  Mark as Done
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
