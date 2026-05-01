/**
 * @fileoverview App — Root application component for DemocrAI
 * Orchestrates the election step guide, timeline, chat assistant, and legal modals.
 * Manages step progression state with sequential locking (each step requires prior completion).
 *
 * @module App
 */
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import StepGuide from './components/StepGuide';
import GuidanceBanner from './components/GuidanceBanner';
import Timeline from './components/Timeline';
import ChatAssistant from './components/ChatAssistant';
import Footer from './components/Footer';
import LegalModal from './components/LegalModal';
import { ELECTION_STEPS } from './constants/electionData';

/** Total number of steps minus 1 (0-indexed). Used to prevent advancing past the last step. */
const MAX_STEP_INDEX = ELECTION_STEPS.length - 1;

/**
 * Root application component.
 * Manages election step state, legal modal visibility, and renders all page sections.
 *
 * @returns {React.ReactElement}
 */
export default function App() {
  // Index of the currently expanded/active step card
  const [activeStep, setActiveStep] = useState(0);

  // Set of step IDs that the user has marked as done
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Tracks which legal document (privacy/terms) is open in the modal. null = closed.
  const [activeLegalDoc, setActiveLegalDoc] = useState(null);

  /**
   * Returns true if a step should be locked.
   * Step 0 is always unlocked; all others require the previous step to be completed.
   */
  const isStepLocked = useCallback((index) => {
    if (index === 0) return false;
    return !completedSteps.has(ELECTION_STEPS[index - 1].id);
  }, [completedSteps]);

  /** Switches the active (expanded) step, unless it is locked. */
  const handleStepClick = useCallback((index) => {
    if (!isStepLocked(index)) {
      setActiveStep(index);
    }
  }, [isStepLocked]);

  /**
   * Marks a step as completed and advances to the next step.
   * Guards against skipping steps — the previous step must already be done.
   */
  const handleMarkAsDone = useCallback((stepId) => {
    const stepIndex = ELECTION_STEPS.findIndex(s => s.id === stepId);

    // Block if the preceding step hasn't been completed yet
    const prevStepDone = stepIndex === 0 || completedSteps.has(ELECTION_STEPS[stepIndex - 1].id);
    if (!prevStepDone) return;

    // Add step to completed set (immutably)
    setCompletedSteps(prev => {
      const next = new Set(prev);
      next.add(stepId);
      return next;
    });

    // Advance to the next step (stay on last step if already there)
    setActiveStep(prev => (prev < MAX_STEP_INDEX ? prev + 1 : prev));
  }, [completedSteps]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden hero-bg">
      {/* Premium glassmorphism overlay over the hero-bg grid */}
      <div className="fixed inset-0 pointer-events-none overlay z-[-5]"></div>

      {/* Decorative top-center ambient glow — purely visual, non-interactive */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-white opacity-90 blur-[120px] -z-10 pointer-events-none"></div>

      <Header />

      <main role="main" className="flex-grow w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">

        {/* ── Hero ────────────────────────────────────────────────── */}
        <div className="text-center max-w-3xl mx-auto mb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* Badge pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#e5e5e5] text-[10px] font-bold uppercase tracking-[0.2em] text-[#111111] mb-8 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse"></span>
            AI-Powered Civics
          </div>

          <h2 className="text-5xl sm:text-7xl font-extrabold tracking-tighter text-black mb-6 leading-[1.1]">
            Democracy, <br/>
            <span className="text-[#999999]">simplified.</span>
          </h2>

          <p className="text-lg sm:text-xl text-[#666666] font-light leading-relaxed max-w-2xl mx-auto">
            Navigate the election process with absolute clarity. From registration to results, your intelligent guide is here.
          </p>
        </div>

        {/* ── Content Grid ────────────────────────────────────────── */}
        <div className="max-w-3xl mx-auto space-y-20 relative">

          {/* Main Column — step guide, guidance banner, timeline */}
          <section className="relative z-10">
              <StepGuide
                activeStep={activeStep}
                completedSteps={completedSteps}
                onStepClick={handleStepClick}
                onMarkAsDone={handleMarkAsDone}
                isStepLocked={isStepLocked}
              />
            </section>

            {/* Sticky banner that updates as steps are completed */}
            <div className="sticky top-28 z-20 animate-in fade-in duration-700 delay-300">
              <GuidanceBanner completedCount={completedSteps.size} />
            </div>

          <Timeline />
        </div>
      </main>

      {/* Floating Chat Widget */}
      <ChatAssistant />

      <Footer onOpenLegal={setActiveLegalDoc} />

      {/* Legal modal — rendered only when a doc type is selected */}
      {activeLegalDoc && (
        <LegalModal
          docType={activeLegalDoc}
          onClose={() => setActiveLegalDoc(null)}
        />
      )}
    </div>
  );
}
