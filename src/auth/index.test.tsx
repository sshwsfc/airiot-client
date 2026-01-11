import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'
import * as apiModule from '../api'
import { useUser, useLogin, useUserReg, useLogout } from './index'

vi.mock('axios')
const mockedAxios = vi.mocked(axios)
vi.mock('localforage')
vi.mock('../api')
vi.mock('../hooks', () => ({
  useConfig: () => ({ config: {}, setConfig: vi.fn() }),
  useConfigValue: () => ({ settings: {} }),
  useSettings: () => ({}),
  useMessage: () => ({
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn()
  })
}))
vi.mock('crypto-js/sha1', () => ({
  default: vi.fn((input) => ({ toString: () => `hashed_${input}` }))
}))

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

describe('Auth Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  })

  describe('useUser', () => {
    it('should initialize with null user', () => {
      vi.doMock('localforage', () => ({
        getItem: vi.fn().mockResolvedValue(null)
      }))

      const { result } = renderHook(() => useUser(), { wrapper })

      expect(result.current.user).toBeNull()
    })

    it('should load user from storage', async () => {
      const mockUser = { id: 1, name: 'test' }
      vi.doMock('localforage', () => ({
        getItem: vi.fn().mockResolvedValue(mockUser)
      }))

      const { result } = renderHook(() => useUser(), { wrapper })

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
      })
    })

    it('should set user', () => {
      const { result } = renderHook(() => useUser(), { wrapper })

      const mockUser = { id: 1, name: 'test' }
      act(() => {
        result.current.setUser(mockUser)
      })

      expect(result.current.user).toEqual(mockUser)
    })
  })

  describe('useLogin', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        json: {
          id: 1,
          username: 'testuser',
          token: 'test-token',
          isAdmin: true
        },
        headers: {}
      }

      mockedAxios.mockResolvedValue(mockResponse as any)

      const mockApi = {
        fetch: vi.fn().mockResolvedValue(mockResponse)
      }

      vi.mocked(apiModule.default).mockReturnValue(mockApi as any)

      const { result } = renderHook(() => useLogin(), { wrapper })

      const loginPromise = result.current.onLogin({
        username: 'testuser',
        password: 'password123',
        verifyCode: '1234'
      })

      await expect(loginPromise).resolves.toEqual({
        needChangePwd: undefined,
        password: 'password123',
        id: 1,
        username: 'testuser'
      })

      expect(mockApi.fetch).toHaveBeenCalledWith('', {
        method: 'POST',
        body: JSON.stringify({
          verifyCode: '1234',
          username: 'testuser',
          password: 'hashed_password123'
        })
      })
    })

    it('should handle login error', async () => {
      const mockError = {
        response: {
          status: 400,
          data: { user: 'Invalid credentials' }
        }
      }

      mockedAxios.mockRejectedValue(mockError as any)

      const mockApi = {
        fetch: vi.fn().mockRejectedValue(mockError)
      }

      vi.mocked(apiModule.default).mockReturnValue(mockApi as any)

      const { result } = renderHook(() => useLogin(), { wrapper })

      const loginPromise = result.current.onLogin({
        username: 'testuser',
        password: 'wrong'
      })

      await expect(loginPromise).rejects.toEqual({
        user: 'Invalid credentials',
        FORM_ERROR: 'Invalid credentials',
        status: 400
      })
    })

    it('should require verify code when code is empty and showCode is true', async () => {
      const { result } = renderHook(() => useLogin(), { wrapper })

      act(() => {
        result.current.showCode = true
      })

      const loginPromise = result.current.onLogin({
        username: 'testuser',
        password: 'password123',
        verifyCode: ''
      })

      await expect(loginPromise).rejects.toThrow()
    })

    it('should handle OAuth redirect', async () => {
      const mockResponse = {
        json: {
          id: 1,
          username: 'testuser',
          token: 'test-token'
        },
        headers: {
          'x-oauth-redirect': '#/oAuth'
        }
      }

      mockedAxios.mockResolvedValue(mockResponse as any)

      const mockApi = {
        fetch: vi.fn().mockResolvedValue(mockResponse)
      }

      vi.mocked(apiModule.default).mockReturnValue(mockApi as any)

      const { result } = renderHook(() => useLogin(), { wrapper })

      const loginPromise = result.current.onLogin({
        username: 'testuser',
        password: 'password123'
      })

      await expect(loginPromise).resolves.toBeDefined()
    })
  })

  describe('useUserReg', () => {
    it('should register successfully', async () => {
      const mockResponse = {
        json: {
          Message: 'Registration successful'
        },
        headers: {}
      }

      mockedAxios.mockResolvedValue(mockResponse as any)

      const mockApi = {
        fetch: vi.fn().mockResolvedValue(mockResponse)
      }

      vi.mocked(apiModule.default).mockReturnValue(mockApi as any)

      const { result } = renderHook(() => useUserReg(), { wrapper })

      const regPromise = result.current.onUserReg({
        username: 'newuser',
        password: 'password123',
        email: 'test@example.com'
      })

      await expect(regPromise).resolves.toBe(true)

      expect(mockApi.fetch).toHaveBeenCalledWith('', {
        method: 'POST',
        body: JSON.stringify({
          username: 'newuser',
          password: 'hashed_password123',
          email: 'test@example.com'
        })
      })
    })

    it('should handle registration error', async () => {
      const mockError = {
        response: {
          status: 400,
          data: { error: 'Username already exists' }
        }
      }

      mockedAxios.mockRejectedValue(mockError as any)

      const mockApi = {
        fetch: vi.fn().mockRejectedValue(mockError)
      }

      vi.mocked(apiModule.default).mockReturnValue(mockApi as any)

      const { result } = renderHook(() => useUserReg(), { wrapper })

      const regPromise = result.current.onUserReg({
        username: 'existinguser',
        password: 'password123'
      })

      await expect(regPromise).rejects.toEqual(mockError)
    })
  })

  describe('useLogout', () => {
    it('should logout successfully', async () => {
      const mockResponse = {
        json: { success: true },
        headers: {}
      }

      mockedAxios.mockResolvedValue(mockResponse as any)

      const mockApi = {
        fetch: vi.fn().mockResolvedValue(mockResponse)
      }

      vi.mocked(apiModule.default).mockReturnValue(mockApi as any)

      const { result } = renderHook(() => useLogout(), { wrapper })

      act(() => {
        result.current.onLogout()
      })

      await waitFor(() => {
        expect(mockApi.fetch).toHaveBeenCalledWith('')
        expect(localStorage.length).toBe(0)
        expect(sessionStorage.length).toBe(0)
      })
    })

    it('should clear user state on logout', async () => {
      const mockUser = { id: 1, name: 'test' }

      const mockResponse = {
        json: { success: true },
        headers: {}
      }

      mockedAxios.mockResolvedValue(mockResponse as any)

      const mockApi = {
        fetch: vi.fn().mockResolvedValue(mockResponse)
      }

      vi.mocked(apiModule.default).mockReturnValue(mockApi as any)

      const { result: userResult } = renderHook(() => useUser(), { wrapper })
      const { result: logoutResult } = renderHook(() => useLogout(), { wrapper })

      act(() => {
        userResult.current.setUser(mockUser)
        logoutResult.current.onLogout()
      })

      await waitFor(() => {
        expect(userResult.current.user).toBeNull()
      })
    })
  })
})
