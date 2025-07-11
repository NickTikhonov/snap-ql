import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { TestTube } from 'lucide-react'
import { useToast } from '../hooks/use-toast'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog'

interface ConnectionDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  connectionName?: string
  onConnectionSaved: () => void
  trigger?: React.ReactNode
}

export const ConnectionDialog = ({
  isOpen,
  onOpenChange,
  connectionName,
  onConnectionSaved,
  trigger
}: ConnectionDialogProps) => {
  const [name, setName] = useState('')
  const [connectionString, setConnectionString] = useState('')
  const [promptExtension, setPromptExtension] = useState('')
  const [isTesting, setIsTesting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const { toast } = useToast()
  const isEditing = !!connectionName

  useEffect(() => {
    if (isEditing && connectionName) {
      setName(connectionName)
      loadConnectionData()
    } else {
      setName('')
      setConnectionString('')
      setPromptExtension('')
    }
    setErrorMessage(null)
    setSuccessMessage(null)
  }, [isEditing, connectionName, isOpen])

  const loadConnectionData = async () => {
    if (!connectionName) return

    try {
      const connection = await window.context.getConnection(connectionName)
      setConnectionString(connection.connectionString)
      setPromptExtension(connection.promptExtension || '')
    } catch (error) {
      console.error('Failed to load connection:', error)
      toast({
        title: 'Error',
        description: 'Failed to load connection data',
        variant: 'destructive'
      })
    }
  }

  const testConnection = async () => {
    if (!connectionString.trim()) return

    setIsTesting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const result = await window.context.testConnectionString(connectionString)
      if (result.success) {
        setSuccessMessage('Connection test successful!')
        toast({
          title: 'Success',
          description: 'Connection test successful!',
          duration: 2000
        })
      } else {
        setErrorMessage(result.error || 'Connection test failed')
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Connection test failed')
    } finally {
      setIsTesting(false)
    }
  }

  const saveConnection = async () => {
    if (!name.trim() || !connectionString.trim()) {
      setErrorMessage('Name and connection string are required')
      return
    }

    setIsSaving(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const connectionData = {
        connectionString: connectionString.trim(),
        promptExtension: promptExtension.trim() || undefined
      }

      if (isEditing) {
        await window.context.editConnection(connectionName!, connectionData)
        toast({
          title: 'Success',
          description: 'Connection updated successfully',
          duration: 2000
        })
      } else {
        await window.context.createConnection(name.trim(), connectionData)
        toast({
          title: 'Success',
          description: 'Connection created successfully',
          duration: 2000
        })
      }

      onConnectionSaved()
      onOpenChange(false)
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to save connection')
    } finally {
      setIsSaving(false)
    }
  }

  const content = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="connection-name" className="text-sm font-medium">
          Connection Name
        </Label>
        <Input
          id="connection-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Production DB"
          disabled={isEditing}
          className="text-sm"
        />
        {isEditing && (
          <p className="text-xs text-muted-foreground">
            Connection name cannot be changed when editing
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="connection-string" className="text-sm font-medium">
          Connection String
        </Label>
        <Input
          id="connection-string"
          value={connectionString}
          onChange={(e) => setConnectionString(e.target.value)}
          placeholder="postgresql://username:password@hostname:port/database"
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          PostgreSQL: postgresql://username:password@hostname:port/database
          <br />
          MySQL: mysql://username:password@hostname:port/database
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="prompt-extension" className="text-sm font-medium">
          Custom Prompt (Optional)
        </Label>
        <Textarea
          id="prompt-extension"
          value={promptExtension}
          onChange={(e) => setPromptExtension(e.target.value)}
          placeholder="e.g., the table 'rooms' also tracks the front and backyard of the house for legacy reasons"
          className="font-mono text-sm min-h-[80px]"
        />
        <p className="text-xs text-muted-foreground">
          Add any additional information about your database that isn&apos;t captured in the schema.
          This will help the AI generate more accurate queries.
        </p>
      </div>

      {errorMessage && (
        <motion.p 
          className="text-sm text-destructive"
          initial={{ x: 0 }}
          animate={{ x: [-2, 2, -2, 2, 0] }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {errorMessage}
        </motion.p>
      )}
      {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

      <div className="flex gap-2 pt-2">
        <Button
          onClick={testConnection}
          disabled={isTesting || !connectionString.trim()}
          variant="outline"
          className="flex items-center gap-2"
        >
          <TestTube className="w-4 h-4" />
          {isTesting ? 'Testing...' : 'Test Connection'}
        </Button>
        <Button
          onClick={saveConnection}
          disabled={isSaving || !name.trim() || !connectionString.trim()}
          className="flex-1"
        >
          {isSaving ? 'Saving...' : isEditing ? 'Update Connection' : 'Create Connection'}
        </Button>
      </div>
    </div>
  )

  if (trigger) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Connection' : 'Add New Connection'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update your database connection settings.'
                : 'Create a new database connection.'}
            </DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Connection' : 'Add New Connection'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update your database connection settings.'
              : 'Create a new database connection.'}
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}
