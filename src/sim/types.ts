/**
 * Pure simulation types for One Person Left game
 * No browser/React dependencies allowed in this module
 */

export type Role = 'support' | 'sales' | 'engineering' | 'legal' | 'compliance'

export type AgentType = 'generalist' | 'support' | 'engineer' | 'compliance'

export interface Agent {
  id: string // Unique identifier
  type: AgentType
  deployedAt: number // Tick when agent was deployed
}

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
  agents: Agent[] // Deployed AI agents
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

/**
 * Agent configuration - deployment costs and capabilities
 * Based on plan review decision point 1: using proposed costs
 */
export interface AgentConfig {
  deploymentCost: number // One-time cost to deploy
  annualCost: number // Ongoing operational cost per year
  reliability: number // 0.0 to 1.0 - higher is more reliable
  specialization: Role[] // Which roles this agent can automate
}

export const AGENT_CONFIGS: Record<AgentType, AgentConfig> = {
  generalist: {
    deploymentCost: 10_000_000, // $10M
    annualCost: 5_000_000, // $5M/year
    reliability: 0.7,
    specialization: ['support', 'sales'], // Can handle customer-facing roles
  },
  support: {
    deploymentCost: 25_000_000, // $25M
    annualCost: 10_000_000, // $10M/year
    reliability: 0.8,
    specialization: ['support'],
  },
  engineer: {
    deploymentCost: 100_000_000, // $100M
    annualCost: 30_000_000, // $30M/year
    reliability: 0.6,
    specialization: ['engineering'],
  },
  compliance: {
    deploymentCost: 50_000_000, // $50M
    annualCost: 20_000_000, // $20M/year
    reliability: 0.75,
    specialization: ['legal', 'compliance'],
  },
} as const
