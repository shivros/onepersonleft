import { create } from 'zustand'
import {
  createInitialState,
  tick,
  reduce,
  actions,
  type SimulationState,
  type Role,
  type GameEvent,
} from '../sim'

/**
 * UI-friendly view of company metrics (flattened from sim state)
 */
export interface CompanyMetrics {
  ticker: string
  headcount: number
  cash: number
  burnRate: number
  revenue: number
  stockPrice: number
  marketCap: number
}

/**
 * Convert simulation state to UI-friendly format
 */
function toCompanyMetrics(simState: SimulationState): CompanyMetrics {
  const totalHeadcount = Object.values(simState.company.roles).reduce(
    (sum, role) => sum + role.headcount,
    0
  )

  return {
    ticker: simState.company.ticker,
    headcount: totalHeadcount,
    cash: simState.company.cash,
    burnRate: simState.company.burnRate,
    revenue: simState.company.revenue,
    stockPrice: simState.company.stockPrice,
    marketCap: simState.company.marketCap,
  }
}

/**
 * Convert game events to simple strings for UI
 */
function toEventStrings(events: GameEvent[]): string[] {
  return events.map((e) => `Week ${e.tick}: ${e.message}`)
}

/**
 * Game store state exposed to UI
 */
export interface GameState {
  tick: number
  company: CompanyMetrics
  events: string[]
  // Expose roles for automation controls
  roles: SimulationState['company']['roles']
}

/**
 * Game store actions (methods)
 */
interface GameStore extends GameState {
  advanceTick: () => void
  setAutomation: (role: Role, level: number) => void
  hire: (role: Role, count: number) => void
  fire: (role: Role, count: number) => void
  reset: () => void
}

/**
 * Internal simulation state (not exposed to UI)
 */
let simState: SimulationState = createInitialState()

/**
 * Zustand store - thin wrapper around simulation
 */
export const useGameStore = create<GameStore>((set) => ({
  // Initial UI state
  tick: simState.tick,
  company: toCompanyMetrics(simState),
  events: toEventStrings(simState.events),
  roles: simState.company.roles,

  // Actions
  advanceTick: () => {
    simState = tick(simState)
    set({
      tick: simState.tick,
      company: toCompanyMetrics(simState),
      events: toEventStrings(simState.events),
      roles: simState.company.roles,
    })
  },

  setAutomation: (role: Role, level: number) => {
    simState = reduce(simState, actions.setAutomation(role, level))
    set({
      events: toEventStrings(simState.events),
      roles: simState.company.roles,
    })
  },

  hire: (role: Role, count: number) => {
    simState = reduce(simState, actions.hire(role, count))
    set({
      company: toCompanyMetrics(simState),
      events: toEventStrings(simState.events),
      roles: simState.company.roles,
    })
  },

  fire: (role: Role, count: number) => {
    simState = reduce(simState, actions.fire(role, count))
    set({
      company: toCompanyMetrics(simState),
      events: toEventStrings(simState.events),
      roles: simState.company.roles,
    })
  },

  reset: () => {
    simState = createInitialState()
    set({
      tick: simState.tick,
      company: toCompanyMetrics(simState),
      events: toEventStrings(simState.events),
      roles: simState.company.roles,
    })
  },
}))
