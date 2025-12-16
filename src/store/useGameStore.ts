import { create } from 'zustand'
import {
  createInitialState,
  tick,
  reduce,
  actions,
  type SimulationState,
  type Role,
  type GameEvent,
  type AgentType,
  type Agent,
  type Ending,
} from '../sim'
import { encodeState, decodeState } from '../share/encode'

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
  // Expose agents for agent panel
  agents: Agent[]
  // Phase 5: Game ending state
  ending: Ending | null
}

/**
 * Game store actions (methods)
 */
interface GameStore extends GameState {
  advanceTick: () => void
  setAutomation: (role: Role, level: number) => void
  hire: (role: Role, count: number) => void
  fire: (role: Role, count: number) => void
  deployAgent: (agentType: AgentType) => void
  automateRole: (role: Role, agentId: string) => void
  reset: () => void
  restart: (seed?: string) => void
  getShareURL: () => string
  loadFromHash: () => void
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
  agents: simState.company.agents,
  ending: simState.ending ?? null,

  // Actions
  advanceTick: () => {
    simState = tick(simState)
    set({
      tick: simState.tick,
      company: toCompanyMetrics(simState),
      events: toEventStrings(simState.events),
      roles: simState.company.roles,
      agents: simState.company.agents,
      ending: simState.ending ?? null,
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

  deployAgent: (agentType: AgentType) => {
    simState = reduce(simState, actions.deployAgent(agentType))
    set({
      company: toCompanyMetrics(simState),
      events: toEventStrings(simState.events),
      agents: simState.company.agents,
    })
  },

  automateRole: (role: Role, agentId: string) => {
    simState = reduce(simState, actions.automateRole(role, agentId))
    set({
      company: toCompanyMetrics(simState),
      events: toEventStrings(simState.events),
      roles: simState.company.roles,
      agents: simState.company.agents,
    })
  },

  reset: () => {
    simState = createInitialState()
    set({
      tick: simState.tick,
      company: toCompanyMetrics(simState),
      events: toEventStrings(simState.events),
      roles: simState.company.roles,
      agents: simState.company.agents,
      ending: simState.ending ?? null,
    })
  },

  restart: (seed?: string) => {
    simState = createInitialState(seed)
    set({
      tick: simState.tick,
      company: toCompanyMetrics(simState),
      events: toEventStrings(simState.events),
      roles: simState.company.roles,
      agents: simState.company.agents,
      ending: simState.ending ?? null,
    })
  },

  getShareURL: () => {
    const encoded = encodeState(simState)
    return `${window.location.origin}${window.location.pathname}#${encoded}`
  },

  loadFromHash: () => {
    const hash = window.location.hash.slice(1) // Remove '#' prefix
    if (!hash) {
      return // No hash to load
    }

    const decoded = decodeState(hash)
    if (decoded) {
      simState = decoded
      set({
        tick: simState.tick,
        company: toCompanyMetrics(simState),
        events: toEventStrings(simState.events),
        roles: simState.company.roles,
        agents: simState.company.agents,
        ending: simState.ending ?? null,
      })
    } else {
      console.warn('Failed to decode share link, starting fresh game')
    }
  },
}))
