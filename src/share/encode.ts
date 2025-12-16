/**
 * State encoding/decoding for share links
 * Uses base64url encoding (URL-safe, no padding)
 */

import type { SimulationState } from '../sim/types'
import { SimulationStateSchema } from './schema'

/**
 * Encode simulation state to URL-safe string
 * Returns base64url-encoded JSON (no compression for simplicity)
 */
export function encodeState(state: SimulationState): string {
  try {
    // Serialize to JSON
    const json = JSON.stringify(state)

    // Convert to base64url (URL-safe)
    const base64 = btoa(json)
    const base64url = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')

    return base64url
  } catch (error) {
    console.error('Failed to encode state:', error)
    throw new Error('Failed to encode state')
  }
}

/**
 * Decode URL-safe string to simulation state
 * Returns null on failure (invalid base64, malformed JSON, schema violation)
 */
export function decodeState(encoded: string): SimulationState | null {
  try {
    // Convert base64url back to base64
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')

    // Add padding if needed
    while (base64.length % 4 !== 0) {
      base64 += '='
    }

    // Decode base64
    const json = atob(base64)

    // Parse JSON
    const parsed = JSON.parse(json)

    // Validate with Zod schema
    const result = SimulationStateSchema.safeParse(parsed)

    if (!result.success) {
      console.warn('State validation failed:', result.error)
      return null
    }

    return result.data as SimulationState
  } catch (error) {
    console.warn('Failed to decode state:', error)
    return null
  }
}
