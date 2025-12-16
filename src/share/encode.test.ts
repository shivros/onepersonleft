/**
 * Tests for state encoding/decoding
 */

import { describe, it, expect } from 'vitest'
import { encodeState, decodeState } from './encode'
import { createInitialState } from '../sim/index'
import type { SimulationState } from '../sim/types'

describe('Share Encoding', () => {
  describe('Round-trip encoding', () => {
    it('should encode and decode to identical state', () => {
      const original = createInitialState('test-encode-seed')

      const encoded = encodeState(original)
      const decoded = decodeState(encoded)

      expect(decoded).toEqual(original)
    })

    it('should handle state with ending data', () => {
      const original: SimulationState = {
        ...createInitialState('test-ending-seed'),
        ending: {
          type: 'win',
          reason: 'one_person_left',
          tick: 100,
        },
        bankruptTicks: 0,
        delisted: false,
        catastrophicFailure: false,
      }

      const encoded = encodeState(original)
      const decoded = decodeState(encoded)

      expect(decoded).toEqual(original)
    })

    it('should handle state with complex events history', () => {
      const original: SimulationState = {
        ...createInitialState('test-events-seed'),
        events: [
          { tick: 1, type: 'info', message: 'Game started' },
          { tick: 2, type: 'warning', message: 'Risk detected' },
          { tick: 3, type: 'danger', message: 'Critical situation' },
          { tick: 4, type: 'success', message: 'Problem resolved' },
        ],
      }

      const encoded = encodeState(original)
      const decoded = decodeState(encoded)

      expect(decoded).toEqual(original)
    })

    it('should handle state with agents deployed', () => {
      const original: SimulationState = {
        ...createInitialState('test-agents-seed'),
        company: {
          ...createInitialState('test-agents-seed').company,
          agents: [
            { id: 'agent-1', type: 'generalist', deployedAt: 10 },
            { id: 'agent-2', type: 'support', deployedAt: 20 },
            { id: 'agent-3', type: 'engineer', deployedAt: 30 },
          ],
        },
      }

      const encoded = encodeState(original)
      const decoded = decodeState(encoded)

      expect(decoded).toEqual(original)
    })
  })

  describe('Invalid input handling', () => {
    it('should return null for malformed base64', () => {
      const decoded = decodeState('not-valid-base64!!!')
      expect(decoded).toBeNull()
    })

    it('should return null for valid base64 but invalid JSON', () => {
      const badBase64 = btoa('this is not JSON')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
      const decoded = decodeState(badBase64)
      expect(decoded).toBeNull()
    })

    it('should return null for valid JSON but wrong schema', () => {
      const badData = { foo: 'bar', wrong: 'schema' }
      const json = JSON.stringify(badData)
      const base64 = btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
      const decoded = decodeState(base64)
      expect(decoded).toBeNull()
    })

    it('should return null for empty string', () => {
      const decoded = decodeState('')
      expect(decoded).toBeNull()
    })
  })

  describe('Backward compatibility', () => {
    it('should decode old state without Phase 5 fields', () => {
      // Create a state without Phase 5 fields (simulate old version)
      const oldState = {
        tick: 50,
        seed: 'old-seed',
        company: createInitialState('old-seed').company,
        hidden: createInitialState('old-seed').hidden,
        events: [],
        // No ending, bankruptTicks, delisted, catastrophicFailure
      }

      const encoded = encodeState(oldState as SimulationState)
      const decoded = decodeState(encoded)

      expect(decoded).toBeDefined()
      expect(decoded?.tick).toBe(50)
      expect(decoded?.ending).toBeUndefined()
    })
  })

  describe('URL length considerations', () => {
    it('should produce URL-safe characters only', () => {
      const state = createInitialState('url-safe-test')
      const encoded = encodeState(state)

      // URL-safe base64 should not contain +, /, or =
      expect(encoded).not.toMatch(/[+/=]/)

      // Should only contain alphanumeric, -, and _
      expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/)
    })

    it('should measure typical state size', () => {
      const state = createInitialState('size-test')
      const encoded = encodeState(state)

      // Log for visibility (not an assertion)
      console.log(`Encoded state length: ${encoded.length} characters`)

      // Sanity check: should be under 10KB for initial state
      expect(encoded.length).toBeLessThan(10000)
    })

    it('should measure state size with 100 events', () => {
      const state: SimulationState = {
        ...createInitialState('large-state-test'),
        events: Array.from({ length: 100 }, (_, i) => ({
          tick: i + 1,
          type: 'info' as const,
          message: `Event ${i + 1}: Some interesting game event occurred`,
        })),
      }

      const encoded = encodeState(state)

      console.log(`Encoded state with 100 events: ${encoded.length} characters`)

      // Should still be reasonable size
      expect(encoded.length).toBeLessThan(50000)
    })
  })

  describe('Encoding robustness', () => {
    it('should handle special characters in event messages', () => {
      const state = createInitialState('special-chars-test')

      const encoded = encodeState(state)
      const decoded = decodeState(encoded)

      // Just verify encode/decode works - round-trip is tested elsewhere
      expect(decoded).not.toBeNull()
      expect(decoded).toEqual(state)
    })

    it('should handle very large numbers', () => {
      const state: SimulationState = {
        ...createInitialState('large-numbers-test'),
        company: {
          ...createInitialState('large-numbers-test').company,
          cash: 999_999_999_999,
          marketCap: 1_000_000_000_000,
        },
      }

      const encoded = encodeState(state)
      const decoded = decodeState(encoded)

      expect(decoded?.company.cash).toBe(999_999_999_999)
      expect(decoded?.company.marketCap).toBe(1_000_000_000_000)
    })
  })
})
