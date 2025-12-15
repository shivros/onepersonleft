/**
 * Seeded pseudo-random number generator (PRNG) using mulberry32 algorithm
 * Ensures deterministic behavior for reproducible simulations
 *
 * CRITICAL: Never use Math.random() or Date.now() in simulation code!
 */

/**
 * Hash a string seed into a 32-bit unsigned integer
 */
function hashSeed(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * Mulberry32 PRNG - simple, fast, good quality for games
 * Period: 2^32 (~4 billion) which is more than sufficient for this game
 */
export class SeededRNG {
  private state: number

  constructor(seed: string) {
    this.state = hashSeed(seed)
  }

  /**
   * Generate next random number in range [0, 1)
   */
  next(): number {
    this.state = (this.state + 0x6d2b79f5) | 0
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  /**
   * Generate random integer in range [min, max] inclusive
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  /**
   * Generate random float in range [min, max)
   */
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min
  }

  /**
   * Return true with probability p (where 0 <= p <= 1)
   */
  chance(p: number): boolean {
    return this.next() < p
  }

  /**
   * Clone this RNG to create a new independent generator with the same state
   */
  clone(): SeededRNG {
    const cloned = Object.create(SeededRNG.prototype)
    cloned.state = this.state
    return cloned
  }
}
