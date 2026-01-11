import { describe, it, expect, beforeEach, vi } from 'vitest'
import axios from 'axios'
import { createAPI, setContext, getContext, type APIOptions } from '../api'

vi.mock('axios')
const mockedAxios = vi.mocked(axios)

describe('API Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setContext({})
  })

  describe('createAPI', () => {
    it('should create API instance with resource', () => {
      const options: APIOptions = { resource: 'test' }
      const api = createAPI(options)

      expect(api).toBeDefined()
      expect(api.resource).toBe('test')
      expect(api.host).toBe('/rest/')
    })

    it('should throw error when resource is undefined', () => {
      expect(() => createAPI({} as APIOptions)).toThrow('api option resource is undefined')
    })

    it('should use custom proxyKey as host', () => {
      const options: APIOptions = { resource: 'test', proxyKey: '/api/' }
      const api = createAPI(options)

      expect(api.host).toBe('/api/')
    })

    it('should convert auth resource to core/auth', () => {
      const options: APIOptions = { resource: 'auth/login' }
      const api = createAPI(options)

      expect(api.resource).toBe('core/auth/login')
    })
  })

  describe('Context Management', () => {
    it('should set and get context', () => {
      const testContext = {
        user: { token: 'test-token' },
        language: 'en',
        settings: { safeRequest: true }
      }

      setContext(testContext)
      const context = getContext()

      expect(context).toEqual(testContext)
    })

    it('should merge context when setting', () => {
      setContext({ user: { token: 'token1' } })
      setContext({ language: 'zh' })

      const context = getContext()
      expect(context.user).toEqual({ token: 'token1' })
      expect(context.language).toBe('zh')
    })
  })

  describe('API.fetch', () => {
    it('should make GET request and return response', async () => {
      const mockResponse = { data: { id: 1, name: 'test' }, headers: {} }
      mockedAxios.mockResolvedValue(mockResponse as any)

      const api = createAPI({ resource: 'test' })
      const result = await api.fetch('/1')

      expect(result.json).toEqual({ id: 1, name: 'test' })
      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'GET',
        url: '/rest/test/1',
        headers: expect.any(Object),
        data: undefined
      })
    })

    it('should make POST request', async () => {
      const mockResponse = { data: { success: true }, headers: {} }
      mockedAxios.mockResolvedValue(mockResponse as any)

      const api = createAPI({ resource: 'test' })
      const result = await api.fetch('', { method: 'POST', body: '{"name":"test"}' })

      expect(result.json).toEqual({ success: true })
      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'POST',
        url: '/rest/test',
        headers: expect.any(Object),
        data: '{"name":"test"}'
      })
    })

    it('should handle errors and throw with status', async () => {
      const error = {
        response: {
          status: 404,
          data: { error: 'Not found' }
        }
      }
      mockedAxios.mockRejectedValue(error as any)

      const api = createAPI({ resource: 'test' })

      await expect(api.fetch('/invalid')).rejects.toEqual({
        json: { error: 'Not found' },
        status: 404
      })
    })

    it('should remove Authorization header for login', async () => {
      setContext({ user: { token: 'test-token' } })
      const mockResponse = { data: { token: 'new-token' }, headers: {} }
      mockedAxios.mockResolvedValue(mockResponse as any)

      const api = createAPI({ resource: 'auth/login' })
      await api.fetch('', { method: 'POST', body: '{}' })

      const callArgs = mockedAxios.mock.calls[0][0] as any
      expect(callArgs.headers.Authorization).toBeUndefined()
    })

    it('should add Authorization header when user has token', async () => {
      setContext({ user: { token: 'test-token' } })
      const mockResponse = { data: { id: 1 }, headers: {} }
      mockedAxios.mockResolvedValue(mockResponse as any)

      const api = createAPI({ resource: 'test' })
      await api.fetch('/1')

      const callArgs = mockedAxios.mock.calls[0][0] as any
      expect(callArgs.headers.Authorization).toBe('test-token')
    })

    it('should add custom headers', async () => {
      const mockResponse = { data: { id: 1 }, headers: {} }
      mockedAxios.mockResolvedValue(mockResponse as any)

      const api = createAPI({ resource: 'test', headers: { 'X-Custom': 'value' } })
      await api.fetch('/1')

      const callArgs = mockedAxios.mock.calls[0][0] as any
      expect(callArgs.headers['X-Custom']).toBe('value')
    })
  })

  describe('API.get', () => {
    it('should get single item by id', async () => {
      const mockResponse = { data: { id: '1', name: 'test' }, headers: {} }
      mockedAxios.mockResolvedValue(mockResponse as any)

      const api = createAPI({ resource: 'test' })
      const result = await api.get('1')

      expect(result).toEqual({ id: '1', name: 'test' })
    })

    it('should get without id', async () => {
      const mockResponse = { data: { items: [] }, headers: {} }
      mockedAxios.mockResolvedValue(mockResponse as any)

      const api = createAPI({ resource: 'test' })
      const result = await api.get()

      expect(result).toEqual({ items: [] })
    })
  })

  describe('API.query', () => {
    it('should query with filter', async () => {
      const mockResponse = { data: { items: [{ id: 1 }], total: 1 }, headers: {} }
      mockedAxios.mockResolvedValue(mockResponse as any)

      const api = createAPI({ resource: 'test' })
      const result = await api.query({ name: 'test' })

      expect(result.items).toEqual([{ id: 1 }])
      expect(result.total).toBe(1)
    })

    it('should query with empty filter', async () => {
      const mockResponse = { data: { items: [], total: 0 }, headers: {} }
      mockedAxios.mockResolvedValue(mockResponse as any)

      const api = createAPI({ resource: 'test' })
      const result = await api.query()

      expect(result.items).toEqual([])
      expect(result.total).toBe(0)
    })
  })

  describe('API.save', () => {
    it('should save new item', async () => {
      const mockResponse = { data: { id: '1', name: 'new' }, headers: {} }
      mockedAxios.mockResolvedValue(mockResponse as any)

      const api = createAPI({ resource: 'test' })
      const result = await api.save({ name: 'new' })

      expect(result).toEqual({ id: '1', name: 'new' })
    })

    it('should save existing item', async () => {
      const mockResponse = { data: { id: '1', name: 'updated' }, headers: {} }
      mockedAxios.mockResolvedValue(mockResponse as any)

      const api = createAPI({ resource: 'test' })
      const result = await api.save({ id: '1', name: 'updated' })

      expect(result).toEqual({ id: '1', name: 'updated' })
    })

    it('should save partial data', async () => {
      const mockResponse = { data: { id: '1', name: 'updated' }, headers: {} }
      mockedAxios.mockResolvedValue(mockResponse as any)

      const api = createAPI({ resource: 'test' })
      const result = await api.save({ id: '1', name: 'updated' }, true)

      expect(result).toEqual({ id: '1', name: 'updated' })
    })
  })

  describe('API.delete', () => {
    it('should delete item by id', async () => {
      const mockResponse = { data: { success: true }, headers: {} }
      mockedAxios.mockResolvedValue(mockResponse as any)

      const api = createAPI({ resource: 'test' })
      const result = await api.delete('1')

      expect(result).toEqual({ success: true })
    })

    it('should delete without id', async () => {
      const mockResponse = { data: { success: true }, headers: {} }
      mockedAxios.mockResolvedValue(mockResponse as any)

      const api = createAPI({ resource: 'test' })
      const result = await api.delete()

      expect(result).toEqual({ success: true })
    })
  })

  describe('API.convert_format', () => {
    it('should convert datetime format', () => {
      const api = createAPI({ resource: 'test' })
      const result = api.convert_format('2024-01-15T10:30:00Z', { format: 'datetime' })

      expect(result).toContain('2024-01-15')
      expect(result).toContain(':')
    })

    it('should convert date format', () => {
      const api = createAPI({ resource: 'test' })
      const result = api.convert_format('2024-01-15T10:30:00Z', { format: 'date' })

      expect(result).toBe('2024-01-15')
    })

    it('should convert array format', () => {
      const api = createAPI({ resource: 'test' })
      const result = api.convert_format([{ name: 'test' }], {
        type: 'array',
        items: { format: 'datetime' }
      })

      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('API.convert_item', () => {
    it('should convert item using properties', () => {
      const api = createAPI({
        resource: 'test',
        properties: {
          date: { format: 'date' },
          name: {}
        }
      })

      const result = api.convert_item({ date: '2024-01-15T10:30:00Z', name: 'test' })

      expect(result.date).toBe('2024-01-15')
      expect(result.name).toBe('test')
    })
  })

  describe('API.convert_where', () => {
    it('should convert where clause', () => {
      const api = createAPI({ resource: 'test' })
      const result = api.convert_where({ param_filter: { name: 'test' } })

      expect(result).toBeDefined()
    })

    it('should convert empty where clause', () => {
      const api = createAPI({ resource: 'test' })
      const result = api.convert_where({})

      expect(result).toEqual({})
    })
  })

  describe('API.count', () => {
    it('should return count', async () => {
      const mockResponse = { data: { items: [{ id: 1 }, { id: 2 }], total: 2 }, headers: {} }
      mockedAxios.mockResolvedValue(mockResponse as any)

      const api = createAPI({ resource: 'test' })
      const count = await api.count()

      expect(count).toBe(2)
    })
  })
})
