import { describe, it, expect, beforeEach } from 'vitest';
import { createCache } from '../utils/cache';

describe('LRU Cache', () => {
  let cache;

  beforeEach(() => {
    cache = createCache({ maxSize: 3, ttlMs: 1000 });
  });

  it('stores and retrieves values correctly', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('returns undefined for missing keys', () => {
    expect(cache.get('nonexistent')).toBeUndefined();
  });

  it('returns correct size', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    expect(cache.size()).toBe(2);
  });

  it('evicts oldest entry when capacity is exceeded', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    cache.set('d', 4); // should evict 'a'
    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('d')).toBe(4);
    expect(cache.size()).toBe(3);
  });

  it('refreshes position on get (LRU)', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    cache.get('a'); // refresh 'a' to most recently used
    cache.set('d', 4); // should evict 'b' (now oldest)
    expect(cache.get('a')).toBe(1);
    expect(cache.get('b')).toBeUndefined();
  });

  it('expires entries after TTL', async () => {
    const shortCache = createCache({ maxSize: 10, ttlMs: 50 });
    shortCache.set('expiring', 'value');
    expect(shortCache.get('expiring')).toBe('value');
    await new Promise(r => setTimeout(r, 100));
    expect(shortCache.get('expiring')).toBeUndefined();
  });

  it('has() returns true for existing keys', () => {
    cache.set('x', 99);
    expect(cache.has('x')).toBe(true);
    expect(cache.has('y')).toBe(false);
  });

  it('clear() empties the cache', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    cache.clear();
    expect(cache.size()).toBe(0);
    expect(cache.get('a')).toBeUndefined();
  });

  it('makeKey generates consistent lowercase keys', () => {
    expect(cache.makeKey('maps', 'Delhi')).toBe('maps:delhi');
    expect(cache.makeKey('tr', '  Hello  ')).toBe('tr:hello');
  });

  it('overwrites existing keys with new values', () => {
    cache.set('k', 'old');
    cache.set('k', 'new');
    expect(cache.get('k')).toBe('new');
  });

  it('defaults to maxSize=100 and ttlMs=300000', () => {
    const defaultCache = createCache();
    defaultCache.set('test', 'val');
    expect(defaultCache.get('test')).toBe('val');
  });
});
