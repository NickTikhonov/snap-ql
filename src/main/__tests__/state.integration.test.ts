import fs from 'fs-extra'
import path from 'path'
import { tmpdir } from 'os'
import {
  getConnectionString,
  setConnectionString,
  getOpenAiKey,
  setOpenAiKey,
  getOpenAiBaseUrl,
  setOpenAiBaseUrl,
  getOpenAiModel,
  setOpenAiModel,
  getAiProvider,
  setAiProvider,
  getClaudeApiKey,
  setClaudeApiKey,
  getClaudeModel,
  setClaudeModel,
  getPromptExtension,
  setPromptExtension,
  getQueryHistory,
  setQueryHistory,
  addQueryToHistory,
  updateQueryHistory,
  getFavorites,
  addFavorite,
  removeFavorite,
  updateFavorite
} from '../lib/state'

describe('State Module Integration Tests', () => {
  let testRootDir: string
  let originalTestRoot: string | undefined

  beforeEach(async () => {
    // Create a unique temporary directory for each test
    testRootDir = await fs.mkdtemp(path.join(tmpdir(), 'snapql-test-'))
    originalTestRoot = process.env.SNAPQL_TEST_ROOT
    process.env.SNAPQL_TEST_ROOT = testRootDir
  })

  afterEach(async () => {
    // Restore original environment
    if (originalTestRoot) {
      process.env.SNAPQL_TEST_ROOT = originalTestRoot
    } else {
      delete process.env.SNAPQL_TEST_ROOT
    }

    // Clean up temporary directory
    await fs.remove(testRootDir)
  })

  describe('Settings Management', () => {
    const settingsPath = () => path.join(testRootDir, 'settings.json')

    describe('Connection String', () => {
      it('should return undefined for new installation', async () => {
        const result = await getConnectionString()
        expect(result).toBeUndefined()

        // Verify settings file was created with defaults
        expect(await fs.pathExists(settingsPath())).toBe(true)
        const settings = await fs.readJson(settingsPath())
        expect(settings.connectionString).toBeUndefined()
        expect(settings.aiProvider).toBe('openai')
      })

      it('should set and persist connection string', async () => {
        const connectionString = 'postgresql://user:pass@localhost:5432/db'

        await setConnectionString(connectionString)

        // Verify file was written
        expect(await fs.pathExists(settingsPath())).toBe(true)
        const settings = await fs.readJson(settingsPath())
        expect(settings.connectionString).toBe(connectionString)

        // Verify retrieval works
        const retrieved = await getConnectionString()
        expect(retrieved).toBe(connectionString)
      })

      it('should update existing connection string', async () => {
        const firstConnection = 'postgresql://user1:pass@localhost:5432/db1'
        const secondConnection = 'postgresql://user2:pass@localhost:5432/db2'

        await setConnectionString(firstConnection)
        await setConnectionString(secondConnection)

        const result = await getConnectionString()
        expect(result).toBe(secondConnection)

        // Verify file contains updated value
        const settings = await fs.readJson(settingsPath())
        expect(settings.connectionString).toBe(secondConnection)
      })
    })

    describe('OpenAI Settings', () => {
      it('should handle OpenAI key operations', async () => {
        const apiKey = 'sk-test-key-123'

        await setOpenAiKey(apiKey)

        const retrieved = await getOpenAiKey()
        expect(retrieved).toBe(apiKey)

        // Verify persistence
        const settings = await fs.readJson(settingsPath())
        expect(settings.openAiKey).toBe(apiKey)
      })

      it('should handle OpenAI base URL operations', async () => {
        const baseUrl = 'https://custom.openai.com/v1'

        await setOpenAiBaseUrl(baseUrl)

        const retrieved = await getOpenAiBaseUrl()
        expect(retrieved).toBe(baseUrl)

        // Verify persistence
        const settings = await fs.readJson(settingsPath())
        expect(settings.openAiBaseUrl).toBe(baseUrl)
      })

      it('should handle OpenAI model operations', async () => {
        const model = 'gpt-4-turbo'

        await setOpenAiModel(model)

        const retrieved = await getOpenAiModel()
        expect(retrieved).toBe(model)

        // Verify persistence
        const settings = await fs.readJson(settingsPath())
        expect(settings.openAiModel).toBe(model)
      })
    })

    describe('Claude Settings', () => {
      it('should handle Claude API key operations', async () => {
        const apiKey = 'claude-test-key-123'

        await setClaudeApiKey(apiKey)

        const retrieved = await getClaudeApiKey()
        expect(retrieved).toBe(apiKey)

        // Verify persistence
        const settings = await fs.readJson(settingsPath())
        expect(settings.claudeApiKey).toBe(apiKey)
      })

      it('should handle Claude model operations', async () => {
        const model = 'claude-3-5-sonnet-20241022'

        await setClaudeModel(model)

        const retrieved = await getClaudeModel()
        expect(retrieved).toBe(model)

        // Verify persistence
        const settings = await fs.readJson(settingsPath())
        expect(settings.claudeModel).toBe(model)
      })
    })

    describe('AI Provider', () => {
      it('should default to openai', async () => {
        const provider = await getAiProvider()
        expect(provider).toBe('openai')
      })

      it('should set and persist AI provider', async () => {
        await setAiProvider('claude')

        const retrieved = await getAiProvider()
        expect(retrieved).toBe('claude')

        // Verify persistence
        const settings = await fs.readJson(settingsPath())
        expect(settings.aiProvider).toBe('claude')
      })
    })

    describe('Prompt Extension', () => {
      it('should handle prompt extension operations', async () => {
        const extension = 'Custom prompt extension for testing'

        await setPromptExtension(extension)

        const retrieved = await getPromptExtension()
        expect(retrieved).toBe(extension)

        // Verify persistence
        const settings = await fs.readJson(settingsPath())
        expect(settings.promptExtension).toBe(extension)
      })

      it('should handle empty prompt extension', async () => {
        await setPromptExtension('')

        const retrieved = await getPromptExtension()
        expect(retrieved).toBeUndefined()

        // Verify persistence
        const settings = await fs.readJson(settingsPath())
        expect(settings.promptExtension).toBeUndefined()
      })

      it('should handle whitespace-only prompt extension', async () => {
        await setPromptExtension('   ')

        const retrieved = await getPromptExtension()
        expect(retrieved).toBeUndefined()

        // Verify persistence
        const settings = await fs.readJson(settingsPath())
        expect(settings.promptExtension).toBeUndefined()
      })
    })

    describe('Settings File Format', () => {
      it('should create properly formatted JSON file', async () => {
        await setConnectionString('test-connection')
        await setOpenAiKey('test-key')
        await setAiProvider('claude')

        const fileContent = await fs.readFile(settingsPath(), 'utf8')

        // Should be properly formatted JSON with 2-space indentation
        expect(fileContent).toContain('{\n  "connectionString": "test-connection"')
        expect(fileContent).toContain('  "aiProvider": "claude"')
        expect(fileContent).toContain('  "openAiKey": "test-key"')

        // Should be valid JSON
        const parsed = JSON.parse(fileContent)
        expect(parsed).toBeInstanceOf(Object)
      })
    })
  })

  describe('History Management', () => {
    const historyPath = () => path.join(testRootDir, 'history.json')

    const mockQuery = {
      id: 'test-query-1',
      query: 'SELECT * FROM users',
      results: [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' }
      ],
      timestamp: '2025-01-01T00:00:00.000Z'
    }

    const mockQueryWithGraph = {
      id: 'test-query-2',
      query: 'SELECT created_at, count(*) FROM users GROUP BY created_at',
      results: [{ created_at: '2025-01-01', count: 5 }],
      graph: {
        graphXColumn: 'created_at',
        graphYColumns: ['count']
      },
      timestamp: '2025-01-01T01:00:00.000Z'
    }

    describe('getQueryHistory', () => {
      it('should return empty array for new installation', async () => {
        const result = await getQueryHistory()

        expect(result).toEqual([])

        // Verify history file was created
        expect(await fs.pathExists(historyPath())).toBe(true)
        const history = await fs.readJson(historyPath())
        expect(history).toEqual([])
      })

      it('should return existing history', async () => {
        // Pre-populate history file
        await fs.writeJson(historyPath(), [mockQuery, mockQueryWithGraph])

        const result = await getQueryHistory()

        expect(result).toEqual([mockQuery, mockQueryWithGraph])
      })
    })

    describe('setQueryHistory', () => {
      it('should write history to file', async () => {
        const history = [mockQuery, mockQueryWithGraph]

        await setQueryHistory(history)

        // Verify file was written
        expect(await fs.pathExists(historyPath())).toBe(true)
        const savedHistory = await fs.readJson(historyPath())
        expect(savedHistory).toEqual(history)
      })
    })

    describe('addQueryToHistory', () => {
      it('should add query to beginning of empty history', async () => {
        await addQueryToHistory(mockQuery)

        const history = await fs.readJson(historyPath())
        expect(history).toEqual([mockQuery])
      })

      it('should add query to beginning of existing history', async () => {
        await fs.writeJson(historyPath(), [mockQueryWithGraph])

        await addQueryToHistory(mockQuery)

        const history = await fs.readJson(historyPath())
        expect(history).toEqual([mockQuery, mockQueryWithGraph])
      })

      it('should limit history to 20 queries', async () => {
        // Create 20 existing queries
        const existingQueries = Array.from({ length: 20 }, (_, i) => ({
          id: `query-${i}`,
          query: `SELECT ${i}`,
          results: [],
          timestamp: new Date().toISOString()
        }))

        await fs.writeJson(historyPath(), existingQueries)

        await addQueryToHistory(mockQuery)

        const history = await fs.readJson(historyPath())
        expect(history).toHaveLength(20)
        expect(history[0]).toEqual(mockQuery)
        expect(history[19]).toEqual(existingQueries[18]) // Last query should be dropped
      })
    })

    describe('updateQueryHistory', () => {
      it('should update existing query', async () => {
        await fs.writeJson(historyPath(), [mockQuery, mockQueryWithGraph])

        const updates = {
          graph: {
            graphXColumn: 'id',
            graphYColumns: ['name']
          }
        }

        await updateQueryHistory(mockQuery.id, updates)

        const history = await fs.readJson(historyPath())
        expect(history[0]).toEqual({ ...mockQuery, ...updates })
        expect(history[1]).toEqual(mockQueryWithGraph)
      })

      it('should not modify history if query not found', async () => {
        await fs.writeJson(historyPath(), [mockQuery])

        await updateQueryHistory('non-existent-id', { query: 'updated' })

        const history = await fs.readJson(historyPath())
        expect(history).toEqual([mockQuery])
      })
    })
  })

  describe('Favorites Management', () => {
    const favoritesPath = () => path.join(testRootDir, 'favorites.json')

    const mockFavorite = {
      id: 'fav-1',
      query: 'SELECT * FROM favorite_queries',
      results: [{ id: 1, name: 'Test' }],
      timestamp: '2025-01-01T00:00:00.000Z'
    }

    describe('getFavorites', () => {
      it('should return empty array when no favorites file exists', async () => {
        const result = await getFavorites()

        expect(result).toEqual([])
        expect(await fs.pathExists(favoritesPath())).toBe(false)
      })

      it('should return existing favorites', async () => {
        await fs.writeJson(favoritesPath(), [mockFavorite])

        const result = await getFavorites()

        expect(result).toEqual([mockFavorite])
      })
    })

    describe('addFavorite', () => {
      it('should create favorites file and add favorite', async () => {
        await addFavorite(mockFavorite)

        expect(await fs.pathExists(favoritesPath())).toBe(true)
        const favorites = await fs.readJson(favoritesPath())
        expect(favorites).toEqual([mockFavorite])
      })

      it('should add favorite to beginning of existing list', async () => {
        const existingFavorite = { ...mockFavorite, id: 'fav-2', query: 'SELECT 2' }
        await fs.writeJson(favoritesPath(), [existingFavorite])

        await addFavorite(mockFavorite)

        const favorites = await fs.readJson(favoritesPath())
        expect(favorites).toEqual([mockFavorite, existingFavorite])
      })
    })

    describe('removeFavorite', () => {
      it('should remove favorite by ID', async () => {
        const favorite2 = { ...mockFavorite, id: 'fav-2', query: 'SELECT 2' }
        await fs.writeJson(favoritesPath(), [mockFavorite, favorite2])

        await removeFavorite('fav-2')

        const favorites = await fs.readJson(favoritesPath())
        expect(favorites).toEqual([mockFavorite])
      })

      it('should not modify favorites if ID not found', async () => {
        await fs.writeJson(favoritesPath(), [mockFavorite])

        await removeFavorite('non-existent-id')

        const favorites = await fs.readJson(favoritesPath())
        expect(favorites).toEqual([mockFavorite])
      })
    })

    describe('updateFavorite', () => {
      it('should update existing favorite', async () => {
        await fs.writeJson(favoritesPath(), [mockFavorite])

        const updates = { query: 'SELECT * FROM updated_query' }
        await updateFavorite(mockFavorite.id, updates)

        const favorites = await fs.readJson(favoritesPath())
        expect(favorites).toEqual([{ ...mockFavorite, ...updates }])
      })

      it('should not modify favorites if ID not found', async () => {
        await fs.writeJson(favoritesPath(), [mockFavorite])

        await updateFavorite('non-existent-id', { query: 'updated' })

        const favorites = await fs.readJson(favoritesPath())
        expect(favorites).toEqual([mockFavorite])
      })
    })
  })

  describe('Migration Tests', () => {
    const settingsPath = () => path.join(testRootDir, 'settings.json')
    const historyPath = () => path.join(testRootDir, 'history.json')

    it('should migrate history from settings.json to history.json', async () => {
      const oldSettingsWithHistory = {
        connectionString: 'postgresql://test',
        queryHistory: [
          {
            id: 'migrated-query',
            query: 'SELECT * FROM legacy',
            results: [],
            timestamp: '2025-01-01T00:00:00.000Z'
          }
        ]
      }

      await fs.writeJson(settingsPath(), oldSettingsWithHistory)

      // Trigger migration by accessing history
      const history = await getQueryHistory()

      // Verify migration occurred
      expect(history).toEqual(oldSettingsWithHistory.queryHistory)

      // Verify history file was created
      expect(await fs.pathExists(historyPath())).toBe(true)
      const historyFile = await fs.readJson(historyPath())
      expect(historyFile).toEqual(oldSettingsWithHistory.queryHistory)

      // Verify history was removed from settings
      const settings = await fs.readJson(settingsPath())
      expect(settings.queryHistory).toBeUndefined()
      expect(settings.connectionString).toBe('postgresql://test')
    })

    it('should not migrate if history.json already exists', async () => {
      const existingHistory = [
        { id: 'existing', query: 'SELECT 1', results: [], timestamp: '2025-01-01T00:00:00.000Z' }
      ]
      const settingsWithHistory = {
        connectionString: 'postgresql://test',
        queryHistory: [
          { id: 'old', query: 'SELECT 2', results: [], timestamp: '2025-01-01T00:00:00.000Z' }
        ]
      }

      await fs.writeJson(historyPath(), existingHistory)
      await fs.writeJson(settingsPath(), settingsWithHistory)

      const history = await getQueryHistory()

      // Should return existing history, not migrate
      expect(history).toEqual(existingHistory)

      // Settings should remain unchanged
      const settings = await fs.readJson(settingsPath())
      expect(settings.queryHistory).toEqual(settingsWithHistory.queryHistory)
    })
  })
})
