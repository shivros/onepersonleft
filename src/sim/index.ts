/**
 * Main simulation module - exports all simulation functionality
 * This is the public API for the simulation
 */

export * from './types'
export * from './actions'
export * from './rng'
export * from './reduce'
export * from './tick'

import type { SimulationState } from './types'
import { DEFAULT_SEED, INITIAL_HEADCOUNT } from './types'

/**
 * Create a new initial simulation state
 */
export function createInitialState(seed: string = DEFAULT_SEED): SimulationState {
  return {
    tick: 0,
    seed,
    company: {
      ticker: 'DNSZ',
      cash: 40_000_000_000, // $40B initial cash
      burnRate: 0, // Will be calculated on first tick
      revenue: 0, // Will be calculated on first tick
      stockPrice: 666, // Initial IPO price
      marketCap: 666_000_000_000, // $666B initial market cap
      roles: {
        support: { headcount: INITIAL_HEADCOUNT.support, automationLevel: 0 },
        sales: { headcount: INITIAL_HEADCOUNT.sales, automationLevel: 0 },
        engineering: { headcount: INITIAL_HEADCOUNT.engineering, automationLevel: 0 },
        legal: { headcount: INITIAL_HEADCOUNT.legal, automationLevel: 0 },
        compliance: { headcount: INITIAL_HEADCOUNT.compliance, automationLevel: 0 },
      },
    },
    hidden: {
      complianceRisk: 0,
      auditRisk: 0,
      agentRisk: 0,
    },
    events: [
      {
        tick: 0,
        type: 'info',
        message: 'Simulation initialized. Welcome to One Person Left.',
      },
    ],
  }
}
