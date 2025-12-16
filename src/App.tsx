import { useEffect } from 'react'
import { Dashboard } from './lib/components/Dashboard'
import { useGameStore } from './store/useGameStore'

function App() {
  const loadFromHash = useGameStore((state) => state.loadFromHash)

  // Load state from URL hash on mount
  useEffect(() => {
    loadFromHash()
  }, [loadFromHash])

  return <Dashboard />
}

export default App
