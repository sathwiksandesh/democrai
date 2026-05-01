import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApiClient } from '../services/apiClient';

describe('Safe API Client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns parsed JSON on successful GET', async () => {
    const mockResponse = { ok: true, json: () => Promise.resolve({ data: 'test' }), text: () => Promise.resolve('') };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

    const client = createApiClient({ timeoutMs: 5000, retries: 0 });
    const result = await client.get('https://example.com/api');
    expect(result.ok).toBe(true);
    expect(result.data).toEqual({ data: 'test' });

    vi.restoreAllMocks();
  });

  it('returns parsed JSON on successful POST', async () => {
    const mockResponse = { ok: true, json: () => Promise.resolve({ result: 42 }), text: () => Promise.resolve('') };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

    const client = createApiClient({ timeoutMs: 5000, retries: 0 });
    const result = await client.post('https://example.com/api', { key: 'value' });
    expect(result.ok).toBe(true);
    expect(result.data.result).toBe(42);

    vi.restoreAllMocks();
  });

  it('returns error for non-ok HTTP response', async () => {
    const mockResponse = { ok: false, status: 403, json: () => Promise.resolve({}), text: () => Promise.resolve('Forbidden') };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

    const client = createApiClient({ timeoutMs: 5000, retries: 0 });
    const result = await client.get('https://example.com/api');
    expect(result.ok).toBe(false);
    expect(result.error).toContain('403');

    vi.restoreAllMocks();
  });

  it('returns timeout message when fetch aborts', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('The operation was aborted'));

    const client = createApiClient({ timeoutMs: 100, retries: 0 });
    const result = await client.get('https://example.com/slow');
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Request timed out. Please check your connection.');

    vi.restoreAllMocks();
  });

  it('returns network error for connection failures', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Connection refused'));

    const client = createApiClient({ timeoutMs: 5000, retries: 0 });
    const result = await client.get('https://example.com/down');
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Network error. Please try again later.');

    vi.restoreAllMocks();
  });

  it('retries on failure with exponential backoff', async () => {
    let callCount = 0;
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => {
      callCount++;
      return Promise.reject(new Error('fail'));
    });

    const client = createApiClient({ timeoutMs: 5000, retries: 2 });
    await client.get('https://example.com/flaky');
    expect(callCount).toBe(3); // initial + 2 retries

    vi.restoreAllMocks();
  });

  it('uses default retries=1 when undefined', async () => {
    let callCount = 0;
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => {
      callCount++;
      return Promise.reject(new Error('fail'));
    });

    const client = createApiClient({ timeoutMs: 5000 });
    await client.get('https://example.com/test');
    expect(callCount).toBe(2); // initial + 1 default retry

    vi.restoreAllMocks();
  });

  it('handles non-Error thrown objects gracefully', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue('plain string error');

    const client = createApiClient({ timeoutMs: 5000, retries: 0 });
    const result = await client.get('https://example.com/test');
    expect(result.ok).toBe(false);
    expect(result.error).toBe('Network error. Please try again later.');

    vi.restoreAllMocks();
  });
});
