/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react'
import { Sidebar } from './components/Sidebar'
import { SQLEditor } from './components/SQLEditor'
import { ResultsTable } from './components/ResultsTable'
import { AIChat } from './components/AIChat'
import { Settings } from './components/Settings'
import { Toaster } from './components/ui/toaster'
import { useToast } from './hooks/use-toast'
import { Button } from './components/ui/button'
import { ThemeProvider, useTheme } from './components/ui/theme-provider'
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
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const { theme } = useTheme()

  const { toast } = useToast()

  const graphableData = queryResults.slice(0, 10000) // limit to 10k rows for performance

  // Load query history on startup
  useEffect(() => {
    const loadQueryHistory = async () => {
      try {
        const history = await window.context.getQueryHistory()
        // Convert timestamp strings back to Date objects
        const historyWithDates = history.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }))
        setQueryHistory(historyWithDates)
      } catch (error) {
        console.error('Failed to load query history:', error)
      }
    }
    loadQueryHistory()
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

        // Add to history
        const historyEntry: QueryHistory = {
          id: Date.now().toString(),
          query: query,
          results: res.data,
          graph: graphMetadata ?? undefined,
          timestamp: new Date()
        }

        // Update local state
        setQueryHistory((prev) => [historyEntry, ...prev.slice(0, 19)]) // Keep last 20 queries

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

  const handleHistorySelect = (historyItem: QueryHistory) => {
    setSqlQuery(historyItem.query)
    setQueryResults(historyItem.results)
    setGraphMetadata(historyItem.graph ?? null)
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
      <div className="min-h-screen bg-background flex">
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          queryHistory={queryHistory}
          onHistorySelect={handleHistorySelect}
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
                  <Graph data={graphableData} graphMetadata={graphMetadata} />
                )}
                <div className="flex-1 min-h-0 flex-grow">
                  <ResultsTable results={queryResults} isLoading={isLoading} query={sqlQuery} />
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
