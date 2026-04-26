import { describe, expect, it } from 'vitest'
import { createApiKeySecret, getApiKeyLast4, getApiKeyPrefix, hashApiKey } from '../../src/lib/security/api-keys.js'

describe('api key helpers', () => {
  it('creates API keys with the template prefix', () => {
    const apiKey = createApiKeySecret()

    expect(apiKey).toMatch(/^bst_[A-Za-z0-9_-]+$/)
    expect(apiKey.length).toBeGreaterThan(32)
  })

  it('hashes keys deterministically with a pepper', () => {
    const apiKey = 'bst_test_key'
    const pepper = 'secret-pepper'

    expect(hashApiKey(apiKey, pepper)).toBe(hashApiKey(apiKey, pepper))
    expect(hashApiKey(apiKey, pepper)).not.toBe(hashApiKey(apiKey, 'different-pepper'))
  })

  it('extracts safe key metadata', () => {
    const apiKey = 'bst_abcdefghijklmnopqrstuvwxyz'

    expect(getApiKeyPrefix(apiKey)).toBe('bst_abcdefgh')
    expect(getApiKeyLast4(apiKey)).toBe('wxyz')
  })
})
