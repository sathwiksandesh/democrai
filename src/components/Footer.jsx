/**
 * @fileoverview Footer — Site-wide footer with branding, platform links, and legal links
 * ACCESSIBILITY: role="contentinfo", semantic navigation structure
 * @module components/Footer
 */
import React from 'react';

/**
 * Renders the site footer with branding, navigation links, and legal document triggers.
 *
 * @param {Object} props
 * @param {Function} props.onOpenLegal - Callback to open a legal modal ('privacy' | 'terms' | 'data')
 * @returns {React.ReactElement}
 */
export default function Footer({ onOpenLegal }) {
  return (
    <footer role="contentinfo" className="footer-bg pt-24 pb-12 border-t border-[#e5e5e5] mt-auto relative overflow-hidden">
      {/* Subtle radial gradient background for depth */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white opacity-60 blur-[100px] -z-10 pointer-events-none"></div>

      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-2 flex flex-col items-start">
            <div className="flex items-center gap-2 pl-1 mb-6">
              <img src="/logo.png" alt="" className="w-8 h-8 object-contain scale-[1.75] origin-center opacity-90 grayscale contrast-125 mix-blend-multiply" />
              <span className="text-lg font-extrabold tracking-tight text-black">DemocrAI</span>
            </div>
            <p className="text-sm text-[#666666] font-light leading-relaxed max-w-xs">
              Demystifying the democratic process through intelligent, accessible AI guidance.
            </p>
          </div>

          {/* Links Columns */}
          <div>
            <h3 className="text-[10px] font-bold text-[#111111] uppercase tracking-[0.2em] mb-5">Platform</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-[#666666] hover:text-black transition-colors duration-200">Voter Registration</a></li>
              <li><a href="#" className="text-sm text-[#666666] hover:text-black transition-colors duration-200">Election Tracking</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-bold text-[#111111] uppercase tracking-[0.2em] mb-5">Legal</h3>
            <ul className="space-y-4">
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); onOpenLegal('privacy'); }} className="text-sm text-[#666666] hover:text-black transition-colors duration-200">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); onOpenLegal('terms'); }} className="text-sm text-[#666666] hover:text-black transition-colors duration-200">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); onOpenLegal('data'); }} className="text-sm text-[#666666] hover:text-black transition-colors duration-200">
                  Data Guidelines
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#e5e5e5] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#999999] font-medium tracking-wide">
            © {new Date().getFullYear()} DemocrAI. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#999999] uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> All systems operational
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
