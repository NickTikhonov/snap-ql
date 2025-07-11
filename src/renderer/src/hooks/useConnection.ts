import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from './use-toast'

interface GraphMetadata {
  graphXColumn: string
  graphYColumns: string[]
}

interface QueryHistory {
  id: string
  query: string
  results: any[]
  graph?: GraphMetadata
  timestamp: Date
}

interface UseConnectionReturn {
  history: QueryHistory[]
  favorites: QueryHistory[]
  isLoading: boolean
  error: string | null
  addToHistory: (query: string, results: any[], graphMetadata?: GraphMetadata) => Promise<string>
  updateHistory: (id: string, updates: Partial<QueryHistory>) => Promise<void>
  addToFavorites: (historyItem: QueryHistory) => Promise<void>
  removeFromFavorites: (id: string) => Promise<void>
  updateFavorite: (id: string, updates: Partial<QueryHistory>) => Promise<void>
  refresh: () => Promise<void>
}

// Cache for connection data
const connectionCache = new Map<
  string,
  {
    history: QueryHistory[]
    favorites: QueryHistory[]
    lastFetch: number
  }
>()

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export function useConnection(connectionName: string | null): UseConnectionReturn {
  const [history, setHistory] = useState<QueryHistory[]>([])
  const [favorites, setFavorites] = useState<QueryHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Track the current connection to detect changes
  const currentConnectionRef = useRef(connectionName)

  const loadConnectionData = useCallback(
    async (forceRefresh = false) => {
      if (!connectionName) {
        setHistory([])
        setFavorites([])
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Check cache first
        const cached = connectionCache.get(connectionName)
        const now = Date.now()

        if (!forceRefresh && cached && now - cached.lastFetch < CACHE_TTL) {
          setHistory(cached.history)
          setFavorites(cached.favorites)
          setIsLoading(false)
          return
        }

        // Fetch from disk
        const [historyData, favoritesData] = await Promise.all([
          window.context.getConnectionHistory(connectionName),
          window.context.getConnectionFavorites(connectionName)
        ])

        // Convert timestamp strings to Date objects
        const historyWithDates = historyData.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }))

        const favoritesWithDates = favoritesData.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }))

        // Update cache
        connectionCache.set(connectionName, {
          history: historyWithDates,
          favorites: favoritesWithDates,
          lastFetch: now
        })

        setHistory(historyWithDates)
        setFavorites(favoritesWithDates)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load connection data')
        console.error('Failed to load connection data:', err)
      } finally {
        setIsLoading(false)
      }
    },
    [connectionName]
  )

  // Load data when connection changes
  useEffect(() => {
    if (currentConnectionRef.current !== connectionName) {
      currentConnectionRef.current = connectionName
      loadConnectionData()
    }
  }, [connectionName, loadConnectionData])

  const addToHistory = useCallback(
    async (query: string, results: any[], graphMetadata?: GraphMetadata): Promise<string> => {
      if (!connectionName) return ''

      const historyEntry: QueryHistory = {
        id: Date.now().toString(),
        query,
        results,
        graph: graphMetadata,
        timestamp: new Date()
      }

      try {
        // Optimistically update UI
        setHistory((prev) => [historyEntry, ...prev.slice(0, 19)])

        // Update cache
        const cached = connectionCache.get(connectionName)
        if (cached) {
          cached.history = [historyEntry, ...cached.history.slice(0, 19)]
          cached.lastFetch = Date.now()
        }

        // Persist to disk
        const historyForStorage = {
          ...historyEntry,
          timestamp: historyEntry.timestamp.toISOString()
        }

        await window.context.addQueryToConnectionHistory(connectionName, historyForStorage)

        return historyEntry.id
      } catch (err) {
        console.error('Failed to add to history:', err)
        toast({
          title: 'Error',
          description: 'Failed to save query to history',
          variant: 'destructive'
        })

        // Rollback on error
        await loadConnectionData(true)
        return ''
      }
    },
    [connectionName, toast, loadConnectionData]
  )

  const updateHistory = useCallback(
    async (id: string, updates: Partial<QueryHistory>) => {
      if (!connectionName) return

      try {
        // Optimistically update UI
        setHistory((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)))

        // Update cache
        const cached = connectionCache.get(connectionName)
        if (cached) {
          cached.history = cached.history.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          )
        }

        // Persist to disk
        const updatesForStorage = {
          ...updates,
          timestamp: updates.timestamp?.toISOString()
        }

        await window.context.updateConnectionHistory(connectionName, id, updatesForStorage)
      } catch (err) {
        console.error('Failed to update history:', err)
        toast({
          title: 'Error',
          description: 'Failed to update history item',
          variant: 'destructive'
        })

        // Rollback on error
        await loadConnectionData(true)
      }
    },
    [connectionName, toast, loadConnectionData]
  )

  const addToFavorites = useCallback(
    async (historyItem: QueryHistory) => {
      if (!connectionName) return

      try {
        // Check if already in favorites
        if (favorites.some((fav) => fav.id === historyItem.id)) {
          toast({
            title: 'Already in favorites',
            description: 'This query is already in your favorites'
          })
          return
        }

        // Optimistically update UI
        setFavorites((prev) => [historyItem, ...prev])

        // Update cache
        const cached = connectionCache.get(connectionName)
        if (cached) {
          cached.favorites = [historyItem, ...cached.favorites]
        }

        // Persist to disk
        const favoriteForStorage = {
          ...historyItem,
          timestamp: historyItem.timestamp.toISOString()
        }

        await window.context.addConnectionFavorite(connectionName, favoriteForStorage)

        toast({
          title: 'Added to favorites',
          description: 'Query saved to your favorites'
        })
      } catch (err) {
        console.error('Failed to add to favorites:', err)
        toast({
          title: 'Error',
          description: 'Failed to add to favorites',
          variant: 'destructive'
        })

        // Rollback on error
        await loadConnectionData(true)
      }
    },
    [connectionName, favorites, toast, loadConnectionData]
  )

  const removeFromFavorites = useCallback(
    async (id: string) => {
      if (!connectionName) return

      try {
        // Optimistically update UI
        setFavorites((prev) => prev.filter((fav) => fav.id !== id))

        // Update cache
        const cached = connectionCache.get(connectionName)
        if (cached) {
          cached.favorites = cached.favorites.filter((fav) => fav.id !== id)
        }

        // Persist to disk
        await window.context.removeConnectionFavorite(connectionName, id)

        toast({
          title: 'Removed from favorites',
          description: 'Query removed from your favorites'
        })
      } catch (err) {
        console.error('Failed to remove from favorites:', err)
        toast({
          title: 'Error',
          description: 'Failed to remove from favorites',
          variant: 'destructive'
        })

        // Rollback on error
        await loadConnectionData(true)
      }
    },
    [connectionName, toast, loadConnectionData]
  )

  const updateFavorite = useCallback(
    async (id: string, updates: Partial<QueryHistory>) => {
      if (!connectionName) return

      try {
        // Optimistically update UI
        setFavorites((prev) =>
          prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
        )

        // Update cache
        const cached = connectionCache.get(connectionName)
        if (cached) {
          cached.favorites = cached.favorites.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          )
        }

        // Persist to disk
        const updatesForStorage = {
          ...updates,
          timestamp: updates.timestamp?.toISOString()
        }

        await window.context.updateConnectionFavorite(connectionName, id, updatesForStorage)
      } catch (err) {
        console.error('Failed to update favorite:', err)
        toast({
          title: 'Error',
          description: 'Failed to update favorite',
          variant: 'destructive'
        })

        // Rollback on error
        await loadConnectionData(true)
      }
    },
    [connectionName, toast, loadConnectionData]
  )

  const refresh = useCallback(async () => {
    await loadConnectionData(true)
  }, [loadConnectionData])

  return {
    history,
    favorites,
    isLoading,
    error,
    addToHistory,
    updateHistory,
    addToFavorites,
    removeFromFavorites,
    updateFavorite,
    refresh
  }
}
