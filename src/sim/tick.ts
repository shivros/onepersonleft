/**
 * Core simulation tick function - advances time by one week
 * This is where the game logic happens
 */

import type { SimulationState, Role, GameEvent } from './types'
import { ROLE_CONFIGS, AGENT_CONFIGS } from './types'
import { SeededRNG } from './rng'

/**
 * Advance the simulation by one week
 * This is a pure function that takes current state + RNG and returns new state
 */
export function tick(state: SimulationState): SimulationState {
  // Create RNG from current state for deterministic randomness
  const rng = new SeededRNG(`${state.seed}-tick-${state.tick}`)

  const newEvents: GameEvent[] = []
  const nextTick = state.tick + 1

  // Calculate financial changes
  const { burnRate, revenue } = calculateFinancials(state)
  const weeklyBurnRate = burnRate / 52 // Convert annual to weekly
  const weeklyRevenue = revenue / 52
  const netWeeklyCash = weeklyRevenue - weeklyBurnRate

  const newCash = Math.max(0, state.company.cash + netWeeklyCash)

  // Check for bankruptcy
  if (newCash === 0 && state.company.cash > 0) {
    newEvents.push({
      tick: nextTick,
      type: 'danger',
      message: 'BANKRUPT! Company has run out of cash.',
    })
  }

  // Calculate stock price (simplified model based on cash and revenue)
  const totalHeadcount = Object.values(state.company.roles).reduce(
    (sum, role) => sum + role.headcount,
    0
  )
  const cashPerEmployee = totalHeadcount > 0 ? newCash / totalHeadcount : 0
  const revenuePerEmployee = totalHeadcount > 0 ? revenue / totalHeadcount : 0

  // Stock price is influenced by cash reserves and revenue efficiency
  const baseStockPrice = (cashPerEmployee / 1000 + revenuePerEmployee / 100) * 0.5
  const volatility = rng.nextFloat(-0.05, 0.05) // ±5% random walk
  const newStockPrice = Math.max(1, baseStockPrice * (1 + volatility))

  // Market cap = stock price * arbitrary share count (1B shares)
  const shares = 1_000_000_000
  const newMarketCap = newStockPrice * shares

  // Update hidden risk metrics based on automation levels
  const { complianceRisk, auditRisk, agentRisk } = calculateRisks(state, rng)

  // Generate random events based on risks
  const riskEvents = generateRiskEvents(nextTick, rng, {
    complianceRisk,
    auditRisk,
    agentRisk,
  })

  newEvents.push(...riskEvents)

  // Add weekly status update
  const headcountChange = totalHeadcount - getTotalHeadcount(state)
  if (headcountChange !== 0) {
    newEvents.push({
      tick: nextTick,
      type: 'info',
      message: `Week ${nextTick}: Headcount ${headcountChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(headcountChange)}`,
    })
  }

  return {
    ...state,
    tick: nextTick,
    company: {
      ...state.company,
      cash: newCash,
      burnRate,
      revenue,
      stockPrice: newStockPrice,
      marketCap: newMarketCap,
    },
    hidden: {
      complianceRisk,
      auditRisk,
      agentRisk,
    },
    events: [...state.events, ...newEvents],
  }
}

/**
 * Calculate burn rate and revenue based on current headcount and automation
 */
function calculateFinancials(state: SimulationState): {
  burnRate: number
  revenue: number
} {
  let burnRate = 0
  let revenue = 0

  for (const [roleName, roleData] of Object.entries(state.company.roles)) {
    const role = roleName as Role
    const config = ROLE_CONFIGS[role]

    // Burn rate = cost per employee * headcount
    // Automation reduces burn rate (AI is cheaper than humans)
    const automationDiscount = 1 - roleData.automationLevel * 0.3 // Up to 30% cost reduction
    burnRate += config.annualCostPerEmployee * roleData.headcount * automationDiscount

    // Revenue only comes from sales
    if (role === 'sales') {
      // Automation can increase revenue efficiency
      const automationBonus = 1 + roleData.automationLevel * 0.5 // Up to 50% revenue boost
      revenue += config.revenuePerEmployee * roleData.headcount * automationBonus
    }
  }

  // Add agent operational costs to burn rate
  for (const agent of state.company.agents) {
    const agentConfig = AGENT_CONFIGS[agent.type]
    burnRate += agentConfig.annualCost
  }

  return { burnRate, revenue }
}

/**
 * Calculate hidden risk metrics based on automation levels and headcount
 */
function calculateRisks(
  state: SimulationState,
  rng: SeededRNG
): {
  complianceRisk: number
  auditRisk: number
  agentRisk: number
} {
  const complianceHeadcount = state.company.roles.compliance.headcount
  const legalHeadcount = state.company.roles.legal.headcount
  const complianceAutomation = state.company.roles.compliance.automationLevel
  const legalAutomation = state.company.roles.legal.automationLevel

  // Compliance risk increases when compliance headcount is low or automation is high
  const baseComplianceRisk = 1 - complianceHeadcount / 5000 // Risk increases as headcount drops below 5000
  const automationComplianceRisk = complianceAutomation * 0.3
  const complianceRisk = Math.max(
    0,
    Math.min(1, baseComplianceRisk + automationComplianceRisk + rng.nextFloat(-0.1, 0.1))
  )

  // Audit risk similar to compliance risk
  const baseAuditRisk = 1 - legalHeadcount / 5000
  const automationAuditRisk = legalAutomation * 0.3
  const auditRisk = Math.max(
    0,
    Math.min(1, baseAuditRisk + automationAuditRisk + rng.nextFloat(-0.1, 0.1))
  )

  // Agent risk increases with overall automation level AND decreases with agent reliability
  const avgAutomation =
    Object.values(state.company.roles).reduce((sum, role) => sum + role.automationLevel, 0) / 5

  // Calculate average agent reliability (lower reliability = higher risk)
  let avgReliabilityPenalty = 0
  if (state.company.agents.length > 0) {
    const totalReliability = state.company.agents.reduce((sum, agent) => {
      const config = AGENT_CONFIGS[agent.type]
      return sum + (1 - config.reliability) // Convert reliability to risk factor
    }, 0)
    avgReliabilityPenalty = totalReliability / state.company.agents.length
  }

  const agentRisk = Math.max(
    0,
    Math.min(
      1,
      avgAutomation * avgAutomation + avgReliabilityPenalty * 0.5 + rng.nextFloat(-0.05, 0.05)
    )
  )

  return { complianceRisk, auditRisk, agentRisk }
}

/**
 * Generate random events based on risk levels
 */
function generateRiskEvents(
  tick: number,
  rng: SeededRNG,
  risks: { complianceRisk: number; auditRisk: number; agentRisk: number }
): GameEvent[] {
  const events: GameEvent[] = []

  // Compliance incident (low probability, scales with risk)
  if (rng.chance(risks.complianceRisk * 0.02)) {
    events.push({
      tick,
      type: 'warning',
      message: 'Compliance issue detected. Regulatory scrutiny increased.',
    })
  }

  // Audit event (low probability, scales with risk)
  if (rng.chance(risks.auditRisk * 0.02)) {
    events.push({
      tick,
      type: 'warning',
      message: 'Legal audit triggered. Additional oversight required.',
    })
  }

  // Agent incident (very low probability, scales with risk)
  if (rng.chance(risks.agentRisk * 0.01)) {
    events.push({
      tick,
      type: 'danger',
      message: 'AI agent anomaly detected. System behavior under review.',
    })
  }

  return events
}

/**
 * Helper to get total headcount from previous state
 */
function getTotalHeadcount(state: SimulationState): number {
  return Object.values(state.company.roles).reduce((sum, role) => sum + role.headcount, 0)
}
