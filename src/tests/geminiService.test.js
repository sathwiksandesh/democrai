import { describe, it, expect, vi, beforeEach } from 'vitest';
import { askGemini } from '../services/geminiService';

describe('Gemini Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws when API key is missing', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', '');
    await expect(askGemini([], 'hello')).rejects.toThrow('API key is missing');
    vi.unstubAllEnvs();
  });

  it('returns response text on successful API call', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        candidates: [{ content: { parts: [{ text: 'Hello from Gemini!' }] } }],
      }),
    });

    const result = await askGemini([], 'How do I register?');
    expect(result).toBe('Hello from Gemini!');

    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('throws on non-ok HTTP response', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(askGemini([], 'test')).rejects.toThrow('Gemini request failed: 500');

    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('throws on unexpected response format (no candidates)', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ candidates: [] }),
    });

    await expect(askGemini([], 'test')).rejects.toThrow('Unexpected response format');

    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('throws on network error', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network down'));

    await expect(askGemini([], 'test')).rejects.toThrow('Gemini request failed: Network down');

    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('maps conversation history correctly', async () => {
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test-key');
    let sentBody;
    vi.spyOn(globalThis, 'fetch').mockImplementation((_, opts) => {
      sentBody = JSON.parse(opts.body);
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{ content: { parts: [{ text: 'Response' }] } }],
        }),
      });
    });

    const history = [
      { role: 'user', content: 'Hi' },
      { role: 'model', content: 'Hello!' },
    ];
    await askGemini(history, 'New question');

    expect(sentBody.contents).toHaveLength(3); // 2 history + 1 new
    expect(sentBody.contents[0].role).toBe('user');
    expect(sentBody.contents[1].role).toBe('model');
    expect(sentBody.contents[2].role).toBe('user');
    expect(sentBody.systemInstruction).toBeDefined();

    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });
});
