const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
const TOKEN_STORAGE_KEY = 'studyTogetherToken'

function parseErrorMessage(payload) {
  if (!payload || typeof payload !== 'object') {
    return null
  }
  return payload.error || payload.message || null
}

export async function loginUser(credentials) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message = parseErrorMessage(payload) || 'Login failed. Please try again.'
    throw new Error(message)
  }

  if (!payload?.token) {
    throw new Error('Login succeeded but no token was returned.')
  }

  return payload
}

export async function registerUser(userData) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message = parseErrorMessage(payload) || 'Registration failed. Please try again.'
    throw new Error(message)
  }

  return payload
}

export function saveToken(token) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function getToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}
