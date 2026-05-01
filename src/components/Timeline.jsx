/**
 * @fileoverview Timeline — Election event timeline with live Firestore data
 * GOOGLE SERVICES: Cloud Firestore for live event data
 * ACCESSIBILITY: semantic section, aria-labelledby, staggered animations
 *
 * @module components/Timeline
 */
import React, { useState, useEffect } from 'react';
import { TIMELINE_EVENTS } from '../constants/electionData';
import { fetchElectionEvents } from '../services/firebaseService';
import { formatTimelineDate } from '../utils/electionHelpers';

/** @const {number} Stagger delay (ms) between each event card animation */
const CARD_STAGGER_MS = 150;

/**
 * Renders the election timeline with live Firestore data and static fallback.
 * Pre-populates with static TIMELINE_EVENTS on mount, then silently replaces
 * with Firestore data if available (no loading flicker).
 *
 * @returns {React.ReactElement}
 */
export default function Timeline() {
  // Pre-populated with static data so the list renders immediately on mount.
  // Firestore data will silently replace this if it loads successfully.
  const [events, setEvents] = useState(TIMELINE_EVENTS);
  const [loading, setLoading] = useState(false);

  // ── Data fetching ─────────────────────────────────────────────────
  useEffect(() => {
    async function loadEvents() {
      try {
        const liveData = await fetchElectionEvents();

        // Only replace static events if Firestore actually returned rows
        if (liveData && liveData.length > 0) {
          setEvents(liveData);
        }
        // Otherwise, keep the pre-loaded TIMELINE_EVENTS (no visible flicker)
      } catch (error) {
        // Non-fatal — ad-blockers or network failures land here.
        // Static data is already displayed, so no user-facing impact.
        console.warn('Timeline: could not fetch live events, using static fallback.', error);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []); // Run once on mount

  // ── Render ────────────────────────────────────────────────────────
  return (
    <section aria-labelledby="timeline-heading">
      {/* Section header */}
      <div className="flex items-center gap-4 mb-10">
        <h2 id="timeline-heading" className="text-xs font-bold text-[#111111] uppercase tracking-[0.2em] opacity-80">
          Timeline
        </h2>
        <div className="h-px bg-gradient-to-r from-[#e5e5e5] to-transparent flex-grow"></div>
      </div>

      {loading ? (
        /* Skeleton loader — only shown if loading hasn't resolved yet */
        <div className="space-y-6">
          <div className="h-32 bg-white/50 border border-[#e5e5e5] rounded-2xl animate-pulse"></div>
          <div className="h-32 bg-white/50 border border-[#e5e5e5] rounded-2xl animate-pulse"></div>
        </div>
      ) : (
        /* Event list with a decorative vertical line */
        <div className="relative pl-8 space-y-12 ml-4">
          {/* Gradient vertical line running down the left edge */}
          <div className="absolute left-[3px] top-4 bottom-0 w-[1px] bg-gradient-to-b from-black via-[#e5e5e5] to-transparent"></div>

          {events.map((event, index) => (
            <div
              key={event.id}
              className="relative group animate-in fade-in slide-in-from-left-8 duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]"
              style={{ animationDelay: `${index * CARD_STAGGER_MS}ms` }}
            >
              {/* Dot on the timeline line — scales up on hover */}
              <div className="absolute -left-[35.5px] top-4 w-2 h-2 bg-black rounded-full z-10 ring-4 ring-[#fafafa] group-hover:scale-150 transition-transform duration-500">
                <div className="absolute inset-0 bg-black rounded-full blur-[2px] opacity-50"></div>
              </div>

              {/* Event card */}
              <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl border border-[#e5e5e5] shadow-sm group-hover:shadow-premium-hover group-hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] relative overflow-hidden">
                {/* Subtle hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Title + date pill */}
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <h3 className="font-extrabold text-[#111111] text-lg tracking-tight">{event.label}</h3>
                  <time className="text-[10px] font-bold text-[#111111] bg-[#fafafa] border border-[#e5e5e5] px-3 py-1.5 rounded-full uppercase tracking-[0.1em] shrink-0">
                    {formatTimelineDate(event.date)}
                  </time>
                </div>

                <p className="relative z-10 text-sm text-[#666666] leading-relaxed font-light">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer caption */}
      <div className="mt-16 text-center animate-in fade-in duration-1000 delay-500">
        <span className="text-[9px] font-bold text-[#666666] uppercase tracking-[0.4em] opacity-40 flex items-center justify-center gap-2">
          <span className="w-8 h-px bg-gradient-to-r from-transparent to-[#cccccc]"></span>
          Data synced securely
          <span className="w-8 h-px bg-gradient-to-l from-transparent to-[#cccccc]"></span>
        </span>
      </div>
    </section>
  );
}
