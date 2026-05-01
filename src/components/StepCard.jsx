import React, { memo } from 'react';

const StepCard = memo(function StepCard({ step, isActive, isCompleted, isLocked, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      aria-label={`Step ${step.stepNumber}: ${step.title}${isLocked ? ' (Locked)' : ''}`}
      aria-pressed={isActive}
      className={`group relative w-full text-left p-8 rounded-2xl border transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden ${
        isLocked 
          ? 'border-transparent bg-[#fafafa]/50 cursor-not-allowed grayscale opacity-40' 
          : isActive 
            ? 'border-black bg-white shadow-premium scale-[1.02] ring-1 ring-black/5' 
            : 'border-[#e5e5e5] bg-white hover:border-[#cccccc] hover:shadow-premium-hover hover:-translate-y-1'
      }`}
    >
      {/* Subtle hover gradient */}
      {!isLocked && (
        <div className="absolute inset-0 bg-gradient-to-br from-black/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      )}

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={`flex items-center justify-center w-7 h-7 rounded text-[10px] font-bold transition-colors duration-500 ${
            isLocked 
              ? 'bg-[#e5e5e5] text-[#666666]' 
              : isActive 
                ? 'bg-black text-white' 
                : 'bg-[#fafafa] text-[#111111] border border-[#e5e5e5] group-hover:border-[#cccccc]'
          }`}>
            {step.stepNumber}
          </div>
          <h3 className="text-base font-bold text-[#111111] tracking-tight">
            {step.title}
            {isLocked && <span className="ml-2 text-[10px] font-medium tracking-wide opacity-40 uppercase">(Locked)</span>}
          </h3>
        </div>
      </div>
      
      <p className="relative z-10 mt-5 text-[#666666] text-sm leading-relaxed font-light">
        {step.description}
      </p>
      
      <div className={`relative z-10 mt-6 pt-5 border-t transition-colors duration-500 ${
        isActive && !isLocked ? 'border-[#e5e5e5]' : 'border-transparent group-hover:border-[#f0f0f0]'
      }`}>
        <p className="text-xs font-medium text-[#111111] flex items-start gap-2">
          <span className="text-[9px] text-[#666666] uppercase tracking-[0.2em] mt-0.5 shrink-0">Action</span>
          <span className="leading-snug opacity-90">{step.userAction}</span>
        </p>
      </div>

      {isCompleted && (
        <div className="absolute top-5 right-5 flex items-center justify-center animate-in zoom-in fade-in duration-500" aria-label="Completed">
          <div className="flex items-center gap-1.5 bg-white border border-[#e5e5e5] px-2 py-1 rounded-full shadow-sm">
            <div className="w-4 h-4 bg-black text-white rounded-full flex items-center justify-center shadow-sm">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <span className="text-[9px] font-bold text-[#111111] uppercase tracking-widest pr-1.5">Done</span>
          </div>
        </div>
      )}
      
      {isLocked && (
        <div className="absolute top-6 right-6 flex items-center justify-center opacity-20" aria-hidden="true">
          <span className="text-xs">🔒</span>
        </div>
      )}
    </button>
  );
});

export default StepCard;
