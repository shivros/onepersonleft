/**
 * Agent deployment panel - allows players to deploy AI agents
 */

import { useGameStore } from '../../store/useGameStore'
import { AGENT_CONFIGS, type AgentType } from '../../sim'

export function AgentPanel() {
  const { agents, deployAgent, company } = useGameStore()

  const handleDeploy = (agentType: AgentType) => {
    deployAgent(agentType)
  }

  return (
    <div className="card">
      <h2>AI Agents ({agents.length})</h2>

      <div className="agent-grid">
        {(Object.keys(AGENT_CONFIGS) as AgentType[]).map((agentType) => {
          const config = AGENT_CONFIGS[agentType]
          const canAfford = company.cash >= config.deploymentCost

          return (
            <div key={agentType} className="agent-card">
              <div className="agent-header">
                <h3>{agentType.charAt(0).toUpperCase() + agentType.slice(1)}</h3>
                <div>
                  <span className="reliability-badge">
                    {(config.reliability * 100).toFixed(0)}% reliable
                  </span>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    ({config.reliability < 0.7 ? 'frequent failures' : 'occasional failures'})
                  </p>
                </div>
              </div>

              <div className="agent-details">
                <div className="cost-info">
                  <div>
                    <strong>Deploy:</strong> ${(config.deploymentCost / 1_000_000).toFixed(0)}M
                  </div>
                  <div>
                    <strong>Annual:</strong> ${(config.annualCost / 1_000_000).toFixed(0)}M/yr
                  </div>
                </div>

                <div className="specialization">
                  <strong>Automates:</strong> {config.specialization.join(', ')}
                </div>
              </div>

              <button
                onClick={() => handleDeploy(agentType)}
                disabled={!canAfford}
                className="deploy-button"
              >
                {canAfford ? 'Deploy Agent' : 'Insufficient Funds'}
              </button>
            </div>
          )
        })}
      </div>

      {agents.length > 0 && (
        <div className="deployed-agents">
          <h3>Deployed Agents</h3>
          <div className="agent-list">
            {agents.map((agent) => {
              const config = AGENT_CONFIGS[agent.type]
              return (
                <div key={agent.id} className="deployed-agent-card">
                  <span className="agent-type">
                    {agent.type.charAt(0).toUpperCase() + agent.type.slice(1)}
                  </span>
                  <span className="agent-id">{agent.id}</span>
                  <span className="agent-cost">
                    ${(config.annualCost / 1_000_000).toFixed(0)}M/yr
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
