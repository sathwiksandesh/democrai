# Contributing to DemocrAI

Thank you for considering contributing to DemocrAI! This document outlines the guidelines and standards for contributing.

---

## 📋 Code of Conduct

All contributors are expected to maintain a respectful and inclusive environment. DemocrAI is a civic-technology project — political neutrality is paramount.

---

## 🏗️ Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/sathwiksandesh/democrai.git
cd democrai

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your Google Cloud API keys

# 4. Start the dev server
npm run dev
```

---

## 📐 Code Standards

### Style Guide

- **ESLint** for static analysis: `npm run lint`
- **Prettier** for formatting: `npm run format`
- All code must pass linting before merge.

### Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Files (components) | PascalCase | `StepCard.jsx` |
| Files (services) | camelCase | `geminiService.js` |
| Files (utils) | camelCase | `sanitize.js` |
| Files (tests) | `*.test.js(x)` | `sanitize.test.js` |
| Functions | camelCase | `fetchElectionEvents()` |
| Constants | UPPER_SNAKE_CASE | `MAX_CHAR_LIMIT` |
| CSS classes | kebab-case | `hero-bg` |

### JSDoc Requirements

All exported functions **must** have JSDoc documentation:

```javascript
/**
 * Translates input text to the specified target language.
 *
 * @param {string} text - The source text to translate.
 * @param {string} targetLang - ISO 639-1 language code (e.g., 'hi', 'ta').
 * @returns {Promise<string>} Translated text, or original text on failure.
 */
export async function translateText(text, targetLang) { ... }
```

---

## 🧪 Testing

```bash
npm run test              # Run all tests
npm run test:coverage     # Run with coverage report
npm run test:watch        # Watch mode
```

### Test Requirements

- Every new service or utility **must** have a corresponding `*.test.js` file.
- Tests must cover: success paths, error paths, edge cases, and fallback behaviour.
- Minimum coverage thresholds:

| Metric | Threshold |
|---|---|
| Statements | ≥ 80% |
| Branches | ≥ 70% |
| Functions | ≥ 80% |
| Lines | ≥ 80% |

---

## 🔒 Security Guidelines

- **Never** use `eval()`, `new Function()`, or `innerHTML` with unsanitised data.
- **Always** sanitise user inputs via `sanitizeFull()` before processing.
- **Never** commit API keys or secrets — use `.env` variables exclusively.
- **Always** use `SafeApiClient` for external HTTP requests — it handles timeouts, retries, and error sanitisation.
- All new Google Cloud integrations must implement **graceful degradation** with static fallbacks.

---

## 🌐 Accessibility Checklist

Before submitting a PR, verify:

- [ ] All interactive elements are keyboard-accessible
- [ ] ARIA labels are present on buttons, inputs, and dynamic content
- [ ] Colour contrast meets WCAG 2.1 AA (4.5:1 minimum)
- [ ] Screen reader announcements work via `aria-live` regions
- [ ] `prefers-reduced-motion` is respected for animations

---

## 📝 Pull Request Process

1. Fork the repository and create a feature branch from `main`.
2. Write tests for all new functionality.
3. Ensure `npm run validate` passes (lint + tests + coverage).
4. Update documentation (README, JSDoc) for any new public APIs.
5. Submit a PR with a clear description of the changes.

---

## 🗂️ Project Structure

```
src/
├── components/     # React UI components
├── constants/      # Static data and configuration
├── services/       # Google Cloud API service modules
├── utils/          # Shared utility functions
└── tests/          # Vitest test suites
```

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
