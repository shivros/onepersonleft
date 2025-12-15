import { useGameStore } from '../../store/useGameStore'
import type { Role } from '../../sim'

const ROLES: Role[] = ['support', 'sales', 'engineering', 'legal', 'compliance']

export function ActionsPanel() {
  const tick = useGameStore((state) => state.tick)
  const roles = useGameStore((state) => state.roles)
  const advanceTick = useGameStore((state) => state.advanceTick)
  const setAutomation = useGameStore((state) => state.setAutomation)
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

              return (
                <div key={role} className="bg-gray-50 rounded p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700 capitalize">{role}</span>
                    <span className="text-sm text-gray-600">
                      {roleData.headcount.toLocaleString()} employees
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={automationPercent}
                      onChange={(e) => setAutomation(role, parseInt(e.target.value) / 100)}
                      className="flex-1"
                    />
                    <span className="text-sm font-semibold text-blue-600 w-12">
                      {automationPercent}%
                    </span>
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
