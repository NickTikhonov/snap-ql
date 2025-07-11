import {
  Database,
  Settings as SettingsIcon,
  History,
  Clock,
  Zap,
  Star,
  Plus,
  Pencil
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ConnectionDialog } from './ConnectionDialog'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface QueryHistory {
  id: string
  query: string
  results: any[]
  timestamp: Date
}

interface SidebarProps {
  currentView: 'editor' | 'settings'
  onViewChange: (view: 'editor' | 'settings') => void
  queryHistory: QueryHistory[]
  favorites: QueryHistory[]
  onItemSelect: (item: QueryHistory) => void
  onAddToFavorites: (historyItem: QueryHistory) => void
  onRemoveFromFavorites: (favoriteId: string) => void
  selectedConnection: string | null
  onConnectionSelect: (connectionName: string | null) => void
  onNewQuery: () => void
}

export const Sidebar = ({
  currentView,
  onViewChange,
  queryHistory,
  favorites,
  onItemSelect,
  onAddToFavorites,
  onRemoveFromFavorites,
  selectedConnection,
  onConnectionSelect,
  onNewQuery
}: SidebarProps) => {
  const [connections, setConnections] = useState<string[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingConnection, setEditingConnection] = useState<string | null>(null)
  const [contentKey, setContentKey] = useState(0)

  useEffect(() => {
    loadConnections()
  }, [])

  useEffect(() => {
    setContentKey((prev) => prev + 1)
  }, [selectedConnection])

  const loadConnections = async () => {
    try {
      const connectionList = await window.context.listConnections()
      setConnections(connectionList)
    } catch (error) {
      console.error('Failed to load connections:', error)
    }
  }

  const handleConnectionClick = (connectionName: string) => {
    if (selectedConnection === connectionName) {
      // Clicking the already selected connection acts as "new query"
      onNewQuery()
    } else {
      onConnectionSelect(connectionName)
    }
  }

  const handleConnectionSaved = () => {
    loadConnections()
    setShowAddDialog(false)
    setEditingConnection(null)
  }
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const truncateQuery = (query: string, maxLength: number = 40) => {
    return query.length > maxLength ? query.substring(0, maxLength) + '...' : query
  }

  return (
    <div className="w-56 bg-card border-r border-border flex flex-col h-screen">
      <div className="p-3 border-b border-border flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-primary" />
          <h1 className="text-sm font-semibold">SnapQL</h1>
          <p className="text-xs text-muted-foreground">beta 0.01</p>
        </div>
      </div>

      {/* Connections Section */}
      <div className="flex-shrink-0">
        <div className="p-2 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Connections</span>
            </div>
            <button
              onClick={() => setShowAddDialog(true)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <ul className="p-2 space-y-0.5 border-b border-border">
          {connections.map((connectionName) => (
            <li key={connectionName}>
              <motion.button
                onClick={() => handleConnectionClick(connectionName)}
                className={cn(
                  'w-full flex items-center space-x-2 px-2 py-1.5 rounded-md text-xs font-medium group relative',
                  selectedConnection === connectionName ? 'text-foreground' : 'text-foreground'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.05 }}
              >
                {selectedConnection === connectionName && (
                  <motion.div
                    className="absolute inset-0 bg-muted rounded-md"
                    layoutId="connection-highlight"
                    transition={{ type: 'spring', stiffness: 900, damping: 40 }}
                  />
                )}
                <div className="relative z-10 flex items-center space-x-2 w-full">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"
                    animate={{
                      scale: selectedConnection === connectionName 
                        ? [1, 1.4, 1] 
                        : [1, 1.2, 1],
                      opacity: selectedConnection === connectionName ? 1 : 0.7
                    }}
                    transition={{ 
                      duration: selectedConnection === connectionName ? 3.5 : 0.07,
                      repeat: selectedConnection === connectionName ? Infinity : 0,
                      ease: "easeInOut"
                    }}
                  />
                  <span className="truncate">{connectionName}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingConnection(connectionName)
                    }}
                    className="absolute right-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                </div>
              </motion.button>
            </li>
          ))}

          {connections.length === 0 && (
            <>
              <li className="text-center py-2">
                <p className="text-xs text-muted-foreground">No connections</p>
              </li>
              {/* Add Database button - only show when no connections */}
              <li className="pt-1">
                <button
                  onClick={() => setShowAddDialog(true)}
                  className="w-full flex items-center justify-center space-x-2 px-2 py-2 rounded-md text-xs font-medium transition-colors border border-dashed border-muted-foreground/50 text-muted-foreground hover:text-foreground hover:border-foreground"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Database</span>
                </button>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Combined Favorites and History Section - Single Scroll View */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${contentKey}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.08, ease: 'easeOut' }}
          >
            {/* Favorites Section */}
            {favorites.length > 0 && (
              <div>
                <div className="sticky top-0 bg-card p-2 border-b border-border z-10">
                  <div className="flex items-center space-x-2">
                    <Star className="w-3.5 h-3.5 text-yellow-500" />
                    <span className="text-xs font-medium text-muted-foreground">Favorites</span>
                  </div>
                </div>
                <motion.div 
                  className="p-2 border-b border-border"
                  animate={{ scale: favorites.length > 0 ? 1 : 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <motion.div
                    className="space-y-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.1, delay: 0.03 }}
                  >
                    {favorites.map((item, index) => (
                      <motion.button
                        key={item.id}
                        onClick={() => onItemSelect(item)}
                        className="w-full text-left p-2 rounded-md hover:bg-muted/50 transition-colors group relative"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.07, delay: 0.05 + index * 0.02 }}
                      >
                        <div className="space-y-1">
                          <p className="text-xs font-mono text-foreground line-clamp-2 leading-3">
                            {truncateQuery(item.query)}
                          </p>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">
                              {formatTimestamp(item.timestamp)}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              • {item.results.length} rows
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onRemoveFromFavorites(item.id)
                          }}
                          className="absolute top-1 right-1 opacity-100 text-yellow-500 hover:text-yellow-600 transition-colors"
                        >
                          <Star className="w-3 h-3 fill-current" />
                        </button>
                      </motion.button>
                    ))}
                  </motion.div>
                </motion.div>
              </div>
            )}

            {/* History Section */}
            <div className="sticky top-0 bg-card p-2 border-b border-border z-10">
              <div className="flex items-center space-x-2">
                <History className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Query History</span>
              </div>
            </div>

            <motion.div 
              className="p-2"
              animate={{ scale: queryHistory.length > 0 ? 1 : 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {queryHistory.length === 0 ? (
                <motion.div
                  className="text-center py-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.1, delay: 0.07 }}
                >
                  <p className="text-xs text-muted-foreground">No queries yet</p>
                </motion.div>
              ) : (
                <motion.div
                  className="space-y-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.1, delay: 0.05 }}
                >
                  {queryHistory.map((item, index) => {
                    const isFavorite = favorites.some((fav) => fav.id === item.id)
                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => onItemSelect(item)}
                        className="w-full text-left p-2 rounded-md hover:bg-muted/50 transition-colors group relative"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.07, delay: 0.07 + index * 0.01 }}
                      >
                        <div className="space-y-1">
                          <p className="text-xs font-mono text-foreground line-clamp-2 leading-3">
                            {truncateQuery(item.query)}
                          </p>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">
                              {formatTimestamp(item.timestamp)}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              • {item.results.length} rows
                            </span>
                          </div>
                        </div>
                        {!isFavorite && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onAddToFavorites(item)
                            }}
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-yellow-500 transition-all"
                          >
                            <Star className="w-3 h-3" />
                          </button>
                        )}
                      </motion.button>
                    )
                  })}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Settings button - sticky at bottom */}
      <div className="p-2 border-t border-border flex-shrink-0">
        <button
          onClick={() => onViewChange('settings')}
          className={cn(
            'w-full flex items-center space-x-2 px-2 py-1.5 rounded-md text-xs font-medium transition-colors',
            currentView === 'settings'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>Settings</span>
        </button>
      </div>

      {/* Connection Dialogs */}
      <ConnectionDialog
        isOpen={showAddDialog}
        onOpenChange={setShowAddDialog}
        onConnectionSaved={handleConnectionSaved}
      />

      {editingConnection && (
        <ConnectionDialog
          isOpen={!!editingConnection}
          onOpenChange={(open) => !open && setEditingConnection(null)}
          connectionName={editingConnection}
          onConnectionSaved={handleConnectionSaved}
        />
      )}
    </div>
  )
}
