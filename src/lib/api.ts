import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT for admin requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('arvayo_admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname.startsWith('/admin')) {
      localStorage.removeItem('arvayo_admin_token')
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)

export default api

// ─── Public ──────────────────────────────────────────────────────────────────

export const fetchServices = () =>
  api.get('/services').then((r) => r.data)

export const fetchService = (id: number) =>
  api.get(`/services/${id}`).then((r) => r.data)

export const fetchAvailability = (date: string) =>
  api.get(`/services/availability/${date}`).then((r) => r.data)

export const createBooking = (data: unknown) =>
  api.post('/orders', data).then((r) => r.data)

export const fetchOrderByNumber = (orderNumber: string) =>
  api.get(`/orders/${orderNumber}`).then((r) => r.data)

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminLogin = (email: string, password: string) => {
  const form = new URLSearchParams()
  form.append('username', email)
  form.append('password', password)
  return api.post('/admin/auth/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  }).then((r) => r.data)
}

export const fetchMe = () =>
  api.get('/admin/auth/me').then((r) => r.data)

export const fetchMetrics = () =>
  api.get('/admin/metrics').then((r) => r.data)

export const fetchAdminOrders = (params?: Record<string, unknown>) =>
  api.get('/admin/orders', { params }).then((r) => r.data)

export const updateOrderStatus = (id: number, status: string) =>
  api.patch(`/admin/orders/${id}/status`, { status }).then((r) => r.data)

export const deleteOrder = (id: number) =>
  api.delete(`/admin/orders/${id}`)

export const fetchAdminServices = () =>
  api.get('/admin/services').then((r) => r.data)

export const createAdminService = (data: unknown) =>
  api.post('/admin/services', data).then((r) => r.data)

export const updateAdminService = (id: number, data: unknown) =>
  api.put(`/admin/services/${id}`, data).then((r) => r.data)

export const deleteAdminService = (id: number) =>
  api.delete(`/admin/services/${id}`)

export const exportOrdersCsv = () =>
  api.get('/admin/reports/export', { responseType: 'blob' }).then((r) => r.data)

export const fetchCustomers = () =>
  api.get('/admin/customers').then((r) => r.data)
