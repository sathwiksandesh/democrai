import React, { useState, useRef, useEffect, useCallback } from 'react';
import { askGemini } from '../services/geminiService';
import { validateChatInput, truncateHistory, sanitizeInput } from '../utils/electionHelpers';

const MAX_CHAR_LIMIT = 500;
const HISTORY_LIMIT = 10;

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'model',
  content:
    "Hi! I'm DemocrAI, powered by Google Gemini.\nAsk me anything about voter registration, voting steps, election timelines, or how democracy works!"
};

const SUGGESTIONS = [
  "How do I register to vote?",
  "When is the next election?",
  "What ID do I need to bring?"
];

// ── Sub-components ────────────────────────────────────────────────────────────

/** Animated AI avatar shown next to model messages */
function AIAvatar({ isTyping = false }) {
  return (
    <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-[#111] to-[#333] flex items-center justify-center shadow-md ring-2 ring-white mt-1 overflow-hidden">
      {/* Container bobs slightly when happy/typing */}
      <div className={`flex gap-1 items-center justify-center transition-transform duration-300 ${isTyping ? 'animate-bounce translate-y-0.5' : ''}`}>
        {/* Left Eye */}
        <div 
          className={`w-[5px] transition-all duration-300 ${
            isTyping 
              ? 'h-[5px] border-t-2 border-white rounded-t-full bg-transparent mt-0.5 transform -rotate-12' 
              : 'h-2 bg-white rounded-full animate-[blink_4s_infinite]'
          }`}
        ></div>
        
        {/* Right Eye */}
        <div 
          className={`w-[5px] transition-all duration-300 ${
            isTyping 
              ? 'h-[5px] border-t-2 border-white rounded-t-full bg-transparent mt-0.5 transform rotate-12' 
              : 'h-2 bg-white rounded-full animate-[blink_4s_infinite_0.1s]'
          }`}
        ></div>
      </div>
    </div>
  );
}

/** Typing indicator with staggered bouncing dots */
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 animate-in fade-in duration-300">
      <AIAvatar isTyping={true} />
      <div className="bg-white/90 border border-[#e5e5e5] rounded-2xl rounded-tl-sm px-5 py-4 flex gap-1.5 items-center shadow-sm backdrop-blur-sm">
        {[0, 0.18, 0.36].map((delay, i) => (
          <span
            key={i}
            className="block w-2 h-2 rounded-full bg-gradient-to-b from-[#555] to-[#999] animate-bounce"
            style={{ animationDelay: `${delay}s`, animationDuration: '0.9s' }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput]       = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderText, setPlaceholderText] = useState('');
  const [announcedSuggestion, setAnnouncedSuggestion] = useState('');

  const messagesEndRef = useRef(null);

  // ── Scroll ───────────────────────────────────────────────────────────────
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages, isLoading]);

  // ── Floating Button Emotion Engine ───────────────────────────────────────
  const [buttonEmotion, setButtonEmotion] = useState('idle');

  useEffect(() => {
    // Only cycle emotions if the chat is closed
    if (isOpen) {
      setButtonEmotion('idle');
      return;
    }

    const emotions = [
      'idle', 'idle', 'idle', 'idle', // Higher weight for idle
      'happy', 'happy',
      'look-left', 'look-right', 
      'look-up'
    ];

    const emotionInterval = setInterval(() => {
      const nextEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      setButtonEmotion(nextEmotion);
      
      // If it's an active emotion, return to idle after a short burst
      if (nextEmotion !== 'idle') {
        setTimeout(() => {
          // Double check we are still closed before resetting
          setButtonEmotion(prev => prev !== 'idle' ? 'idle' : prev);
        }, 1200 + Math.random() * 800);
      }
    }, 3500);

    return () => clearInterval(emotionInterval);
  }, [isOpen]);

  // ── Typing Placeholder Effect ────────────────────────────────────────────
  useEffect(() => {
    let currentSuggestionIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let timeout;

    const type = () => {
      const currentSuggestion = SUGGESTIONS[currentSuggestionIndex];
      
      if (isDeleting) {
        setPlaceholderText(currentSuggestion.substring(0, currentCharIndex - 1));
        currentCharIndex--;
      } else {
        setPlaceholderText(currentSuggestion.substring(0, currentCharIndex + 1));
        currentCharIndex++;
      }

      let typingSpeed = isDeleting ? 30 : 70;

      if (!isDeleting && currentCharIndex === currentSuggestion.length) {
        typingSpeed = 2000; // Pause at the end
        isDeleting = true;
        setAnnouncedSuggestion(`Suggested question: ${currentSuggestion}`);
      } else if (isDeleting && currentCharIndex === 0) {
        isDeleting = false;
        currentSuggestionIndex = (currentSuggestionIndex + 1) % SUGGESTIONS.length;
        typingSpeed = 500; // Pause before typing next
      }

      timeout = setTimeout(type, typingSpeed);
    };

    timeout = setTimeout(type, 500);

    return () => clearTimeout(timeout);
  }, []);

  // ── Send ─────────────────────────────────────────────────────────────────
  const handleSend = useCallback(async (e) => {
    if (e) e.preventDefault();
    setError('');

    const validation = validateChatInput(input);
    if (!validation.valid) { setError(validation.error); return; }

    const userContent = sanitizeInput(input.trim());
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userContent }]);
    setInput('');
    setIsLoading(true);

    try {
      const trimmedHistory = truncateHistory(messages, HISTORY_LIMIT);
      const responseText = await askGemini(trimmedHistory, userContent);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', content: responseText }]);
    } catch (err) {
      console.error('Gemini API error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [input, messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const charCount = input.length;
  const isSendDisabled = isLoading || charCount === 0 || input.trim().length === 0;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* Floating Ball Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-[#111] to-[#333] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-500 ring-4 ring-white/50 group ${
          isOpen ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100'
        }`}
        aria-label="Open DemocrAI Assistant"
      >
        <div className="absolute inset-0 rounded-full border-2 border-black/20 animate-ping" style={{ animationDuration: '3s' }}></div>
        
        {/* Larger Robot Eyes with Dynamic Emotions */}
        <div className={`flex gap-2 items-center justify-center z-10 transition-transform duration-300 ${
          buttonEmotion === 'happy' ? 'animate-bounce translate-y-0.5' : 
          buttonEmotion === 'look-up' ? '-translate-y-1.5' : ''
        }`}>
          {/* Left Eye */}
          <div className={`w-2 transition-all duration-300 ${
            buttonEmotion === 'happy' ? 'h-2 border-t-[3px] border-white rounded-t-full bg-transparent transform -rotate-12 mt-1' :
            buttonEmotion === 'look-left' ? 'h-3.5 bg-white rounded-full -translate-x-1.5' :
            buttonEmotion === 'look-right' ? 'h-3.5 bg-white rounded-full translate-x-1.5' :
            'h-3.5 bg-white rounded-full animate-[blink_4s_infinite]'
          }`}></div>
          {/* Right Eye */}
          <div className={`w-2 transition-all duration-300 ${
            buttonEmotion === 'happy' ? 'h-2 border-t-[3px] border-white rounded-t-full bg-transparent transform rotate-12 mt-1' :
            buttonEmotion === 'look-left' ? 'h-3.5 bg-white rounded-full -translate-x-1.5' :
            buttonEmotion === 'look-right' ? 'h-3.5 bg-white rounded-full translate-x-1.5' :
            'h-3.5 bg-white rounded-full animate-[blink_4s_infinite_0.1s]'
          }`}></div>
        </div>
      </button>

      {/* Chat Panel */}
      <section 
        aria-labelledby="chat-heading" 
        className={`fixed bottom-6 right-6 z-50 w-full max-w-[400px] transition-all duration-500 origin-bottom-right ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10 pointer-events-none'
        }`}
      >
        {/* Multi-layer ambient glow — intensifies on focus */}
        <div className={`absolute -inset-2 rounded-[2rem] blur-2xl transition-opacity duration-700 pointer-events-none
          bg-gradient-to-br from-[#d4d4d4]/40 via-transparent to-[#d4d4d4]/20
          ${isFocused ? 'opacity-100' : 'opacity-40 group-hover:opacity-70'}`}
        />

        {/* Panel */}
        <div className="relative rounded-[1.5rem] border border-[#e0e0e0] shadow-2xl overflow-hidden flex flex-col h-[600px] bg-white transition-all duration-500">

        {/* Animated aurora background behind the whole panel */}
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-[1.5rem]">
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xl" />
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-gradient-to-br from-[#f0f0f0] to-transparent rounded-full blur-3xl opacity-80 animate-[drift_8s_ease-in-out_infinite]" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-gradient-to-tl from-[#e8e8e8] to-transparent rounded-full blur-3xl opacity-60 animate-[drift_10s_ease-in-out_infinite_reverse]" />
        </div>

        {/* ── Header ── */}
        <div className="relative z-10 border-b border-[#ebebeb] px-6 py-4 flex justify-between items-center bg-white/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {/* Gradient logo mark */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#111] to-[#555] flex items-center justify-center shadow-md">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div>
              <h2 id="chat-heading" className="text-[11px] font-bold text-[#111111] uppercase tracking-[0.18em] leading-none">
                DemocrAI Assistant
              </h2>
              <p className="text-[9px] text-[#888] mt-0.5 tracking-wide">Powered by Gemini 2.5 Flash</p>
            </div>
          </div>

          {/* Live status & Close Button */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 bg-[#f5f5f5] border border-[#e5e5e5] rounded-full px-2.5 py-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="text-[8px] font-bold text-[#555] uppercase tracking-widest">Live</span>
            </div>
            
            {/* Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-[#f5f5f5] text-[#666] hover:bg-[#e5e5e5] hover:text-black transition-colors"
              aria-label="Close Assistant"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* ── Message list ── */}
        <div
          className="flex-grow overflow-y-auto px-5 py-6 flex flex-col gap-5 scroll-smooth"
          role="log"
          aria-live="polite"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* AI avatar on the left of model messages */}
              {msg.role === 'model' && <AIAvatar />}

              <div className={`max-w-[82%] px-5 py-3.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  // User: dark gradient bubble
                  ? 'bg-gradient-to-br from-[#1a1a1a] to-[#3a3a3a] text-white rounded-2xl rounded-br-sm shadow-lg'
                  // Model: glassy white bubble
                  : 'bg-white/90 backdrop-blur-sm text-[#111111] border border-[#ebebeb] rounded-2xl rounded-bl-sm shadow-sm'
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && <TypingIndicator />}

          {/* Scroll sentinel */}
          <div ref={messagesEndRef} className="h-1" />
        </div>

        {/* ── Input area ── */}
        <div className="px-5 pb-5 pt-4 bg-white/70 backdrop-blur-md border-t border-[#ebebeb]">
          {/* Error message */}
          {error && (
            <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mb-3 animate-in fade-in duration-200" role="alert">
              ⚠ {error}
            </p>
          )}

          {/* Input form */}
          <form onSubmit={handleSend} className="relative">
            {/* Visually hidden live region for announcing the typing effect suggestions */}
            <div className="sr-only" aria-live="polite" aria-atomic="true">
              {announcedSuggestion}
            </div>
            
            {/* Focus ring that glows when the textarea is active */}
            <div className={`absolute -inset-0.5 rounded-2xl transition-all duration-300 pointer-events-none
              ${isFocused ? 'bg-gradient-to-r from-[#d4d4d4] via-[#e8e8e8] to-[#d4d4d4] opacity-100' : 'opacity-0'}`}
            />
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholderText ? placeholderText + '|' : ''}
                aria-label="Ask an election question"
                className="w-full pl-5 pr-14 py-4 border border-[#e0e0e0] rounded-xl focus:ring-0 focus:border-[#aaaaaa] outline-none resize-none h-[88px] bg-white/95 text-sm text-[#111111] placeholder:text-[#aaaaaa] transition-all duration-300 shadow-sm"
                maxLength={MAX_CHAR_LIMIT}
                disabled={isLoading}
              />

              {/* Send button — floats inside the textarea */}
              <button
                type="submit"
                onClick={handleSend}
                disabled={isSendDisabled}
                aria-label="Send message"
                className={`absolute right-3 bottom-3 w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-300 shadow-md
                  ${isSendDisabled
                    ? 'bg-[#f0f0f0] text-[#ccc] cursor-not-allowed'
                    : 'bg-gradient-to-br from-[#111] to-[#444] text-white hover:scale-105 active:scale-95 hover:shadow-lg'
                  }`}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </form>

          {/* Char counter */}
          <div className="mt-2 flex justify-end">
            <span className={`text-[9px] font-bold tracking-widest tabular-nums transition-colors duration-200
              ${charCount > MAX_CHAR_LIMIT * 0.9 ? 'text-red-400' : 'text-[#bbb]'}`}>
              {charCount}/{MAX_CHAR_LIMIT}
            </span>
          </div>
          </div>
        </div>
      </section>
    </>
  );
}
