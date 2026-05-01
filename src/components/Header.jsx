/**
 * @fileoverview Header — Fixed top navigation bar with app branding
 * ACCESSIBILITY: role="banner", semantic h1, keyboard-focusable
 * @module components/Header
 */
import React from 'react';

/**
 * Renders the fixed glassmorphic header bar with the DemocrAI logo and beta badge.
 * @returns {React.ReactElement}
 */
export default function Header() {
  return (
    <header role="banner" className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[500px] transition-all duration-500 animate-in fade-in slide-in-from-top-8">
      <div className="bg-white/80 backdrop-blur-xl border border-[#e5e5e5] rounded-full shadow-premium px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2 pl-1">
          <img src="/logo.png" alt="" className="w-8 h-8 object-contain scale-[1.75] origin-center drop-shadow-sm mix-blend-multiply" />
          <h1 className="text-xl font-extrabold tracking-tight text-black">
            DemocrAI
          </h1>
        </div>
        <div className="text-[9px] font-bold text-[#666666] uppercase tracking-[0.2em] bg-[#fafafa] px-3 py-1.5 rounded-full border border-[#e5e5e5]">
          Beta
        </div>
      </div>
    </header>
  );
}
