import { useGameStore } from '../../store/useGameStore'

export function ActionsPanel() {
  const tick = useGameStore((state) => state.tick)
  const advanceTick = useGameStore((state) => state.advanceTick)

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
      </div>
    </div>
  )
}
