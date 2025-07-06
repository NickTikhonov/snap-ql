import { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible'
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group'
import { TestTube, ChevronDown } from 'lucide-react'
import { useToast } from '../hooks/use-toast'
import { ModeToggle } from './ui/mode-toggle'
import { Textarea } from './ui/textarea'

export const Settings = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isTesting, setIsTesting] = useState(false)
  const [connectionString, setConnectionString] = useState<string>('')
  const [openAIApiKey, setOpenAIApiKey] = useState<string>('')
  const [apiKeyError, setApiKeyError] = useState<string | null>(null)
  const [apiKeySuccess, setApiKeySuccess] = useState<string | null>(null)
  const [isSavingApiKey, setIsSavingApiKey] = useState(false)
  const [openAIBaseUrl, setOpenAIBaseUrl] = useState<string>('')
  const [baseUrlError, setBaseUrlError] = useState<string | null>(null)
  const [baseUrlSuccess, setBaseUrlSuccess] = useState<string | null>(null)
  const [isSavingBaseUrl, setIsSavingBaseUrl] = useState(false)
  const [openAIModel, setOpenAIModel] = useState<string>('')
  const [modelError, setModelError] = useState<string | null>(null)
  const [modelSuccess, setModelSuccess] = useState<string | null>(null)
  const [isSavingModel, setIsSavingModel] = useState(false)
  const [isOpenAIAdvancedOpen, setIsOpenAIAdvancedOpen] = useState(false)
  const [isGeminiAdvancedOpen, setIsGeminiAdvancedOpen] = useState(false)
  const [llmProvider, setLLMProvider] = useState<'openai' | 'gemini'>('openai')
  const [geminiApiKey, setGeminiApiKey] = useState<string>('')
  const [geminiKeyError, setGeminiKeyError] = useState<string | null>(null)
  const [geminiKeySuccess, setGeminiKeySuccess] = useState<string | null>(null)
  const [isSavingGeminiKey, setIsSavingGeminiKey] = useState(false)
  const [geminiModel, setGeminiModel] = useState<string>('')
  const [geminiModelError, setGeminiModelError] = useState<string | null>(null)
  const [geminiModelSuccess, setGeminiModelSuccess] = useState<string | null>(null)
  const [isSavingGeminiModel, setIsSavingGeminiModel] = useState(false)
  const [promptExtension, setPromptExtension] = useState<string>('')
  const [isSavingPromptExtension, setIsSavingPromptExtension] = useState(false)
  const [promptExtensionError, setPromptExtensionError] = useState<string | null>(null)
  const [promptExtensionSuccess, setPromptExtensionSuccess] = useState<string | null>(null)

  const { toast } = useToast()

  // Load the saved connection string when the component mounts
  useEffect(() => {
    const loadSavedConnectionString = async () => {
      try {
        const savedConnectionString = await window.context.getConnectionString()
        if (savedConnectionString) {
          setConnectionString(savedConnectionString)
        }
      } catch (error) {
        toast({
          title: 'Error loading connection string',
          description: 'Failed to load the connection string. Please try again.',
          variant: 'destructive'
        })
      }
    }

    loadSavedConnectionString()
  }, [toast])

  // Load the saved OpenAI API key when the component mounts
  useEffect(() => {
    const loadSavedApiKey = async () => {
      try {
        const savedApiKey = await window.context.getOpenAiKey()
        if (savedApiKey) {
          setOpenAIApiKey(savedApiKey)
        }
      } catch (error: any) {
        setApiKeyError('Failed to load the OpenAI API key. Please try again.')
      }
    }
    loadSavedApiKey()
  }, [toast])

  // Load the saved OpenAI base URL when the component mounts
  useEffect(() => {
    const loadSavedBaseUrl = async () => {
      try {
        const savedBaseUrl = await window.context.getOpenAiBaseUrl()
        if (savedBaseUrl) {
          setOpenAIBaseUrl(savedBaseUrl)
        }
      } catch (error: any) {
        setBaseUrlError('Failed to load the OpenAI base URL. Please try again.')
      }
    }
    loadSavedBaseUrl()
  }, [toast])

  // Load the saved OpenAI model when the component mounts
  useEffect(() => {
    const loadSavedModel = async () => {
      try {
        const savedModel = await window.context.getOpenAiModel()
        if (savedModel) {
          setOpenAIModel(savedModel)
        }
      } catch (error: any) {
        setModelError('Failed to load the OpenAI model. Please try again.')
      }
    }
    loadSavedModel()
  }, [toast])

  // Load the saved LLM provider when the component mounts
  useEffect(() => {
    const loadSavedProvider = async () => {
      try {
        const savedProvider = await window.context.getLLMProvider()
        setLLMProvider(savedProvider)
      } catch (error: any) {
        console.error('Failed to load LLM provider:', error)
      }
    }
    loadSavedProvider()
  }, [])

  // Load the saved Gemini API key when the component mounts
  useEffect(() => {
    const loadSavedGeminiKey = async () => {
      try {
        const savedGeminiKey = await window.context.getGeminiKey()
        if (savedGeminiKey) {
          setGeminiApiKey(savedGeminiKey)
        }
      } catch (error: any) {
        setGeminiKeyError('Failed to load the Gemini API key. Please try again.')
      }
    }
    loadSavedGeminiKey()
  }, [])

  // Load the saved Gemini model when the component mounts
  useEffect(() => {
    const loadSavedGeminiModel = async () => {
      try {
        const savedGeminiModel = await window.context.getGeminiModel()
        if (savedGeminiModel) {
          setGeminiModel(savedGeminiModel)
        }
      } catch (error: any) {
        setGeminiModelError('Failed to load the Gemini model. Please try again.')
      }
    }
    loadSavedGeminiModel()
  }, [])

  // Load the saved prompt extension when the component mounts
  useEffect(() => {
    const loadSavedPromptExtension = async () => {
      try {
        const savedPromptExtension = await window.context.getPromptExtension()
        if (savedPromptExtension) {
          setPromptExtension(savedPromptExtension)
        }
      } catch (error: any) {
        setPromptExtensionError('Failed to load the prompt extension. Please try again.')
      }
    }
    loadSavedPromptExtension()
  }, [toast])

  const updateConnectionString = async () => {
    setIsTesting(true)
    setSuccessMessage(null)
    setErrorMessage(null)
    try {
      const result = await window.context.setConnectionString(connectionString)
      if (!result) {
        throw new Error('Failed to save connection string')
      }
      setErrorMessage(null)
      setSuccessMessage('Connection string saved successfully.')
    } catch (error) {
      console.error('Error saving connection string:', error)
      setErrorMessage(
        'Failed to connect to the database. Please check your connection string or server and try again.'
      )
    } finally {
      setIsTesting(false)
    }
  }

  const updateOpenAIApiKey = async () => {
    setIsSavingApiKey(true)
    setApiKeySuccess(null)
    setApiKeyError(null)
    try {
      await window.context.setOpenAiKey(openAIApiKey)
      setApiKeyError(null)
      setApiKeySuccess('OpenAI API key saved successfully.')
    } catch (error: any) {
      setApiKeyError('Failed to save the OpenAI API key: ' + error.message)
    } finally {
      setIsSavingApiKey(false)
    }
  }

  const updateOpenAIBaseUrl = async () => {
    setIsSavingBaseUrl(true)
    setBaseUrlSuccess(null)
    setBaseUrlError(null)
    try {
      await window.context.setOpenAiBaseUrl(openAIBaseUrl)
      setBaseUrlError(null)
      setBaseUrlSuccess('Base URL saved successfully.')
    } catch (error: any) {
      setBaseUrlError('Failed to save the OpenAI base URL: ' + error.message)
    } finally {
      setIsSavingBaseUrl(false)
    }
  }

  const updateOpenAIModel = async () => {
    setIsSavingModel(true)
    setModelSuccess(null)
    setModelError(null)
    try {
      await window.context.setOpenAiModel(openAIModel)
      setModelError(null)
      setModelSuccess('Model ID saved successfully.')
    } catch (error: any) {
      setModelError('Failed to save the OpenAI model: ' + error.message)
    } finally {
      setIsSavingModel(false)
    }
  }

  const updateLLMProvider = async (provider: 'openai' | 'gemini') => {
    try {
      await window.context.setLLMProvider(provider)
      setLLMProvider(provider)
    } catch (error: any) {
      toast({
        title: 'Error saving LLM provider',
        description: 'Failed to save the LLM provider: ' + error.message,
        variant: 'destructive'
      })
    }
  }

  const updateGeminiApiKey = async () => {
    setIsSavingGeminiKey(true)
    setGeminiKeySuccess(null)
    setGeminiKeyError(null)
    try {
      await window.context.setGeminiKey(geminiApiKey)
      setGeminiKeyError(null)
      setGeminiKeySuccess('Gemini API key saved successfully.')
    } catch (error: any) {
      setGeminiKeyError('Failed to save the Gemini API key: ' + error.message)
    } finally {
      setIsSavingGeminiKey(false)
    }
  }

  const updateGeminiModel = async () => {
    setIsSavingGeminiModel(true)
    setGeminiModelSuccess(null)
    setGeminiModelError(null)
    try {
      await window.context.setGeminiModel(geminiModel)
      setGeminiModelError(null)
      setGeminiModelSuccess('Gemini model saved successfully.')
    } catch (error: any) {
      setGeminiModelError('Failed to save the Gemini model: ' + error.message)
    } finally {
      setIsSavingGeminiModel(false)
    }
  }

  const updatePromptExtension = async () => {
    setIsSavingPromptExtension(true)
    setPromptExtensionSuccess(null)
    setPromptExtensionError(null)
    try {
      await window.context.setPromptExtension(promptExtension)
      setPromptExtensionError(null)
      setPromptExtensionSuccess('Prompt extension saved successfully.')
    } catch (error: any) {
      setPromptExtensionError('Failed to save the prompt extension: ' + error.message)
    } finally {
      setIsSavingPromptExtension(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h2 className="text-lg font-bold">Settings</h2>
        <p className="text-muted-foreground text-sm">
          Configure your PostgreSQL database connection.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Database Connection</CardTitle>
              <CardDescription className="text-xs">
                Enter your MySQL or PostgreSQL connection URI to connect to your database.
                <br />
                <br />
                <p className="text-xs text-muted-foreground">
                  PostgreSQL: postgresql://username:password@hostname:port/database
                  <br />
                  MySQL: mysql://username:password@hostname:port/database
                </p>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="space-y-1.5">
            <Label htmlFor="connection-string" className="text-xs">
              Connection String
            </Label>
            <Input
              id="connection-string"
              type="password"
              value={connectionString}
              onChange={(e) => setConnectionString(e.target.value)}
              placeholder="postgresql://username:password@hostname:port/database"
              className="font-mono text-xs h-8"
            />
            {errorMessage && <p className="text-xs text-destructive">{errorMessage}</p>}
            {successMessage && <p className="text-xs text-green-500">{successMessage}</p>}
          </div>

          <Button
            onClick={updateConnectionString}
            disabled={isTesting || !connectionString.trim()}
            className="flex items-center space-x-1.5 h-8 px-3 text-xs"
            size="sm"
          >
            <TestTube className="w-3.5 h-3.5" />
            <span>{isTesting ? 'Testing Connection...' : 'Test & Set'}</span>
          </Button>
        </CardContent>
      </Card>

      {llmProvider === 'openai' && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">OpenAI API Key</CardTitle>
                <CardDescription className="text-xs">
                  Enter your OpenAI API key to enable AI-powered features.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="space-y-1.5">
              <Label htmlFor="openai-api-key" className="text-xs">
                API Key
              </Label>
              <Input
                id="openai-api-key"
                type="password"
                value={openAIApiKey}
                onChange={(e) => setOpenAIApiKey(e.target.value)}
                placeholder="sk-..."
                className="font-mono text-xs h-8"
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                You can create an API key at{' '}
                <a
                  href="https://platform.openai.com/account/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  OpenAI API Keys
                </a>
                .
              </p>
              {apiKeyError && <p className="text-xs text-destructive">{apiKeyError}</p>}
              {apiKeySuccess && <p className="text-xs text-green-500">{apiKeySuccess}</p>}
            </div>

            <Button
              onClick={updateOpenAIApiKey}
              disabled={isSavingApiKey || !openAIApiKey.trim()}
              className="flex items-center space-x-1.5 h-8 px-3 text-xs"
              size="sm"
            >
              <span>{isSavingApiKey ? 'Saving...' : 'Save Key'}</span>
            </Button>

            <Collapsible open={isOpenAIAdvancedOpen} onOpenChange={setIsOpenAIAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-1.5 h-8 px-3 text-xs">
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${isOpenAIAdvancedOpen ? 'rotate-180' : ''}`}
                  />
                  <span>Advanced Options</span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-3">
                <div className="space-y-1.5">
                  <Label htmlFor="openai-base-url" className="text-xs">
                    Base URL (Optional)
                  </Label>
                  <Input
                    id="openai-base-url"
                    type="text"
                    value={openAIBaseUrl}
                    onChange={(e) => setOpenAIBaseUrl(e.target.value)}
                    placeholder="https://api.openai.com/v1"
                    className="font-mono text-xs h-8"
                    autoComplete="off"
                  />
                  <p className="text-xs text-muted-foreground">
                    Custom base URL for OpenAI API. Leave empty to use the default OpenAI endpoint.
                    Useful for OpenAI-compatible APIs like Azure OpenAI or local models.
                  </p>
                  {baseUrlError && <p className="text-xs text-destructive">{baseUrlError}</p>}
                  {baseUrlSuccess && <p className="text-xs text-green-500">{baseUrlSuccess}</p>}
                </div>

                <Button
                  onClick={updateOpenAIBaseUrl}
                  disabled={isSavingBaseUrl}
                  className="flex items-center space-x-1.5 h-8 px-3 text-xs"
                  size="sm"
                  variant="outline"
                >
                  <span>{isSavingBaseUrl ? 'Saving...' : 'Save Base URL'}</span>
                </Button>

                <div className="space-y-1.5">
                  <Label htmlFor="openai-model" className="text-xs">
                    Model (Optional)
                  </Label>
                  <Input
                    id="openai-model"
                    type="text"
                    value={openAIModel}
                    onChange={(e) => setOpenAIModel(e.target.value)}
                    placeholder="gpt-4o"
                    className="font-mono text-xs h-8"
                    autoComplete="off"
                  />
                  <p className="text-xs text-muted-foreground">
                    Model ID to use for query generation. Leave empty to use gpt-4o (default).
                    Examples: gpt-4, gpt-3.5-turbo, claude-3-sonnet, or custom model names.
                  </p>
                  {modelError && <p className="text-xs text-destructive">{modelError}</p>}
                  {modelSuccess && <p className="text-xs text-green-500">{modelSuccess}</p>}
                </div>

                <Button
                  onClick={updateOpenAIModel}
                  disabled={isSavingModel}
                  className="flex items-center space-x-1.5 h-8 px-3 text-xs"
                  size="sm"
                  variant="outline"
                >
                  <span>{isSavingModel ? 'Saving...' : 'Save Model'}</span>
                </Button>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">LLM Provider</CardTitle>
          <CardDescription className="text-xs">
            Choose your preferred AI provider for query generation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="space-y-3">
            <Label className="text-xs">Select Provider</Label>
            <RadioGroup
              value={llmProvider}
              onValueChange={(value) => updateLLMProvider(value as 'openai' | 'gemini')}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="openai" id="openai" />
                <Label htmlFor="openai" className="text-xs cursor-pointer">
                  OpenAI (GPT-4, GPT-3.5)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="gemini" id="gemini" />
                <Label htmlFor="gemini" className="text-xs cursor-pointer">
                  Google Gemini (Flash, Pro)
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {llmProvider === 'gemini' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Google Gemini API Key</CardTitle>
            <CardDescription className="text-xs">
              Enter your Google Gemini API key to enable Gemini-powered features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="space-y-1.5">
              <Label htmlFor="gemini-api-key" className="text-xs">
                API Key
              </Label>
              <Input
                id="gemini-api-key"
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AIza..."
                className="font-mono text-xs h-8"
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                You can create an API key at{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Google AI Studio
                </a>
                .
              </p>
              {geminiKeyError && <p className="text-xs text-destructive">{geminiKeyError}</p>}
              {geminiKeySuccess && <p className="text-xs text-green-500">{geminiKeySuccess}</p>}
            </div>

            <Button
              onClick={updateGeminiApiKey}
              disabled={isSavingGeminiKey || !geminiApiKey.trim()}
              className="flex items-center space-x-1.5 h-8 px-3 text-xs"
              size="sm"
            >
              <span>{isSavingGeminiKey ? 'Saving...' : 'Save Key'}</span>
            </Button>

            <Collapsible open={isGeminiAdvancedOpen} onOpenChange={setIsGeminiAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-1.5 h-8 px-3 text-xs">
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${isGeminiAdvancedOpen ? 'rotate-180' : ''}`}
                  />
                  <span>Advanced Options</span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-3">
                <div className="space-y-1.5">
                  <Label htmlFor="gemini-model" className="text-xs">
                    Model (Optional)
                  </Label>
                  <Input
                    id="gemini-model"
                    type="text"
                    value={geminiModel}
                    onChange={(e) => setGeminiModel(e.target.value)}
                    placeholder="gemini-2.5-flash"
                    className="font-mono text-xs h-8"
                    autoComplete="off"
                  />
                  <p className="text-xs text-muted-foreground">
                    Model ID to use for query generation. Leave empty to use gemini-2.5-flash (default).
                    Examples: gemini-1.5-flash, gemini-1.5-pro, gemini-2.0-flash-exp.
                  </p>
                  {geminiModelError && <p className="text-xs text-destructive">{geminiModelError}</p>}
                  {geminiModelSuccess && <p className="text-xs text-green-500">{geminiModelSuccess}</p>}
                </div>

                <Button
                  onClick={updateGeminiModel}
                  disabled={isSavingGeminiModel}
                  className="flex items-center space-x-1.5 h-8 px-3 text-xs"
                  size="sm"
                  variant="outline"
                >
                  <span>{isSavingGeminiModel ? 'Saving...' : 'Save Model'}</span>
                </Button>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Custom Prompt</CardTitle>
          <CardDescription className="text-xs">
            Add to the AI prompt. Use this field to add any additional information about your
            database that isn&apos;t captured in the schema. This will help the AI generate more
            accurate queries.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <Textarea
            value={promptExtension}
            onChange={(e) => setPromptExtension(e.target.value)}
            placeholder="e.g. the table 'rooms' also tracks the front and backyard of the house for legacy reasons"
            className="font-mono text-xs h-8"
          />
          {promptExtensionError && (
            <p className="text-xs text-destructive">{promptExtensionError}</p>
          )}
          {promptExtensionSuccess && (
            <p className="text-xs text-green-500">{promptExtensionSuccess}</p>
          )}
          <Button
            onClick={updatePromptExtension}
            disabled={isSavingPromptExtension}
            className="flex items-center space-x-1.5 h-8 px-3 text-xs"
            size="sm"
          >
            <span>{isSavingPromptExtension ? 'Saving...' : 'Save Prompt'}</span>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Theme Settings</CardTitle>
          <CardDescription className="text-xs">
            Toggle between light, dark, and system themes.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex">
            <ModeToggle />
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
