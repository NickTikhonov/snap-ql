import { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui/select'
import { ChevronDown } from 'lucide-react'
import { useToast } from '../hooks/use-toast'
import { ModeToggle } from './ui/mode-toggle'

export const Settings = () => {
  const [aiProvider, setAiProvider] = useState<'openai' | 'claude'>('openai')
  const [openAIApiKey, setOpenAIApiKey] = useState<string>('')
  const [claudeApiKey, setClaudeApiKey] = useState<string>('')
  const [apiKeyError, setApiKeyError] = useState<string | null>(null)
  const [apiKeySuccess, setApiKeySuccess] = useState<string | null>(null)
  const [isSavingApiKey, setIsSavingApiKey] = useState(false)
  const [openAIBaseUrl, setOpenAIBaseUrl] = useState<string>('')
  const [baseUrlError, setBaseUrlError] = useState<string | null>(null)
  const [baseUrlSuccess, setBaseUrlSuccess] = useState<string | null>(null)
  const [isSavingBaseUrl, setIsSavingBaseUrl] = useState(false)
  const [openAIModel, setOpenAIModel] = useState<string>('')
  const [claudeModel, setClaudeModel] = useState<string>('')
  const [modelError, setModelError] = useState<string | null>(null)
  const [modelSuccess, setModelSuccess] = useState<string | null>(null)
  const [isSavingModel, setIsSavingModel] = useState(false)
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)

  const { toast } = useToast()

  // Load the saved AI provider when the component mounts
  useEffect(() => {
    const loadSavedAiProvider = async () => {
      try {
        const savedAiProvider = await window.context.getAiProvider()
        setAiProvider(savedAiProvider)
      } catch (error: any) {
        console.error('Failed to load AI provider:', error)
      }
    }
    loadSavedAiProvider()
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

  // Load the saved Claude API key when the component mounts
  useEffect(() => {
    const loadSavedClaudeApiKey = async () => {
      try {
        const savedApiKey = await window.context.getClaudeApiKey()
        if (savedApiKey) {
          setClaudeApiKey(savedApiKey)
        }
      } catch (error: any) {
        setApiKeyError('Failed to load the Claude API key. Please try again.')
      }
    }
    loadSavedClaudeApiKey()
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

  // Load the saved Claude model when the component mounts
  useEffect(() => {
    const loadSavedClaudeModel = async () => {
      try {
        const savedModel = await window.context.getClaudeModel()
        if (savedModel) {
          setClaudeModel(savedModel)
        }
      } catch (error: any) {
        setModelError('Failed to load the Claude model. Please try again.')
      }
    }
    loadSavedClaudeModel()
  }, [toast])

  const updateAiProvider = async (provider: 'openai' | 'claude') => {
    try {
      await window.context.setAiProvider(provider)
      setAiProvider(provider)
    } catch (error: any) {
      console.error('Failed to save AI provider:', error)
    }
  }

  const updateApiKey = async () => {
    setIsSavingApiKey(true)
    setApiKeySuccess(null)
    setApiKeyError(null)
    try {
      if (aiProvider === 'openai') {
        await window.context.setOpenAiKey(openAIApiKey)
        setApiKeySuccess('OpenAI API key saved successfully.')
      } else {
        await window.context.setClaudeApiKey(claudeApiKey)
        setApiKeySuccess('Claude API key saved successfully.')
      }
      setApiKeyError(null)
    } catch (error: any) {
      setApiKeyError(
        `Failed to save the ${aiProvider === 'openai' ? 'OpenAI' : 'Claude'} API key: ` +
        error.message
      )
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

  const updateModel = async () => {
    setIsSavingModel(true)
    setModelSuccess(null)
    setModelError(null)
    try {
      if (aiProvider === 'openai') {
        await window.context.setOpenAiModel(openAIModel)
        setModelSuccess('OpenAI model saved successfully.')
      } else {
        await window.context.setClaudeModel(claudeModel)
        setModelSuccess('Claude model saved successfully.')
      }
      setModelError(null)
    } catch (error: any) {
      setModelError(
        `Failed to save the ${aiProvider === 'openai' ? 'OpenAI' : 'Claude'} model: ` +
        error.message
      )
    } finally {
      setIsSavingModel(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h2 className="text-lg font-bold">Settings</h2>
        <p className="text-muted-foreground text-sm">
          Configure your AI provider and application settings.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">AI Provider</CardTitle>
              <CardDescription className="text-xs">
                Configure your AI provider for query generation.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="space-y-1.5">
            <Label htmlFor="ai-provider" className="text-xs">
              Provider
            </Label>
            <Select value={aiProvider} onValueChange={updateAiProvider}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select AI provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="claude">Claude</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="api-key" className="text-xs">
              API Key
            </Label>
            <Input
              id="api-key"
              type="text"
              value={aiProvider === 'openai' ? openAIApiKey : claudeApiKey}
              onChange={(e) =>
                aiProvider === 'openai'
                  ? setOpenAIApiKey(e.target.value)
                  : setClaudeApiKey(e.target.value)
              }
              placeholder={aiProvider === 'openai' ? 'sk-...' : 'sk-ant-...'}
              className="font-mono text-xs h-8"
            />
            <p className="text-xs text-muted-foreground">
              {aiProvider === 'openai' ? (
                <>
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
                </>
              ) : (
                <>
                  You can create an API key at{' '}
                  <a
                    href="https://console.anthropic.com/account/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Anthropic Console
                  </a>
                  .
                </>
              )}
            </p>
            {apiKeyError && <p className="text-xs text-destructive">{apiKeyError}</p>}
            {apiKeySuccess && <p className="text-xs text-green-500">{apiKeySuccess}</p>}
          </div>

          <Button
            onClick={updateApiKey}
            disabled={
              isSavingApiKey ||
              !(aiProvider === 'openai' ? openAIApiKey.trim() : claudeApiKey.trim())
            }
            className="flex items-center space-x-1.5 h-8 px-3 text-xs"
            size="sm"
          >
            <span>{isSavingApiKey ? 'Saving...' : 'Save Key'}</span>
          </Button>

          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-1.5 h-8 px-3 text-xs">
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`}
                />
                <span>Advanced Options</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-3">
              {aiProvider === 'openai' && (
                <>
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
                      Custom base URL for OpenAI API. Leave empty to use the default OpenAI
                      endpoint. Useful for OpenAI-compatible APIs like Azure OpenAI or local models.
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
                </>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="model" className="text-xs">
                  Model (Optional)
                </Label>
                <Input
                  id="model"
                  type="text"
                  value={aiProvider === 'openai' ? openAIModel : claudeModel}
                  onChange={(e) =>
                    aiProvider === 'openai'
                      ? setOpenAIModel(e.target.value)
                      : setClaudeModel(e.target.value)
                  }
                  placeholder={aiProvider === 'openai' ? 'gpt-4o' : 'claude-sonnet-4-20250514'}
                  className="font-mono text-xs h-8"
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  {aiProvider === 'openai' ? (
                    <>
                      Model ID to use for query generation. Leave empty to use gpt-4o (default).
                      Examples: gpt-4, gpt-3.5-turbo, gpt-4o-mini.
                    </>
                  ) : (
                    <>
                      Model ID to use for query generation. Leave empty to use
                      claude-sonnet-4-20250514 (default).
                    </>
                  )}
                </p>
                {modelError && <p className="text-xs text-destructive">{modelError}</p>}
                {modelSuccess && <p className="text-xs text-green-500">{modelSuccess}</p>}
              </div>

              <Button
                onClick={updateModel}
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
