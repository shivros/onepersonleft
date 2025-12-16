import { useGameStore } from '../../store/useGameStore'
import { AGENT_CONFIGS, type Role } from '../../sim'

const ROLES: Role[] = ['support', 'sales', 'engineering', 'legal', 'compliance']

export function ActionsPanel() {
  const tick = useGameStore((state) => state.tick)
  const roles = useGameStore((state) => state.roles)
  const agents = useGameStore((state) => state.agents)
  const advanceTick = useGameStore((state) => state.advanceTick)
  const automateRole = useGameStore((state) => state.automateRole)
  const reset = useGameStore((state) => state.reset)

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Actions</h2>
      <div className="space-y-4">
        <div className="bg-gray-100 rounded p-4">
          <p className="text-sm text-gray-600 mb-2">Current Week</p>
          <p className="text-3xl font-bold text-blue-600">{tick}</p>
        </div>
        <button
          onClick={advanceTick}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          Advance 1 Week
        </button>

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Role Automation</h3>
          <div className="space-y-3">
            {ROLES.map((role) => {
              const roleData = roles[role]
              const automationPercent = Math.round(roleData.automationLevel * 100)

              // Find compatible agents for this role
              const compatibleAgents = agents.filter((agent) => {
                const config = AGENT_CONFIGS[agent.type]
                return config.specialization.includes(role)
              })

              const canAutomate = compatibleAgents.length > 0 && automationPercent < 100

              return (
                <div key={role} className="bg-gray-50 rounded p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700 capitalize">{role}</span>
                    <span className="text-sm text-gray-600">
                      {roleData.headcount.toLocaleString()} employees
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${automationPercent}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-blue-600 w-12">
                      {automationPercent}%
                    </span>
                  </div>

                  {compatibleAgents.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {compatibleAgents.map((agent) => (
                        <button
                          key={agent.id}
                          onClick={() => automateRole(role, agent.id)}
                          disabled={!canAutomate}
                          className="w-full text-xs bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-1 px-2 rounded transition-colors"
                        >
                          Automate +10% ({agent.type} agent)
                        </button>
                      ))}
                    </div>
                  )}

                  {compatibleAgents.length === 0 && (
                    <p className="text-xs text-gray-500 mt-2 italic">
                      Deploy compatible agent to automate this role
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <button
          onClick={reset}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 text-sm"
        >
          Reset Simulation
        </button>
      </div>
    </div>
  )
}
