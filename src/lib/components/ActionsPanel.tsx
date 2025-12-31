import { useGameStore } from '../../store/useGameStore'
import { AGENT_CONFIGS, type Role } from '../../sim'

const ROLES: Role[] = ['support', 'sales', 'engineering', 'legal', 'compliance']

export function ActionsPanel() {
  const tick = useGameStore((state) => state.tick)
  const roles = useGameStore((state) => state.roles)
  const agents = useGameStore((state) => state.agents)
  const ending = useGameStore((state) => state.ending)
  const advanceTick = useGameStore((state) => state.advanceTick)
  const automateRole = useGameStore((state) => state.automateRole)
  const hire = useGameStore((state) => state.hire)
  const fire = useGameStore((state) => state.fire)
  const reset = useGameStore((state) => state.reset)

  const gameEnded = ending !== null

  const advanceMultipleWeeks = (weeks: number) => {
    for (let i = 0; i < weeks; i++) {
      advanceTick()
    }
  }

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
          disabled={gameEnded}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          Advance 1 Week
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => advanceMultipleWeeks(4)}
            disabled={gameEnded}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Advance 4 Weeks
          </button>
          <button
            onClick={() => advanceMultipleWeeks(12)}
            disabled={gameEnded}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Advance 12 Weeks
          </button>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Role Automation</h3>
          <p className="text-xs text-gray-500 mb-3">
            Automation reduces headcount but increases risk
          </p>
          <div className="space-y-3">
            {ROLES.map((role) => {
              const roleData = roles[role]
              const headcount = roleData.headcount
              const automationPercent = Math.round(roleData.automationLevel * 100)

              // Find compatible agents for this role
              const compatibleAgents = agents.filter((agent) => {
                const config = AGENT_CONFIGS[agent.type]
                return config.specialization.includes(role)
              })

              const canAutomate = compatibleAgents.length > 0 && automationPercent < 100
              const fireDisabled = gameEnded || headcount === 0
              const hireDisabled = gameEnded

              const fireTenPercentCount =
                headcount > 0 ? Math.max(1, Math.floor(headcount * 0.1)) : 0

              const fireActions = [
                {
                  label: '-100',
                  count: Math.min(100, headcount),
                  tooltip:
                    headcount === 0
                      ? 'No employees to fire'
                      : `Fire ${Math.min(100, headcount).toLocaleString()} ${role}`,
                },
                {
                  label: '-1k',
                  count: Math.min(1000, headcount),
                  tooltip:
                    headcount === 0
                      ? 'No employees to fire'
                      : `Fire ${Math.min(1000, headcount).toLocaleString()} ${role}`,
                },
                {
                  label: '-10%',
                  count: Math.min(headcount, fireTenPercentCount),
                  tooltip:
                    headcount === 0
                      ? 'No employees to fire'
                      : `Fire ${Math.min(
                          headcount,
                          fireTenPercentCount
                        ).toLocaleString()} ${role} (10%)`,
                },
                {
                  label: '-All',
                  count: headcount,
                  tooltip:
                    headcount === 0
                      ? 'No employees to fire'
                      : `Fire all ${headcount.toLocaleString()} ${role}`,
                },
              ]

              const hireActions = [
                {
                  label: '+100',
                  count: 100,
                  tooltip: `Hire 100 ${role} (current ${headcount.toLocaleString()})`,
                },
                {
                  label: '+1k',
                  count: 1000,
                  tooltip: `Hire 1,000 ${role} (current ${headcount.toLocaleString()})`,
                },
              ]

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

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] uppercase tracking-wide text-gray-500 w-14">
                        Fire
                      </span>
                      <div className="grid grid-cols-4 gap-2 flex-1">
                        {fireActions.map(({ label, count, tooltip }) => (
                          <button
                            key={label}
                            onClick={() => fire(role, count)}
                            disabled={fireDisabled || count === 0}
                            title={tooltip}
                            className="text-xs bg-red-100 hover:bg-red-200 disabled:bg-gray-200 disabled:text-gray-500 text-red-700 font-semibold py-1 px-2 rounded-md transition-colors"
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] uppercase tracking-wide text-gray-500 w-14">
                        Hire
                      </span>
                      <div className="grid grid-cols-2 gap-2 flex-1">
                        {hireActions.map(({ label, count, tooltip }) => (
                          <button
                            key={label}
                            onClick={() => hire(role, count)}
                            disabled={hireDisabled}
                            title={tooltip}
                            className="text-xs bg-green-100 hover:bg-green-200 disabled:bg-gray-200 disabled:text-gray-500 text-green-700 font-semibold py-1 px-2 rounded-md transition-colors"
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
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
