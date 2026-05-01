# DemocrAI

An intelligent, AI-powered civic education web application designed to guide Indian voters through every step of the election process. Built with a modern React SPA architecture, rigorous WCAG 2.1 AA accessibility, and **7 integrated Google Cloud services**.

---

## ✨ Key Features

- **Interactive Step Guide:** Locked-step progression through the entire election cycle — registration, verification, voting, and result tracking — ensuring users never skip critical prerequisites.
- **AI Election Assistant (Google Gemini):** Context-aware conversational assistant powered by Google Gemini 2.5 Flash with function calling. Answers voter questions, checks eligibility, and provides guidance under 150 words.
- **Semantic FAQ Search (Vertex AI):** Uses Google Vertex AI `text-embedding-004` model to find the most relevant FAQ answer through cosine similarity matching.
- **Multi-Language Support (Cloud Translation):** Translates election guidance into 8 Indian regional languages (Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, Gujarati, Malayalam) via Google Cloud Translation API v2.
- **Polling Booth Locator (Google Maps):** Integrated Google Maps Platform for searching polling booths, district election offices, and voter registration centres.
- **Election Reminders (Google Calendar):** One-click Google Calendar deep-links for voter registration deadlines, polling day, and result day — no OAuth required.
- **Query Analytics (Natural Language API + Firestore):** Anonymised query intent classification using Google Cloud Natural Language API, with aggregate logging to Google Cloud Firestore via REST.
- **Live Election Timeline:** Displays critical upcoming dates with Firestore live data and smart static fallback.

---

## 🔧 Google Cloud Services Integrated

| # | Service | Purpose | Module |
|---|---|---|---|
| 1 | **Google Gemini AI** | Conversational election coaching with function calling | `src/services/geminiService.js` |
| 2 | **Google Cloud Firestore** | Real-time election timeline data with offline fallback | `src/services/firebaseService.js` |
| 3 | **Google Cloud Translation API** | Multi-language civic guidance (8 Indian languages) | `src/services/translationService.js` |
| 4 | **Google Maps Platform** | Polling booth and election office locator | `src/services/mapsService.js` |
| 5 | **Google Calendar** | Election reminder deep-links (no OAuth) | `src/services/calendarService.js` |
| 6 | **Google Vertex AI** | Semantic FAQ matching via text-embedding-004 embeddings | `src/services/vertexService.js` |
| 7 | **Cloud Natural Language API** | Voter query sentiment analysis and entity extraction | `src/services/analyticsService.js` |
| 8 | **Google Analytics 4** | Frontend page view and event tracking | `index.html` (gtag.js) |
| 9 | **Google Fonts** | Inter typeface for premium typography | `index.html` |

---

## 🏗️ Architecture

```
src/
├── components/       # React UI components (StepGuide, Timeline, ChatAssistant, etc.)
├── constants/        # Static election data, timeline events, guidance messages
├── services/         # All Google Cloud API clients
│   ├── geminiService.js       # Google Gemini AI — chat assistant
│   ├── firebaseService.js     # Cloud Firestore — timeline data
│   ├── translationService.js  # Cloud Translation API — multi-language
│   ├── mapsService.js         # Google Maps — polling booth locator
│   ├── calendarService.js     # Google Calendar — reminder deep-links
│   ├── vertexService.js       # Vertex AI — semantic FAQ search
│   ├── analyticsService.js    # Cloud NLP + Firestore — query analytics
│   └── apiClient.js           # Safe HTTP client (timeout, retry, error sanitization)
├── utils/            # Security sanitization, caching, validation helpers
│   ├── sanitize.js            # sanitizeFull(), escapeHtml(), sanitizeUrl()
│   ├── cache.js               # LRU cache with TTL for API response caching
│   └── electionHelpers.js     # Input validation, date formatting, history truncation
└── tests/            # Vitest unit and integration test suites
```

---

## 🛡️ Security Posture

| Layer | Implementation |
|---|---|
| Content Security Policy | Strict CSP in `index.html` (script-src, connect-src, img-src) |
| Input Sanitisation | `sanitizeFull()` — HTML escaping + tag stripping + URI validation + control char removal |
| XSS Prevention | Zero `innerHTML` usage — DOM-first rendering throughout via React |
| API Key Protection | All keys loaded from `import.meta.env.*`, `.env` in `.gitignore` |
| Prompt Injection | System prompt prepended, low temperature (0.3), input length limits |
| Error Sanitisation | `SafeApiClient` never leaks stack traces or internal error details |

See [SECURITY.md](./SECURITY.md) for the full threat model and vulnerability reporting policy.

---

## ♿ Accessibility (WCAG 2.1 AA)

- **Skip Navigation:** `<a href="#main-content">` skip-link for keyboard users
- **Semantic HTML:** `<main>`, `<section>`, `<header>`, `<footer>`, `<nav>` throughout
- **ARIA Attributes:** `aria-label`, `aria-pressed`, `aria-live="polite"`, `role="log"`, `role="dialog"`, `role="status"` on all dynamic content
- **Keyboard Navigation:** Full keyboard support with visible focus indicators
- **Screen Reader:** `sr-only` live regions announce AI typing updates
- **Reduced Motion:** Respects `prefers-reduced-motion` user preference
- **Colour Contrast:** Minimum 4.5:1 ratio on all text (WCAG AA compliant)

---

## 🔄 Offline Resilience

Every Google Cloud service has a graceful degradation path:
- **Gemini:** Returns error message prompting retry
- **Firestore:** Falls back to static `TIMELINE_EVENTS` data
- **Translation:** Returns original English text
- **Maps:** Returns curated sample polling locations across 5 Indian cities
- **Calendar:** Always works — uses pure URL deep-links, no API required
- **Vertex AI:** Falls back to keyword-based FAQ matching
- **Analytics:** Fail-silent — never blocks the voter experience

---

## 📊 Testing

```bash
npm run test              # Run all test suites
npm run test:coverage     # Run with code coverage report
npm run test:watch        # Watch mode for development
```

| Metric | Threshold |
|---|---|
| Statements | ≥ 80% |
| Branches | ≥ 70% |
| Functions | ≥ 80% |
| Lines | ≥ 80% |

12 test suites covering all services, utilities, and components.

---

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local Vite development server |
| `npm run build` | Production bundle |
| `npm run preview` | Preview the production build locally |
| `npm run test` | Run all unit and integration tests (Vitest) |
| `npm run test:coverage` | Run tests with code coverage report |
| `npm run lint` | ESLint on all JavaScript source files |
| `npm run format` | Format all source files with Prettier |
| `npm run validate` | Gatekeeper: lint + test coverage |

---

## ⚙️ Setup

### Prerequisites
- Node.js 18+

### Steps

1. **Clone and install:**
   ```bash
   git clone https://github.com/sathwiksandesh/democrai.git
   cd democrai
   npm install
   ```

2. **Configure API keys:**
   ```bash
   cp .env.example .env
   # Edit .env and add your Google Cloud API keys
   ```

3. **Start development:**
   ```bash
   npm run dev
   ```

---

## 🏛️ Chosen Vertical

**Civic Technology & Election Guidance**

Navigating the election process can be overwhelming for first-time voters and experienced citizens alike. Changing deadlines, complex registration requirements, and a lack of accessible, conversational guidance often lead to voter drop-off. DemocrAI tackles this by providing a streamlined, accessible, and AI-augmented platform that acts as a personal civic guide for Indian voters.

---

## 📌 Assumptions

1. **Generalised Election Data:** Timeline assumes a national election cycle. Regional nuances are handled by the AI assistant.
2. **Firebase Limitations:** App functions 100% locally with static fallback data if Firestore is unreachable.
3. **Stateless Sessions:** User progress is managed in React state. Persistent sessions are scoped for future versions.
4. **AI Hallucination Mitigation:** Gemini is configured with low temperature (0.3) and users are advised to verify deadlines with official ECI sources.

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.
