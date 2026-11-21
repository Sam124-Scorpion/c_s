import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../services/api.js'

function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const tokens = await login({ username, password })
      sessionStorage.setItem('accessToken', tokens.access)
      if (tokens.refresh) sessionStorage.setItem('refreshToken', tokens.refresh)
      window.dispatchEvent(new Event('authchange'))
      const next = new URLSearchParams(window.location.search).get('next')
      const nextUrl = next ? new URL(next, window.location.origin) : null
      const destination = nextUrl?.origin === window.location.origin
        ? `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`
        : '/profile'
      navigate(destination)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="page-section auth-section">
      <div className="auth-card">
        <p className="eyebrow">Welcome back</p>
        <h1>Sign in</h1>
        <p className="auth-intro">Sign in to your Ankita's Homebake account.</p>
        <form className="form-stack" onSubmit={handleSubmit}>
          <label>
            Username
            <input autoComplete="username" required value={username} onChange={(event) => setUsername(event.target.value)} />
          </label>
          <label>
            Password
            <input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-primary" type="submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="auth-switch">New here? <Link to="/register">Create an account</Link></p>
      </div>
    </section>
  )
}

export default Login
