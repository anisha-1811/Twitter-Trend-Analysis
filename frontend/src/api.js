const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export function getToken() {
  return localStorage.getItem('token')
}
export function setToken(token) {
  localStorage.setItem('token', token)
}
export function clearToken() {
  localStorage.removeItem('token')
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Something went wrong')
  }
  return res.json()
}

export const api = {
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request('/me'),
  topics: () => request('/topics'),
}
