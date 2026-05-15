import { useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
const TOKEN_STORAGE_KEY = 'studyTogetherToken'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccessMessage('')
    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        const message = payload?.error || payload?.message || 'Login failed. Please try again.'
        throw new Error(message)
      }

      if (!payload?.token) {
        throw new Error('Login succeeded but no token was returned.')
      }

      localStorage.setItem(TOKEN_STORAGE_KEY, payload.token)
      setSuccessMessage('Login successful. Token stored in localStorage.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="content-panel" style={{ maxWidth: '480px' }}>
        <header className="page-header" style={{ marginBottom: '1rem' }}>
          <div>
            <p className="eyebrow">StudyTogether</p>
            <h1 style={{ fontSize: '2.1rem' }}>Login</h1>
            <p className="lead" style={{ marginTop: '0.4rem' }}>
              Sign in using your backend account.
            </p>
          </div>
        </header>

        <form className="feature-card" onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '0.4rem', marginBottom: '0.9rem' }}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              style={{ padding: '0.65rem', borderRadius: '0.6rem', border: '1px solid #475569' }}
            />
          </div>

          <div style={{ display: 'grid', gap: '0.4rem', marginBottom: '0.9rem' }}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              style={{ padding: '0.65rem', borderRadius: '0.6rem', border: '1px solid #475569' }}
            />
          </div>

          {error ? (
            <p style={{ color: '#fca5a5', marginBottom: '0.8rem' }}>{error}</p>
          ) : null}

          {successMessage ? (
            <p style={{ color: '#34d399', marginBottom: '0.8rem' }}>{successMessage}</p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '0.7rem 1rem',
              borderRadius: '0.7rem',
              border: 'none',
              background: '#818cf8',
              color: '#0b0f19',
              fontWeight: 700,
              cursor: isSubmitting ? 'wait' : 'pointer',
            }}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  )
}
