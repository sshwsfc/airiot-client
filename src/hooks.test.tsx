import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import api from './api'
import { useConfig, useSetConfig, useConfigValue, useMessage, useSettings } from './hooks'

vi.mock('./api', () => ({
  default: vi.fn()
}))

const mockedApi = vi.mocked(api)

describe('Hooks Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useConfig', () => {
    it('should return config state and setter', () => {
      const { result } = renderHook(() => useConfig())

      expect(result.current).toBeDefined()
      expect(Array.isArray(result.current)).toBe(true)
      expect(result.current.length).toBe(2)
    })

    it('should update config value', () => {
      const { result } = renderHook(() => useConfig())

      act(() => {
        const [, setConfig] = result.current
        setConfig({ test: 'value' })
      })

      const [config] = result.current
      expect(config.test).toBe('value')
    })

    it('should merge config updates', () => {
      const { result } = renderHook(() => useConfig())

      act(() => {
        const [, setConfig] = result.current
        setConfig({ key1: 'value1' })
      })

      act(() => {
        const [, setConfig] = result.current
        setConfig({ key2: 'value2' })
      })

      const [config] = result.current
      expect(config.key1).toBe('value1')
      expect(config.key2).toBe('value2')
    })
  })

  describe('useSetConfig', () => {
    it('should return setConfig function', () => {
      const { result } = renderHook(() => useSetConfig())

      expect(result.current).toBeDefined()
      expect(typeof result.current).toBe('function')
    })

    it('should update config atom', () => {
      const { result: setConfigResult } = renderHook(() => useSetConfig())
      const { result: configResult } = renderHook(() => useConfig())

      act(() => {
        setConfigResult.current({ testKey: 'testValue' })
      })

      const [config] = configResult.current
      expect(config.testKey).toBe('testValue')
    })
  })

  describe('useConfigValue', () => {
    it('should return config value', () => {
      const { result } = renderHook(() => useConfig())

      act(() => {
        const [, setConfig] = result.current
        setConfig({ test: 'value' })
      })

      const { result: valueResult } = renderHook(() => useConfigValue())
      const configValue = valueResult.current

      expect(configValue.test).toBe('value')
    })

    it('should return empty object initially', () => {
      const { result } = renderHook(() => useConfigValue())

      expect(result.current).toEqual({})
    })
  })

  describe('useMessage', () => {
    it('should return message functions', () => {
      const { result } = renderHook(() => useMessage())

      expect(result.current).toBeDefined()
      expect(result.current.info).toBeDefined()
      expect(result.current.success).toBeDefined()
      expect(result.current.error).toBeDefined()
    })

    it('should have info function', () => {
      const { result } = renderHook(() => useMessage())

      expect(typeof result.current.info).toBe('function')
    })

    it('should have success function', () => {
      const { result } = renderHook(() => useMessage())

      expect(typeof result.current.success).toBe('function')
    })

    it('should have error function', () => {
      const { result } = renderHook(() => useMessage())

      expect(typeof result.current.error).toBe('function')
    })

    it('should not throw when calling info', () => {
      const { result } = renderHook(() => useMessage())

      expect(() => {
        result.current.info('Test message')
      }).not.toThrow()
    })

    it('should not throw when calling success', () => {
      const { result } = renderHook(() => useMessage())

      expect(() => {
        result.current.success('Success message')
      }).not.toThrow()
    })

    it('should not throw when calling error', () => {
      const { result } = renderHook(() => useMessage())

      expect(() => {
        result.current.error('Error message')
      }).not.toThrow()
    })
  })

  describe('useSettings', () => {
    it('should call api with correct name', async () => {
      const mockResponse = { json: { setting1: 'value1' }, headers: {} }
      mockedApi.mockReturnValue({
        fetch: vi.fn().mockResolvedValue(mockResponse)
      } as any)

      const { useSettings } = require('./index')

      const settingsPromise = useSettings()

      await expect(settingsPromise).resolves.toEqual({ setting1: 'value1' })
      expect(mockedApi).toHaveBeenCalledWith({ name: 'core/setting' })
    })

    it('should return empty object when api fails', async () => {
      mockedApi.mockReturnValue({
        fetch: vi.fn().mockRejectedValue(new Error('API Error'))
      } as any)

      const { useSettings } = require('./index')

      const settingsPromise = useSettings()

      await expect(settingsPromise).rejects.toThrow()
    })

    it('should return empty object when response is null', async () => {
      mockedApi.mockReturnValue({
        fetch: vi.fn().mockResolvedValue({ json: null, headers: {} })
      } as any)

      const { useSettings } = require('./index')

      const settingsPromise = useSettings()

      await expect(settingsPromise).resolves.toEqual({})
    })
  })
})
