/* eslint-disable @typescript-eslint/no-explicit-any */

import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../components/ui/table'
import { Skeleton } from '../components/ui/skeleton'
import { Badge } from '../components/ui/badge'
import { ScrollArea } from '../components/ui/scroll-area'
import { Button } from './ui/button'
import { Clipboard, Code, BarChart3 } from 'lucide-react'
import { useToast } from '@renderer/hooks/use-toast'
import { GraphEditDialog } from './GraphEditDialog'
import { GraphMetadata } from './Graph'

interface ResultsTableProps {
  results: any[]
  isLoading: boolean
  query: string
  graphMetadata?: GraphMetadata | null
  onCreateGraph?: (metadata: GraphMetadata) => void
}

export const ResultsTable = ({
  results,
  isLoading,
  graphMetadata,
  onCreateGraph
}: ResultsTableProps) => {
  const { toast } = useToast()

  const copyCSV = () => {
    const csv = [
      Object.keys(results[0]).join(','),
      ...results.map((row) => Object.values(row).join(','))
    ].join('\n')
    navigator.clipboard.writeText(csv)
    toast({ title: 'CSV copied to clipboard' })
  }

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(results, null, 2))
    toast({ title: 'JSON copied to clipboard' })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Query Results</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Query Results</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-xs">No results to display.</p>
            <p className="text-[10px] mt-1">Run a query to see the results here.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const columns = Object.keys(results[0])

  return (
    <Card className="flex flex-grow flex-col min-h-0">
      <CardHeader className="flex flex-row items-center justify-between pb-2 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <CardTitle className="text-sm">Query Results</CardTitle>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
            {results.length} rows
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          {!graphMetadata && onCreateGraph && (
            <GraphEditDialog
              data={results}
              currentMetadata={null}
              onSave={onCreateGraph}
              triggerText=""
              renderTrigger={(onClick) => (
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-[10px] cursor-pointer"
                  onClick={onClick}
                >
                  <BarChart3 className="size-2" />
                  Graph
                </Button>
              )}
            />
          )}
          <Button
            variant="secondary"
            size="sm"
            className="text-[10px] cursor-pointer"
            onClick={copyCSV}
          >
            <Clipboard className="size-2" />
            CSV
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="text-[10px] cursor-pointer"
            onClick={copyJSON}
          >
            <Code className="size-2" />
            JSON
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1 min-h-0">
        <div className="rounded-md border h-full">
          <div className="overflow-x-auto overflow-y-auto max-h-[600px] select-text">
            <Table className="min-w-full">
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  {columns.map((column) => (
                    <TableHead
                      key={column}
                      className="font-medium text-[10px] h-6 px-2 w-[120px] min-w-[120px] max-w-[200px] border-r last:border-r-0 whitespace-nowrap"
                    >
                      <div className="truncate" title={column}>
                        {column}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((row, index) => (
                  <TableRow key={index} className="hover:bg-muted/30">
                    {columns.map((column) => (
                      <TableCell
                        key={column}
                        className="font-mono text-[10px] py-1 px-2 border-r last:border-r-0 w-[120px] min-w-[120px] max-w-[200px]"
                      >
                        <div className="truncate" title={String(row[column])}>
                          {row[column] === null ? (
                            <span className="text-muted-foreground italic">null</span>
                          ) : (
                            String(row[column])
                          )}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
