import { useState, useEffect } from 'react'
import { Sidebar } from './components/Sidebar'
import { SQLEditor } from './components/SQLEditor'
import { ResultsTable } from './components/ResultsTable'
import { AIChat } from './components/AIChat'
import { Settings } from './components/Settings'
import { Toaster } from './components/ui/toaster'
import { useToast } from './hooks/use-toast'
import { Button } from './components/ui/button'
import { ThemeProvider } from './components/ui/theme-provider'
import { Graph } from './components/Graph'

interface QueryHistory {
  id: string
  query: string
  results: any[]
  graph?: GraphMetadata // past: graphMetadata
  timestamp: Date
}

type GraphMetadata = {
  graphXColumn: string
  graphYColumns: string[]
}

const Index = () => {
  const [currentView, setCurrentView] = useState<'editor' | 'settings'>('editor')
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM information_schema.tables;')
  const [graphMetadata, setGraphMetadata] = useState<GraphMetadata | null>(null)
  const [queryResults, setQueryResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([])
  const [favorites, setFavorites] = useState<QueryHistory[]>([])
  const [currentItemId, setCurrentItemId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const { toast } = useToast()

  const graphableData = queryResults.slice(0, 10000) // limit to 10k rows for performance

  // Load query history and favorites on startup
  useEffect(() => {
    const loadData = async () => {
      try {
        const [history, favoritesData] = await Promise.all([
          window.context.getQueryHistory(),
          window.context.getFavorites()
        ])

        // Convert timestamp strings back to Date objects
        const historyWithDates = history.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }))
        setQueryHistory(historyWithDates)

        const favoritesWithDates = favoritesData.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }))
        setFavorites(favoritesWithDates)
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }
    loadData()
  }, [])

  const runQuery = async (query: string) => {
    setIsLoading(true)
    try {
      const res = await window.context.runQuery(query)
      if (res.error) {
        setError(res.error)
        setQueryResults([])
      } else {
        setQueryResults(res.data)
        setError(null)
        toast({
          title: 'Query executed successfully',
          description: 'You can ask the AI to fine tune the query',
          duration: 1500
        })

        // Check if the currently selected item is a favorite
        const currentFavorite = currentItemId
          ? favorites.find((fav) => fav.id === currentItemId)
          : null

        if (currentFavorite) {
          // Update the favorite with new results and timestamp
          const updatedFavorite = {
            ...currentFavorite,
            results: res.data,
            query: query,
            timestamp: new Date(),
            graph: graphMetadata ?? undefined
          }

          // Update local favorites state
          setFavorites((prev) =>
            prev.map((fav) => (fav.id === currentFavorite.id ? updatedFavorite : fav))
          )

          // Persist favorite update to storage
          try {
            const favoriteEntryForStorage = {
              ...updatedFavorite,
              timestamp: updatedFavorite.timestamp.toISOString()
            }
            await window.context.updateFavorite(currentFavorite.id, favoriteEntryForStorage)
          } catch (error) {
            console.error('Failed to update favorite:', error)
          }
        }

        // Always add to history (whether it's a favorite or not)
        const historyEntry: QueryHistory = {
          id: Date.now().toString(),
          query: query,
          results: res.data,
          graph: graphMetadata ?? undefined,
          timestamp: new Date()
        }

        // Update local state
        setQueryHistory((prev) => [historyEntry, ...prev.slice(0, 19)]) // Keep last 20 queries

        // If we updated a favorite, keep the favorite ID as current, otherwise use the new history entry ID
        if (!currentFavorite) {
          setCurrentItemId(historyEntry.id)
        }

        // Persist to storage
        try {
          const historyEntryForStorage = {
            ...historyEntry,
            timestamp: historyEntry.timestamp.toISOString() // Convert Date to string for storage
          }
          await window.context.addQueryToHistory(historyEntryForStorage)
        } catch (error) {
          console.error('Failed to save query to history:', error)
        }
      }
    } catch (error: any) {
      console.error('Query execution failed:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAIQuery = async (userQuery: string) => {
    setIsGenerating(true)
    setGraphMetadata(null)
    toast({
      title: 'Generating query...',
      description: 'The query is being generated...',
      duration: 1500
    })
    try {
      const res = await window.context.generateQuery(userQuery, sqlQuery ?? '')
      if (res.error) {
        setError(res.error)
      } else {
        setSqlQuery(res.data.query)
        if (res.data.graphXColumn && res.data.graphYColumns && res.data.graphYColumns.length > 0) {
          setGraphMetadata({
            graphXColumn: res.data.graphXColumn,
            graphYColumns: res.data.graphYColumns
          })
        }
        toast({
          title: 'Query generated!',
          description: 'The query was generated successfully',
          duration: 1500,
          action: <Button onClick={() => runQuery(res.data.query)}>Run!</Button>
        })
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleItemSelect = (item: QueryHistory) => {
    setSqlQuery(item.query)
    setQueryResults(item.results)
    setGraphMetadata(item.graph ?? null)
    setCurrentItemId(item.id)
  }

  const handleGraphMetadataChange = async (newMetadata: GraphMetadata) => {
    setGraphMetadata(newMetadata)

    // Update the current item if one is selected
    if (currentItemId) {
      // Check if it's a favorite first
      const isFavorite = favorites.some((fav) => fav.id === currentItemId)

      if (isFavorite) {
        await handleFavoriteMetadataChange(currentItemId, newMetadata)
      } else {
        // Update local history state
        setQueryHistory((prev) =>
          prev.map((item) => (item.id === currentItemId ? { ...item, graph: newMetadata } : item))
        )

        // Persist to storage
        try {
          await window.context.updateQueryHistory(currentItemId, { graph: newMetadata })
        } catch (error) {
          console.error('Failed to update query history:', error)
        }
      }
    }
  }

  const handleRemoveGraph = async () => {
    setGraphMetadata(null)

    // Update the current history item if one is selected
    if (currentItemId) {
      // Update local state
      setQueryHistory((prev) =>
        prev.map((item) => (item.id === currentItemId ? { ...item, graph: undefined } : item))
      )

      // Persist to storage
      try {
        await window.context.updateQueryHistory(currentItemId, { graph: undefined })
      } catch (error) {
        console.error('Failed to update query history:', error)
      }
    }
  }

  const handleAddToFavorites = async (historyItem: QueryHistory) => {
    try {
      const favoriteEntry = {
        ...historyItem,
        timestamp: historyItem.timestamp.toISOString()
      }
      await window.context.addFavorite(favoriteEntry)

      // Update local favorites state
      setFavorites((prev) => [historyItem, ...prev])
    } catch (error) {
      console.error('Failed to add to favorites:', error)
    }
  }

  const handleRemoveFromFavorites = async (favoriteId: string) => {
    try {
      await window.context.removeFavorite(favoriteId)

      // Update local favorites state
      setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId))
    } catch (error) {
      console.error('Failed to remove from favorites:', error)
    }
  }

  const handleFavoriteMetadataChange = async (favoriteId: string, newMetadata: GraphMetadata) => {
    // Update current state if this is the active item
    if (currentItemId === favoriteId) {
      setGraphMetadata(newMetadata)
    }

    // Update local favorites state
    setFavorites((prev) =>
      prev.map((item) => (item.id === favoriteId ? { ...item, graph: newMetadata } : item))
    )

    // Persist to storage
    try {
      await window.context.updateFavorite(favoriteId, { graph: newMetadata })
    } catch (error) {
      console.error('Failed to update favorite:', error)
    }
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
      <div className="min-h-screen bg-background flex">
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          queryHistory={queryHistory}
          favorites={favorites}
          onItemSelect={handleItemSelect}
          onAddToFavorites={handleAddToFavorites}
          onRemoveFromFavorites={handleRemoveFromFavorites}
        />

        <div className="flex-1 flex flex-col min-w-0">
          {/* AI Chat Header */}
          <div className="border-b bg-card p-3 flex-shrink-0">
            <AIChat onUserQuery={handleAIQuery} isGenerating={isGenerating} />
          </div>

          {/* Main Content */}
          <div className="flex-1 p-3 min-h-0">
            {currentView === 'editor' ? (
              <div className="space-y-3 h-full flex flex-col">
                <div className="flex-shrink-0">
                  <SQLEditor
                    value={sqlQuery}
                    onChange={setSqlQuery}
                    onRun={() => runQuery(sqlQuery)}
                    isLoading={isLoading}
                  />
                </div>
                {error && <div className="text-red-500">{error}</div>}
                {graphMetadata && queryResults.length > 0 && (
                  <Graph
                    data={graphableData}
                    graphMetadata={graphMetadata}
                    onMetadataChange={handleGraphMetadataChange}
                    onRemove={handleRemoveGraph}
                  />
                )}
                <div className="flex-1 min-h-0 flex-grow">
                  <ResultsTable
                    results={queryResults}
                    isLoading={isLoading}
                    query={sqlQuery}
                    graphMetadata={graphMetadata}
                    onCreateGraph={handleGraphMetadataChange}
                  />
                </div>
              </div>
            ) : (
              <Settings />
            )}
          </div>
        </div>

        <Toaster />
      </div>
    </ThemeProvider>
  )
}

export default Index
