import { useEffect, useState, useRef } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { TableSchema } from './SchemaViewer'
import { ResultsTable } from './ResultsTable'

interface TableDetailViewProps {
  table: TableSchema
  onBack: () => void
  selectedConnection: string
}

export const TableDetailView = ({ table, onBack, selectedConnection }: TableDetailViewProps) => {
  const [queryResults, setQueryResults] = useState<any[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  // Scroll to top when component mounts
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [table.tableName])

  useEffect(() => {
    const loadAndQuery = async () => {
      setQueryResults([])
      console.log('TableDetailView: Loading data for table:', table.tableName)
      const databaseType = await window.context.getConnectionDatabaseType(selectedConnection)
      console.log('TableDetailView: Database type:', databaseType)

      // Quote table name based on database type
      const quotedTableName = databaseType === 'postgres' ? `"${table.tableName}"` : table.tableName
      const query = `SELECT * FROM ${quotedTableName} LIMIT 20`

      const res = await window.context.runQueryForConnection(selectedConnection, query)
      console.log('TableDetailView: Query results:', res)
      setQueryResults(res.data)
    }

    loadAndQuery()
  }, [table.tableName, selectedConnection]) // Removed onRunQuery from dependencies

  const formatColumnType = (column: any) => {
    let type = column.dataType
    if (column.maxLength) {
      type += `(${column.maxLength})`
    }
    return type
  }

  const getColumnConstraints = (column: any) => {
    const constraints: string[] = []
    if (column.isPrimaryKey) constraints.push('PRIMARY KEY')
    if (column.isUnique && !column.isPrimaryKey) constraints.push('UNIQUE')
    if (!column.isNullable) constraints.push('NOT NULL')
    if (column.defaultValue) constraints.push(`DEFAULT ${column.defaultValue}`)
    return constraints.join(', ')
  }

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.067, ease: [0.4, 0, 0.2, 1] }}
      className="p-6 space-y-6"
    >
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h1 className="text-lg font-bold">{table.tableName}</h1>
      </div>

      {/* Schema Definition */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Schema Definition</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-medium text-[10px] h-6 px-2 w-[120px] min-w-[120px] max-w-[200px] border-r whitespace-nowrap">
                    Column
                  </TableHead>
                  <TableHead className="font-medium text-[10px] h-6 px-2 w-[120px] min-w-[120px] max-w-[150px] border-r whitespace-nowrap">
                    Type
                  </TableHead>
                  <TableHead className="font-medium text-[10px] h-6 px-2 border-r-0">
                    Constraints
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {table.columns.map((column, index) => (
                  <motion.tr
                    key={column.columnName}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: Math.min(index * 0.02, 0.2),
                      duration: 0.033,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                    className="hover:bg-muted/30 border-b"
                  >
                    <TableCell className="font-mono text-[10px] py-1 px-2 border-r w-[120px] min-w-[120px] max-w-[200px]">
                      <div className="truncate font-medium" title={column.columnName}>
                        {column.columnName}
                        {column.isPrimaryKey && (
                          <span className="ml-1 text-[8px] bg-primary text-primary-foreground px-1 py-0.5 rounded">
                            PK
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-[10px] py-1 px-2 border-r w-[120px] min-w-[120px] max-w-[150px] text-muted-foreground">
                      <div className="truncate" title={formatColumnType(column)}>
                        {formatColumnType(column)}
                      </div>
                    </TableCell>
                    <TableCell className="text-[10px] py-1 px-2 border-r-0 text-muted-foreground">
                      <div className="truncate" title={getColumnConstraints(column) || '—'}>
                        {getColumnConstraints(column) || '—'}
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Table Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data</CardTitle>
        </CardHeader>
        <CardContent>
          <ResultsTable
            results={queryResults}
            query={`SELECT * FROM ${table.tableName} LIMIT 20`}
            isLoading={false}
            graphMetadata={null}
            onCreateGraph={() => {}}
          />
        </CardContent>
      </Card>
    </motion.div>
  )
}
