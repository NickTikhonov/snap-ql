import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Database } from 'lucide-react'
import { TableSchema } from './SchemaViewer'
import { motion } from 'framer-motion'

interface SchemaCardProps {
  table: TableSchema
  onClick: () => void
}

export const SchemaCard = ({ table, onClick }: SchemaCardProps) => {
  const formatColumnType = (column: any) => {
    let type = column.dataType
    if (column.maxLength) {
      type += `(${column.maxLength})`
    }
    return type
  }

  const getColumnConstraints = (column: any) => {
    const constraints: string[] = []
    if (column.isPrimaryKey) constraints.push('PK')
    if (column.isUnique && !column.isPrimaryKey) constraints.push('UNIQUE')
    if (!column.isNullable) constraints.push('NOT NULL')
    return constraints.join(', ')
  }

  // Show first 4 columns, then "..." if there are more
  const displayColumns = table.columns.slice(0, 4)
  const hasMore = table.columns.length > 4

  return (
    <motion.div
      whileHover={{ 
        y: -2, 
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card
        className="cursor-pointer transition-shadow duration-200"
        onClick={onClick}
      >
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Database className="w-4 h-4" />
          {table.tableName}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {displayColumns.map((column) => (
            <div key={column.columnName} className="text-xs border-l-2 border-muted pl-2">
              <div className="font-medium text-foreground">{column.columnName}</div>
              <div className="text-muted-foreground">
                {formatColumnType(column)}
                {getColumnConstraints(column) && (
                  <span className="ml-1 text-primary">{getColumnConstraints(column)}</span>
                )}
              </div>
            </div>
          ))}
          {hasMore && (
            <div className="text-xs text-muted-foreground italic pl-2">
              ... and {table.columns.length - 4} more columns
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    </motion.div>
  )
}
