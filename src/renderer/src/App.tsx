import { useState } from 'react'
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs'
import { BarChart3, Table, Code, Layout } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { SchemaViewer } from './components/SchemaViewer'
import { useConnections } from './hooks/useConnections'
import { useConnection } from './hooks/useConnection'

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
  const [mainTab, setMainTab] = useState<'editor' | 'schema'>('editor')
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM information_schema.tables;')
  const [graphMetadata, setGraphMetadata] = useState<GraphMetadata | null>(null)
  const [queryResults, setQueryResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentItemId, setCurrentItemId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<'visualize' | 'results'>('results')

  const { toast } = useToast()

  // Use the new connection hooks
  const { selectedConnection, selectConnection } = useConnections()
  const {
    history: queryHistory,
    favorites,
    addToHistory,
    updateHistory,
    addToFavorites,
    removeFromFavorites,
    updateFavorite
  } = useConnection(selectedConnection)

  const graphableData = queryResults.slice(0, 10000) // limit to 10k rows for performance

  const runQuery = async (query: string, metadata?: GraphMetadata | null) => {
    if (!selectedConnection) {
      setError('No connection selected')
      return
    }

    
    setIsLoading(true)
    try {
      const res = await window.context.runQueryForConnection(selectedConnection, query)
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

        // Use passed metadata or fall back to state
        const effectiveMetadata = metadata !== undefined ? metadata : graphMetadata

        // Switch to visualize tab if graph metadata exists
        if (effectiveMetadata) {
          setActiveTab('visualize')
        }

        // Check if the currently selected item is a favorite
        const currentFavorite = currentItemId
          ? favorites.find((fav) => fav.id === currentItemId)
          : null

        if (currentFavorite) {
          // Update the favorite with new results and timestamp
          await updateFavorite(currentFavorite.id, {
            results: res.data,
            query: query,
            timestamp: new Date(),
            graph: effectiveMetadata ?? undefined
          })
        } else {
          // Add to history and set current item ID
          const newHistoryId = await addToHistory(query, res.data, effectiveMetadata ?? undefined)
          setCurrentItemId(newHistoryId)
        }
      }
    } catch (error: any) {
      console.error('Query execution failed:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAIQuery = async (userQuery: string, autoRun: boolean) => {
    if (!selectedConnection) {
      setError('No connection selected')
      return
    }

    setIsGenerating(true)
    setGraphMetadata(null)
    toast({
      title: 'Generating query...',
      description: 'The query is being generated...',
      duration: 1500
    })
    try {
      const res = await window.context.generateQueryForConnection(
        selectedConnection,
        userQuery,
        sqlQuery ?? ''
      )
      if (res.error) {
        setError(res.error)
      } else {
        setSqlQuery(res.data.query)
        let newMetadata: GraphMetadata | null = null
        if (res.data.graphXColumn && res.data.graphYColumns && res.data.graphYColumns.length > 0) {
          newMetadata = {
            graphXColumn: res.data.graphXColumn,
            graphYColumns: res.data.graphYColumns
          }
          setGraphMetadata(newMetadata)
        }

        if (autoRun) {
          // Automatically run the query when auto-run is enabled
          // Pass the metadata directly to avoid race condition
          await runQuery(res.data.query, newMetadata)
        } else {
          // Show success toast with option to run manually
          toast({
            title: 'Query generated!',
            description: 'The query was generated successfully',
            duration: 1500,
            action: <Button onClick={() => runQuery(res.data.query)}>Run!</Button>
          })
        }
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
    // Set active tab based on whether the item has a graph
    setActiveTab(item.graph ? 'visualize' : 'results')
  }

  const handleGraphMetadataChange = async (newMetadata: GraphMetadata) => {
    setGraphMetadata(newMetadata)

    // Switch to visualize tab when graph is created
    setActiveTab('visualize')

    // Update the current item if one is selected
    if (currentItemId) {
      // Check if it's a favorite first
      const isFavorite = favorites.some((fav) => fav.id === currentItemId)

      if (isFavorite) {
        await updateFavorite(currentItemId, { graph: newMetadata })
      } else {
        await updateHistory(currentItemId, { graph: newMetadata })
      }
    }
  }

  const handleAddToFavorites = async (historyItem: QueryHistory) => {
    await addToFavorites(historyItem)
  }

  const handleRemoveFromFavorites = async (favoriteId: string) => {
    await removeFromFavorites(favoriteId)
  }

  const handleConnectionSelect = (connectionName: string | null) => {
    selectConnection(connectionName)
    setCurrentView('editor') // Switch to editor view when selecting a connection

    // Clear the editor state when switching connections
    setSqlQuery('SELECT * FROM information_schema.tables;')
    setQueryResults([])
    setGraphMetadata(null)
    setCurrentItemId(null)
    setError(null)
  }

  const handleNewQuery = () => {
    setSqlQuery('SELECT * FROM information_schema.tables;')
    setQueryResults([])
    setGraphMetadata(null)
    setCurrentItemId(null)
    setError(null)
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
      <div className="h-screen bg-background flex overflow-hidden">
        <div className="flex-shrink-0">
          <Sidebar
            currentView={currentView}
            onViewChange={setCurrentView}
            queryHistory={queryHistory}
            favorites={favorites}
            onItemSelect={handleItemSelect}
            onAddToFavorites={handleAddToFavorites}
            onRemoveFromFavorites={handleRemoveFromFavorites}
            selectedConnection={selectedConnection}
            onConnectionSelect={handleConnectionSelect}
            onNewQuery={handleNewQuery}
          />
        </div>

        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {currentView === 'editor' ? (
            <>
              {/* Main Tabs */}
              {selectedConnection && (
                <div className="border-b bg-background p-3 flex-shrink-0">
                  <div className="flex space-x-1 max-w-md">
                    <button
                      onClick={() => setMainTab('editor')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        mainTab === 'editor'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <Code className="w-4 h-4" />
                      Query Editor
                    </button>
                    <button
                      onClick={() => setMainTab('schema')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        mainTab === 'schema'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <Layout className="w-4 h-4" />
                      Schema Browser
                    </button>
                  </div>
                </div>
              )}

              {/* Main Content - Scrollable */}
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                {selectedConnection ? (
                  mainTab === 'schema' ? (
                    <SchemaViewer selectedConnection={selectedConnection} />
                  ) : (
                    <div className="p-3">
                      <div className="space-y-3">
                        {/* AI Chat - Only in SQL query editor */}
                        <div className="border-b bg-card p-3 -mx-3 -mt-3 mb-3">
                          <AIChat onUserQuery={handleAIQuery} isGenerating={isGenerating} />
                        </div>

                        <div>
                          <SQLEditor
                            value={sqlQuery}
                            onChange={setSqlQuery}
                            onRun={() => runQuery(sqlQuery)}
                            isLoading={isLoading}
                          />
                        </div>
                        {error && (
                          <motion.div 
                            className="text-red-500"
                            initial={{ x: 0 }}
                            animate={{ x: [-2, 2, -2, 2, 0] }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                          >
                            {error}
                          </motion.div>
                        )}

                        {/* Tabs for Graph and Results */}
                        {queryResults.length > 0 && (
                          <Tabs
                            value={graphMetadata ? activeTab : 'results'}
                            onValueChange={(value) =>
                              setActiveTab(value as 'visualize' | 'results')
                            }
                            className="w-full"
                          >
                            <motion.div
                              key={`tabs-${currentItemId}-${selectedConnection}`}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 0.05,
                                ease: [0.4, 0, 0.2, 1]
                              }}
                            >
                              <TabsList className="grid grid-cols-2 w-fit">
                                {graphMetadata && (
                                  <TabsTrigger
                                    value="visualize"
                                    className="flex items-center gap-2"
                                  >
                                    <BarChart3 className="w-4 h-4" />
                                    Visualize
                                  </TabsTrigger>
                                )}
                                <TabsTrigger
                                  value="results"
                                  className={graphMetadata ? '' : 'col-span-2'}
                                >
                                  <Table className="w-4 h-4 mr-2" />
                                  Results
                                </TabsTrigger>
                              </TabsList>
                            </motion.div>

                            <AnimatePresence mode="wait">
                              <TabsContent
                                value="visualize"
                                key={`visualize-${currentItemId}-${selectedConnection}`}
                              >
                                {graphMetadata ? (
                                  <motion.div
                                    initial={{ opacity: 0, y: 15, scale: 0.975 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -15, scale: 0.975 }}
                                    transition={{
                                      duration: 0.067,
                                      ease: [0.4, 0, 0.2, 1]
                                    }}
                                  >
                                    <Graph
                                      data={graphableData}
                                      graphMetadata={graphMetadata}
                                      onMetadataChange={handleGraphMetadataChange}
                                    />
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    initial={{ opacity: 0, y: 15, scale: 0.975 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -15, scale: 0.975 }}
                                    transition={{
                                      duration: 0.067,
                                      ease: [0.4, 0, 0.2, 1]
                                    }}
                                  >
                                    <ResultsTable
                                      results={queryResults}
                                      isLoading={isLoading}
                                      query={sqlQuery}
                                      graphMetadata={graphMetadata}
                                      onCreateGraph={handleGraphMetadataChange}
                                    />
                                  </motion.div>
                                )}
                              </TabsContent>

                              <TabsContent
                                value="results"
                                key={`results-${currentItemId}-${selectedConnection}`}
                              >
                                <motion.div
                                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: -30, scale: 0.95 }}
                                  transition={{
                                    duration: 0.067,
                                    ease: [0.4, 0, 0.2, 1]
                                  }}
                                >
                                  <ResultsTable
                                    results={queryResults}
                                    isLoading={isLoading}
                                    query={sqlQuery}
                                    graphMetadata={graphMetadata}
                                    onCreateGraph={handleGraphMetadataChange}
                                  />
                                </motion.div>
                              </TabsContent>
                            </AnimatePresence>
                          </Tabs>
                        )}

                        {/* Show Results Table without tabs when no results */}
                        {queryResults.length === 0 && (
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={`empty-${currentItemId || 'new'}-${selectedConnection}`}
                              initial={{ opacity: 0, y: 15, scale: 0.975 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -15, scale: 0.975 }}
                              transition={{
                                duration: 0.067,
                                ease: [0.4, 0, 0.2, 1]
                              }}
                            >
                              <ResultsTable
                                results={queryResults}
                                isLoading={isLoading}
                                query={sqlQuery}
                                graphMetadata={graphMetadata}
                                onCreateGraph={handleGraphMetadataChange}
                              />
                            </motion.div>
                          </AnimatePresence>
                        )}
                      </div>
                    </div>
                  )
                ) : (
                  <div className="flex items-center justify-center h-full p-3">
                    <div className="text-center">
                      <h2 className="text-xl font-semibold mb-2">No Connection Selected</h2>
                      <p className="text-muted-foreground">
                        Please select a connection from the sidebar to start querying your database.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Settings view - no AI Chat */
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <div className="p-3">
                <Settings />
              </div>
            </div>
          )}
        </div>

        <Toaster />
      </div>
    </ThemeProvider>
  )
}

export default Index
