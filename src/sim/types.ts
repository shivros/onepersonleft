/**
 * Pure simulation types for One Person Left game
 * No browser/React dependencies allowed in this module
 */

export type Role = 'support' | 'sales' | 'engineering' | 'legal' | 'compliance'

export interface RoleData {
  headcount: number
  automationLevel: number // 0.0 to 1.0 - determines how much work AI can do
}

export interface CompanyState {
  ticker: string
  cash: number // dollars
  burnRate: number // dollars per year
  revenue: number // dollars per year
  stockPrice: number // dollars per share
  marketCap: number // dollars
  roles: Record<Role, RoleData>
}

export interface HiddenMetrics {
  complianceRisk: number // 0.0 to 1.0
  auditRisk: number // 0.0 to 1.0
  agentRisk: number // 0.0 to 1.0 - risk that AI agents go rogue
}

export interface SimulationState {
  tick: number // week number
  seed: string // RNG seed for determinism
  company: CompanyState
  hidden: HiddenMetrics
  events: GameEvent[]
}

export type EventType = 'info' | 'warning' | 'danger' | 'success'

export interface GameEvent {
  tick: number
  type: EventType
  message: string
}

/**
 * Role-specific configuration constants
 */
export const ROLE_CONFIGS = {
  support: {
    annualCostPerEmployee: 80_000,
    revenuePerEmployee: 0, // Support doesn't generate direct revenue
  },
  sales: {
    annualCostPerEmployee: 150_000,
    revenuePerEmployee: 500_000, // Sales generates revenue
  },
  engineering: {
    annualCostPerEmployee: 200_000,
    revenuePerEmployee: 0,
  },
  legal: {
    annualCostPerEmployee: 180_000,
    revenuePerEmployee: 0,
  },
  compliance: {
    annualCostPerEmployee: 160_000,
    revenuePerEmployee: 0,
  },
} as const

/**
 * Initial state configuration
 */
export const INITIAL_HEADCOUNT: Record<Role, number> = {
  support: 15_000,
  sales: 10_000,
  engineering: 15_000,
  legal: 5_000,
  compliance: 5_000,
}

export const DEFAULT_SEED = 'default-seed'
