import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('taskgram_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    if (response.data?.data !== undefined) {
      response.data = response.data.data
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('taskgram_token')
      window.location.reload()
    }
    return Promise.reject(error.response?.data || error)
  }
)

const wrap = (promise: Promise<{ data: any }>): Promise<any> =>
  promise.then(r => r.data)

export default api

export const authApi = {
  telegramLogin: (initData: string) => wrap(api.post('/auth/telegram', { initData })),
  telegramSimpleLogin: (user: any) => wrap(api.post('/auth/telegram/simple', { user })),
}

export const usersApi = {
  getMe: () => wrap(api.get('/users/me')),
  updateProfile: (data: any) => wrap(api.put('/users/me', data)),
  getUser: (id: string) => wrap(api.get(`/users/${id}`)),
  getWorkers: (params?: any) => wrap(api.get('/users/workers', { params })),
}

export const projectsApi = {
  getAll: (params?: any) => wrap(api.get('/projects', { params })),
  getById: (id: string) => wrap(api.get(`/projects/${id}`)),
  create: (data: any) => wrap(api.post('/projects', data)),
  apply: (id: string) => wrap(api.post(`/projects/${id}/apply`)),
  accept: (id: string, workerId: string) => wrap(api.post(`/projects/${id}/accept`, { workerId })),
  updateStatus: (id: string, status: string) => wrap(api.patch(`/projects/${id}/status`, { status })),
  getMy: (role?: string) => wrap(api.get('/projects/my', { params: { role } })),
  getPopular: (type?: string) => wrap(api.get('/projects/popular', { params: { type } })),
  getLastOrders: () => wrap(api.get('/projects/last-orders')),
}

export const messagesApi = {
  send: (data: any) => wrap(api.post('/messages', data)),
  getByProject: (projectId: string) => wrap(api.get(`/messages/project/${projectId}`)),
}

export const reviewsApi = {
  create: (data: any) => wrap(api.post('/reviews', data)),
  getByProject: (projectId: string) => wrap(api.get(`/reviews/project/${projectId}`)),
  getByUser: (userId: string) => wrap(api.get(`/reviews/user/${userId}`)),
}

export const categoriesApi = {
  getAll: () => wrap(api.get('/categories')),
}

export const filesApi = {
  upload: (file: FormData, projectId?: string) => {
    const url = projectId ? `/files/upload?projectId=${projectId}` : '/files/upload'
    return wrap(api.post(url, file, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }))
  },
  getByProject: (projectId: string) => wrap(api.get(`/files/project/${projectId}`)),
}

export const subscriptionsApi = {
  getPlans: () => wrap(api.get('/subscriptions/plans')),
  activateTrial: () => wrap(api.post('/subscriptions/trial')),
  subscribeWorker: (tier: string) => wrap(api.post('/subscriptions/worker', { tier })),
  subscribeEmployer: () => wrap(api.post('/subscriptions/employer')),
}

export const notificationsApi = {
  get: (page?: number) => wrap(api.get('/notifications', { params: { page } })),
  markRead: (id: string) => wrap(api.post(`/notifications/${id}/read`)),
  markAllRead: () => wrap(api.post('/notifications/read-all')),
}

export const contactsApi = {
  request: (targetId: string, projectId?: string) => wrap(api.post('/contacts/request', { targetId, projectId })),
  approve: (id: string) => wrap(api.post(`/contacts/${id}/approve`)),
  getMy: () => wrap(api.get('/contacts/my')),
  getPending: () => wrap(api.get('/contacts/pending')),
}

export const portfolioApi = {
  getByUser: (userId: string) => wrap(api.get(`/portfolio/user/${userId}`)),
  create: (data: any) => wrap(api.post('/portfolio', data)),
  update: (id: string, data: any) => wrap(api.put(`/portfolio/${id}`, data)),
  remove: (id: string) => wrap(api.delete(`/portfolio/${id}`)),
}

export const adminApi = {
  getDashboard: () => wrap(api.get('/admin/dashboard')),
  getUsers: (page?: number, limit?: number) => wrap(api.get('/admin/users', { params: { page, limit } })),
  toggleBlock: (id: string) => wrap(api.post(`/admin/users/${id}/toggle-block`)),
  deleteProject: (id: string) => wrap(api.post(`/admin/projects/${id}/delete`)),
  getStats: () => wrap(api.get('/admin/stats')),
}
