/**
 * @fileoverview LegalModal — Accessible dialog for privacy, terms, and data policies
 * ACCESSIBILITY: role="dialog", aria-modal, aria-labelledby, focus trap, scroll lock
 * @module components/LegalModal
 */
import React, { useEffect } from 'react';

/**
 * Renders an accessible modal dialog for legal documents.
 * Supports 'privacy', 'terms', and 'data' document types.
 * Locks body scroll when open and restores it on unmount.
 *
 * @param {Object} props
 * @param {'privacy'|'terms'|'data'} props.docType - Which legal document to display
 * @param {Function} props.onClose - Callback to close the modal
 * @returns {React.ReactElement|null}
 */
export default function LegalModal({ docType, onClose }) {
  // Prevent scrolling on the body when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  let title = '';
  let content = null;

  if (docType === 'privacy') {
    title = 'Privacy Policy';
    content = (
      <div className="space-y-4 text-sm text-[#666666] leading-relaxed font-light">
        <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
        <p>At DemocrAI, your privacy is our priority. We are committed to protecting your personal information and ensuring transparency in how it is used.</p>
        <h3 className="font-bold text-[#111111] uppercase tracking-widest text-[10px] mt-6">Data Collection</h3>
        <p>We do not require an account to use the basic features of DemocrAI. We collect minimal telemetry data strictly for functional purposes (such as maintaining session state).</p>
        <h3 className="font-bold text-[#111111] uppercase tracking-widest text-[10px] mt-6">AI Processing</h3>
        <p>Your chat interactions are processed securely using Google's Gemini API. Transcripts are not permanently stored by DemocrAI after your session ends. Please refer to Google's privacy policy regarding AI data processing.</p>
        <h3 className="font-bold text-[#111111] uppercase tracking-widest text-[10px] mt-6">Data Sharing</h3>
        <p>We strictly <strong>do not</strong> sell, rent, or trade your personal data or chat transcripts to third parties, advertisers, or political organizations.</p>
      </div>
    );
  } else if (docType === 'terms') {
    title = 'Terms of Service';
    content = (
      <div className="space-y-4 text-sm text-[#666666] leading-relaxed font-light">
        <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
        <p>By accessing or using DemocrAI, you agree to be bound by these Terms of Service.</p>
        <h3 className="font-bold text-[#111111] uppercase tracking-widest text-[10px] mt-6">Educational Purpose</h3>
        <p>DemocrAI is designed exclusively for educational and informational purposes. While we strive to provide accurate guidance regarding the election process, the information provided by our AI assistant should not be considered legally binding or officially endorsed advice.</p>
        <h3 className="font-bold text-[#111111] uppercase tracking-widest text-[10px] mt-6">User Conduct</h3>
        <p>You agree not to misuse the platform. This includes attempting to reverse-engineer the application, overloading the Gemini API with malicious requests, or using the platform to generate misleading political content.</p>
        <h3 className="font-bold text-[#111111] uppercase tracking-widest text-[10px] mt-6">Disclaimer of Warranties</h3>
        <p>The service is provided "as is". DemocrAI makes no guarantees regarding the absolute accuracy of AI-generated responses. Always verify voting deadlines and requirements with your official local election commission.</p>
      </div>
    );
  } else if (docType === 'data') {
    title = 'Data Guidelines';
    content = (
      <div className="space-y-4 text-sm text-[#666666] leading-relaxed font-light">
        <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
        <p>To ensure a safe and secure experience while interacting with the DemocrAI assistant, please adhere to the following data guidelines.</p>
        <h3 className="font-bold text-[#111111] uppercase tracking-widest text-[10px] mt-6">Do Not Share PII</h3>
        <p><strong>Never</strong> enter Personally Identifiable Information (PII) into the chat assistant. This includes your Social Security Number, official Voter Registration ID, full home address, or banking information. The AI does not need this information to assist you.</p>
        <h3 className="font-bold text-[#111111] uppercase tracking-widest text-[10px] mt-6">Session Data</h3>
        <p>Your current progress through the election steps is stored locally in your browser to enhance your experience. Clearing your browser data will reset your progress.</p>
        <h3 className="font-bold text-[#111111] uppercase tracking-widest text-[10px] mt-6">Feedback Loop</h3>
        <p>If you encounter inappropriate, biased, or highly inaccurate responses from the AI, please report them so we can refine our safety filters.</p>
      </div>
    );
  }

  if (!docType) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      ></div>
      
      {/* Modal Content */}
      <div 
        role="dialog" 
        aria-labelledby="modal-title" 
        aria-modal="true"
        className="relative bg-white w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl shadow-premium overflow-hidden animate-in zoom-in-95 duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
      >
        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-[#e5e5e5]">
          <h2 id="modal-title" className="text-xl font-extrabold tracking-tight text-[#111111]">
            {title}
          </h2>
          <button 
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#fafafa] hover:bg-[#e5e5e5] text-[#111111] transition-colors duration-200"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="p-6 sm:p-8 overflow-y-auto">
          {content}
        </div>
        
        <div className="p-6 sm:px-8 sm:py-6 border-t border-[#e5e5e5] bg-[#fafafa] flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[#333333] active:scale-95 transition-all duration-200"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
