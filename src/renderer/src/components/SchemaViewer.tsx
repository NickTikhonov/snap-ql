import { useState, useEffect } from 'react'
import { SchemaCard } from './SchemaCard'
import { TableDetailView } from './TableDetailView'
import { motion, AnimatePresence } from 'framer-motion'

export interface TableSchema {
  tableName: string
  columns: ColumnInfo[]
}

export interface ColumnInfo {
  columnName: string
  dataType: string
  isNullable: boolean
  isPrimaryKey: boolean
  isUnique: boolean
  defaultValue: string | null
  maxLength: number | null
}

interface SchemaViewerProps {
  selectedConnection: string | null
}

export const SchemaViewer = ({ selectedConnection }: SchemaViewerProps) => {
  const [schema, setSchema] = useState<TableSchema[]>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadSchema = async () => {
      if (!selectedConnection) {
        setSchema([])
        return
      }

      setIsLoading(true)
      setError(null)
      try {
        const response = await window.context.getDatabaseSchema(selectedConnection)
        if (response.error) {
          setError(response.error)
          setSchema([])
        } else {
          setSchema(response.data)
        }
      } catch (err: any) {
        setError(err.message)
        setSchema([])
      } finally {
        setIsLoading(false)
      }
    }

    loadSchema()
  }, [selectedConnection])

  const handleTableClick = (tableName: string) => {
    console.log('SchemaViewer: Selecting table:', tableName)
    setSelectedTable(tableName)
  }

  const handleBackClick = () => {
    setSelectedTable(null)
  }

  if (!selectedConnection) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No Connection Selected</h2>
          <p className="text-muted-foreground">
            Please select a connection from the sidebar to browse the database schema.
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading schema...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div 
          className="text-center"
          initial={{ x: 0 }}
          animate={{ x: [-2, 2, -2, 2, 0] }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <h2 className="text-xl font-semibold mb-2 text-red-500">Error Loading Schema</h2>
          <p className="text-muted-foreground">{error}</p>
        </motion.div>
      </div>
    )
  }

  const selectedTableSchema = selectedTable
    ? schema.find((table) => table.tableName === selectedTable)
    : null

  if (selectedTable && selectedTableSchema) {
    console.log('SchemaViewer: Found table schema for:', selectedTable, selectedTableSchema)
  }

  return (
    <div className="h-full">
      <AnimatePresence mode="wait">
        {selectedTable && selectedTableSchema ? (
          <TableDetailView
            table={selectedTableSchema}
            onBack={handleBackClick}
            selectedConnection={selectedConnection!}
          />
        ) : (
          <motion.div
            key="schema-overview"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.067, ease: [0.4, 0, 0.2, 1] }}
            className="p-6"
          >
            {schema.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No tables found in this database.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schema.map((table, index) => (
                  <motion.div
                    key={table.tableName}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: Math.min(index * 0.02, 0.3),
                      duration: 0.067,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                  >
                    <SchemaCard table={table} onClick={() => handleTableClick(table.tableName)} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
