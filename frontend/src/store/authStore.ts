import { create } from 'zustand'
import { authApi, usersApi } from '../services/api'
import { getInitData } from '../services/telegram'

interface User {
  id: string
  telegramId: string
  username?: string
  firstName?: string
  lastName?: string
  photoUrl?: string
  phone?: string
  role: string
  description?: string
  skills: string[]
  rating: number
  completedProjects: number
  activeProjects: number
  reviewsCount: number
  isPremium: boolean
  premiumExpiresAt?: string
  subscriptionTier: string
  employerTier: string
  isAdmin: boolean
  trialUsed?: boolean
  createdAt: string
}

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  initialize: () => Promise<void>
  login: () => Promise<void>
  logout: () => void
  updateUser: (data: Partial<User>) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  error: null,

  initialize: async () => {
    const token = localStorage.getItem('taskgram_token')
    if (token) {
      try {
        const user = await usersApi.getMe()
        set({ user, loading: false })
      } catch {
        localStorage.removeItem('taskgram_token')
        set({ loading: false })
      }
    } else {
      set({ loading: false })
    }
  },

  login: async () => {
    try {
      set({ loading: true, error: null })
      const initData = getInitData()
      if (!initData) {
        set({ error: 'Telegram not available', loading: false })
        return
      }
      const { accessToken, user } = await authApi.telegramLogin(initData)
      localStorage.setItem('taskgram_token', accessToken)
      set({ user, loading: false })
    } catch (err: any) {
      set({ error: err.message || 'Login failed', loading: false })
    }
  },

  logout: () => {
    localStorage.removeItem('taskgram_token')
    set({ user: null })
  },

  updateUser: (data) => {
    const current = get().user
    if (current) {
      set({ user: { ...current, ...data } })
    }
  },
}))
