const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? 'http://127.0.0.1:8000/api'

const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api$/, '')

function getCookieValue(name) {
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
  await fetch(`${BACKEND_BASE_URL}/sanctum/csrf-cookie`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
  })
}

export async function loginRequest(payload) {
  await ensureCsrfCookie()

  return request('/login', {
    method: 'POST',
    headers: buildHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  })
}

export async function registerRequest(payload) {
  await ensureCsrfCookie()

  return request('/register', {
    method: 'POST',
    headers: buildHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(payload),
  })
}

export async function logoutRequest() {
  await ensureCsrfCookie()

  return request('/logout', {
    method: 'POST',
    headers: buildHeaders({
      'Content-Type': 'application/json',
    }),
  })
}

export async function fetchCurrentUserRequest() {
  return request('/me', {
    method: 'GET',
    headers: buildHeaders(),
  })
}
