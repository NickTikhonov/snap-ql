import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Settings2, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { GraphMetadata } from './Graph'

interface GraphEditDialogProps {
  data: any[]
  currentMetadata: GraphMetadata | null
  onSave?: (metadata: GraphMetadata) => void
  triggerText?: string
  renderTrigger?: (onClick: () => void) => ReactNode
}

export const GraphEditDialog = ({
  data,
  currentMetadata,
  onSave,
  triggerText,
  renderTrigger
}: GraphEditDialogProps) => {
  const [open, setOpen] = useState(false)
  const [xColumn, setXColumn] = useState(currentMetadata?.graphXColumn || '')
  const [yColumns, setYColumns] = useState<string[]>(currentMetadata?.graphYColumns || [])

  useEffect(() => {
    setXColumn(currentMetadata?.graphXColumn || '')
    setYColumns(currentMetadata?.graphYColumns || [])
  }, [currentMetadata])

  const availableColumns = data.length > 0 ? Object.keys(data[0]) : []

  const handleSave = () => {
    if (onSave) {
      onSave({
        graphXColumn: xColumn,
        graphYColumns: yColumns
      })
    }
    setOpen(false)
  }

  const handleAddYColumn = (column: string) => {
    if (!yColumns.includes(column)) {
      setYColumns([...yColumns, column])
    }
  }

  const handleRemoveYColumn = (column: string) => {
    setYColumns(yColumns.filter((col) => col !== column))
  }

  const handleCancel = () => {
    setXColumn(currentMetadata?.graphXColumn || '')
    setYColumns(currentMetadata?.graphYColumns || [])
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {renderTrigger ? (
          renderTrigger(() => setOpen(true))
        ) : (
          <Button variant="outline" size="sm" className="ml-auto">
            <Settings2 className="h-4 w-4 mr-2" />
            {triggerText || 'Edit Graph'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{currentMetadata ? 'Edit Graph Configuration' : 'Create Graph'}</DialogTitle>
          <DialogDescription>
            Choose which columns to use for the X and Y axes of your graph.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="x-column">X-axis Column</Label>
            <Select value={xColumn} onValueChange={setXColumn}>
              <SelectTrigger>
                <SelectValue placeholder="Select X-axis column" />
              </SelectTrigger>
              <SelectContent>
                {availableColumns.map((column) => (
                  <SelectItem key={column} value={column}>
                    {column}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Y-axis Columns</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {yColumns.map((column) => (
                <Badge key={column} variant="secondary" className="flex items-center gap-1">
                  {column}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleRemoveYColumn(column)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <Select onValueChange={handleAddYColumn}>
              <SelectTrigger>
                <SelectValue placeholder="Add Y-axis column" />
              </SelectTrigger>
              <SelectContent>
                {availableColumns
                  .filter((column) => !yColumns.includes(column) && column !== xColumn)
                  .map((column) => (
                    <SelectItem key={column} value={column}>
                      {column}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!xColumn || yColumns.length === 0}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
