const defaultHost =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8000/api'
    : 'http://127.0.0.1:8000/api'

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? defaultHost

const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api$/, '')

function getCookieValue(name) {
  if (typeof document === 'undefined') return null

  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`))

  if (!cookie) {
    return null
  }

  return decodeURIComponent(cookie.slice(name.length + 1))
}

function buildHeaders(extraHeaders = {}) {
  const headers = {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...extraHeaders,
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const csrfToken = getCookieValue('XSRF-TOKEN')
  if (csrfToken) {
    headers['X-XSRF-TOKEN'] = csrfToken
  }

  return headers
}

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      data?.errors?.[0] ||
      'Something went wrong. Please try again.'

    const error = new Error(message)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
  })

  return parseResponse(response)
}

export async function ensureCsrfCookie() {
  try {
    await fetch(`${BACKEND_BASE_URL}/sanctum/csrf-cookie`, {
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
  } catch (err) {
    // Non-blocking fallback for token-based auth
  }
}

export async function loginRequest(payload) {
  await ensureCsrfCookie()

  const response = await request('/login', {
    method: 'POST',
    headers: buildHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  })

  const token = response.token || response.access_token
  if (token) {
    localStorage.setItem('auth_token', token)
  }
  if (response.user) {
    localStorage.setItem('auth_user', JSON.stringify(response.user))
  }

  return response
}

export async function registerRequest(payload) {
  await ensureCsrfCookie()

  const response = await request('/register', {
    method: 'POST',
    headers: buildHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  })

  const token = response.token || response.access_token
  if (token) {
    localStorage.setItem('auth_token', token)
  }
  if (response.user) {
    localStorage.setItem('auth_user', JSON.stringify(response.user))
  }

  return response
}

export async function logoutRequest() {
  try {
    await ensureCsrfCookie()
    await request('/logout', {
      method: 'POST',
      headers: buildHeaders({
        'Content-Type': 'application/json',
      }),
    })
  } finally {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }
}

export async function fetchCurrentUserRequest() {
  const response = await request('/me', {
    method: 'GET',
    headers: buildHeaders(),
  })

  if (response.user) {
    localStorage.setItem('auth_user', JSON.stringify(response.user))
  }

  return response
}

export async function fetchUserOrdersRequest(userId, email) {
  const queryParams = new URLSearchParams()
  if (userId) queryParams.set('user_id', userId)
  if (email) queryParams.set('email', email)

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''
  const response = await request(`/user/orders${queryString}`, {
    method: 'GET',
    headers: buildHeaders(),
  })

  return response
}

