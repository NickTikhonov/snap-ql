import { useState, useEffect, useCallback } from 'react'

interface UseConnectionsReturn {
  connections: string[]
  selectedConnection: string | null
  selectConnection: (connectionName: string | null) => void
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useConnections(): UseConnectionsReturn {
  const [connections, setConnections] = useState<string[]>([])
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadConnections = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const connectionList = await window.context.listConnections()
      setConnections(connectionList)

      // Auto-select first connection if none selected and connections exist
      if (!selectedConnection && connectionList.length > 0) {
        setSelectedConnection(connectionList[0])
      }

      // Clear selection if selected connection no longer exists
      if (selectedConnection && !connectionList.includes(selectedConnection)) {
        setSelectedConnection(connectionList.length > 0 ? connectionList[0] : null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load connections')
      console.error('Failed to load connections:', err)
    } finally {
      setIsLoading(false)
    }
  }, [selectedConnection])

  useEffect(() => {
    loadConnections()
  }, [])

  const selectConnection = useCallback((connectionName: string | null) => {
    setSelectedConnection(connectionName)
  }, [])

  const refresh = useCallback(async () => {
    await loadConnections()
  }, [loadConnections])

  return {
    connections,
    selectedConnection,
    selectConnection,
    isLoading,
    error,
    refresh
  }
}
