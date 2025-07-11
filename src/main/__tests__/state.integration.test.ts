import fs from 'fs-extra'
import path from 'path'
import { tmpdir } from 'os'
import {
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
  createConnection,
  editConnection,
  listConnections,
  getConnection,
  deleteConnection,
  getConnectionHistory,
  addQueryToConnectionHistory,
  getConnectionFavorites,
  addConnectionFavorite,
  removeConnectionFavorite,
  getConnectionPromptExtension,
  setConnectionPromptExtension,
  getConnectionStringForConnection
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

  describe('AI Provider Settings', () => {
    const settingsPath = () => path.join(testRootDir, 'settings.json')

    describe('AI Provider', () => {
      it('should return openai as default for new installation', async () => {
        const result = await getAiProvider()
        expect(result).toBe('openai')

        // Verify settings file was created with defaults
        expect(await fs.pathExists(settingsPath())).toBe(true)
        const settings = await fs.readJson(settingsPath())
        expect(settings.aiProvider).toBe('openai')
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
        const model = 'claude-3-opus'

        await setClaudeModel(model)

        const retrieved = await getClaudeModel()
        expect(retrieved).toBe(model)

        // Verify persistence
        const settings = await fs.readJson(settingsPath())
        expect(settings.claudeModel).toBe(model)
      })
    })
  })

  describe('Connection Management', () => {
    const testConnection = {
      connectionString: 'postgresql://user:pass@localhost:5432/testdb',
      promptExtension: 'Test database with metric units'
    }

    describe('createConnection', () => {
      it('should create a new connection', async () => {
        await createConnection('test-connection', testConnection)

        const connections = await listConnections()
        expect(connections).toContain('test-connection')

        const connection = await getConnection('test-connection')
        expect(connection.connectionString).toBe(testConnection.connectionString)
        expect(connection.promptExtension).toBe(testConnection.promptExtension)
      })

      it('should initialize empty history and favorites', async () => {
        await createConnection('test-connection', testConnection)

        const history = await getConnectionHistory('test-connection')
        expect(history).toEqual([])

        const favorites = await getConnectionFavorites('test-connection')
        expect(favorites).toEqual([])
      })

      it('should fail if connection already exists', async () => {
        await createConnection('test-connection', testConnection)

        await expect(createConnection('test-connection', testConnection)).rejects.toThrow(
          "Connection 'test-connection' already exists"
        )
      })
    })

    describe('editConnection', () => {
      it('should update existing connection', async () => {
        await createConnection('test-connection', testConnection)

        const updatedConnection = {
          connectionString: 'postgresql://newuser:newpass@localhost:5432/newdb',
          promptExtension: 'Updated prompt'
        }

        await editConnection('test-connection', updatedConnection)

        const connection = await getConnection('test-connection')
        expect(connection.connectionString).toBe(updatedConnection.connectionString)
        expect(connection.promptExtension).toBe(updatedConnection.promptExtension)
      })

      it('should fail if connection does not exist', async () => {
        await expect(editConnection('non-existent', testConnection)).rejects.toThrow(
          "Connection 'non-existent' not found"
        )
      })
    })

    describe('Connection History', () => {
      const testQuery = {
        id: '123',
        query: 'SELECT * FROM users',
        results: [{ id: 1, name: 'Test' }],
        timestamp: new Date().toISOString()
      }

      beforeEach(async () => {
        await createConnection('test-connection', testConnection)
      })

      it('should add query to connection history', async () => {
        await addQueryToConnectionHistory('test-connection', testQuery)

        const history = await getConnectionHistory('test-connection')
        expect(history).toHaveLength(1)
        expect(history[0]).toMatchObject({
          id: testQuery.id,
          query: testQuery.query,
          results: testQuery.results
        })
      })

      it('should maintain max 20 queries in history', async () => {
        // Add 25 queries
        for (let i = 0; i < 25; i++) {
          await addQueryToConnectionHistory('test-connection', {
            ...testQuery,
            id: i.toString(),
            query: `SELECT ${i} FROM test`
          })
        }

        const history = await getConnectionHistory('test-connection')
        expect(history).toHaveLength(20)
        expect(history[0].id).toBe('24') // Most recent
        expect(history[19].id).toBe('5') // Oldest kept
      })
    })

    describe('Connection Favorites', () => {
      const testFavorite = {
        id: '456',
        query: 'SELECT * FROM products',
        results: [{ id: 1, name: 'Product' }],
        timestamp: new Date().toISOString()
      }

      beforeEach(async () => {
        await createConnection('test-connection', testConnection)
      })

      it('should add favorite to connection', async () => {
        await addConnectionFavorite('test-connection', testFavorite)

        const favorites = await getConnectionFavorites('test-connection')
        expect(favorites).toHaveLength(1)
        expect(favorites[0]).toMatchObject({
          id: testFavorite.id,
          query: testFavorite.query
        })
      })

      it('should remove favorite from connection', async () => {
        await addConnectionFavorite('test-connection', testFavorite)
        await removeConnectionFavorite('test-connection', testFavorite.id)

        const favorites = await getConnectionFavorites('test-connection')
        expect(favorites).toHaveLength(0)
      })
    })

    describe('Connection Prompt Extension', () => {
      beforeEach(async () => {
        await createConnection('test-connection', testConnection)
      })

      it('should get connection prompt extension', async () => {
        const prompt = await getConnectionPromptExtension('test-connection')
        expect(prompt).toBe(testConnection.promptExtension)
      })

      it('should update connection prompt extension', async () => {
        const newPrompt = 'Updated prompt extension'
        await setConnectionPromptExtension('test-connection', newPrompt)

        const prompt = await getConnectionPromptExtension('test-connection')
        expect(prompt).toBe(newPrompt)
      })

      it('should handle empty prompt extension', async () => {
        await setConnectionPromptExtension('test-connection', '')

        const prompt = await getConnectionPromptExtension('test-connection')
        expect(prompt).toBeUndefined()
      })
    })

    describe('deleteConnection', () => {
      it('should delete existing connection', async () => {
        await createConnection('test-connection', testConnection)
        await deleteConnection('test-connection')

        const connections = await listConnections()
        expect(connections).not.toContain('test-connection')

        await expect(getConnection('test-connection')).rejects.toThrow(
          "Connection 'test-connection' not found"
        )
      })

      it('should fail if connection does not exist', async () => {
        await expect(deleteConnection('non-existent')).rejects.toThrow(
          "Connection 'non-existent' not found"
        )
      })
    })
  })
})
