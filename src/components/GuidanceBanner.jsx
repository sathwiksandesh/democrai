/**
 * @fileoverview GuidanceBanner — Sticky contextual guidance card
 * ACCESSIBILITY: role="status", aria-live="polite" for screen reader announcements
 * @module components/GuidanceBanner
 */
import React from 'react';
import { getGuidanceMessage } from '../utils/electionHelpers';

/**
 * Displays a contextual guidance message based on the user's progress.
 * Updates dynamically as steps are completed and announces changes via aria-live.
 *
 * @param {Object} props
 * @param {number} props.completedCount - Number of completed election steps (0–4)
 * @returns {React.ReactElement}
 */
export default function GuidanceBanner({ completedCount }) {
  const message = getGuidanceMessage(completedCount);
  
  return (
    <div className="bg-white/90 backdrop-blur-md border border-[#e5e5e5] rounded-2xl p-6 shadow-premium relative overflow-hidden group hover:shadow-premium-hover transition-all duration-500">
      <div className="absolute top-0 left-0 w-1 h-full bg-black transition-all duration-500 group-hover:w-1.5"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      
      <div 
        role="status" 
        aria-live="polite"
        className="flex items-start gap-4 relative z-10"
      >
        <div className="w-6 h-6 rounded-full bg-[#fafafa] border border-[#e5e5e5] flex items-center justify-center shrink-0 mt-0.5">
          <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
        </div>
        <div>
          <span className="block text-[9px] font-bold text-[#666666] uppercase tracking-[0.2em] mb-1.5">Current Guidance</span>
          <p className="text-[#111111] text-sm font-medium leading-relaxed tracking-tight">{message}</p>
        </div>
      </div>
    </div>
  );
}
