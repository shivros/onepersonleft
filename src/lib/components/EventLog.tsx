import { useGameStore } from '../../store/useGameStore'

export function EventLog() {
  const events = useGameStore((state) => state.events)

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Event Log</h2>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {events.map((event, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded p-3 text-sm text-gray-700 border-l-4 border-blue-500"
          >
            {event}
          </div>
        ))}
      </div>
    </div>
  )
}
