import { useState } from 'react'
import { register } from '../services/api.js'

function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', password2: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess(false)
    if (form.password !== form.password2) {
      setError('The passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      await register(form)
      setSuccess(true)
      setForm({ username: '', email: '', password: '', password2: '' })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="page-section auth-section">
      <div className="auth-card">
        <p className="eyebrow">Join the table</p>
        <h1>Create an account</h1>
        <p className="auth-intro">Save a seat for all the sweet things to come.</p>
        <form className="form-stack" onSubmit={handleSubmit}>
          <label>
            Username
            <input name="username" autoComplete="username" required value={form.username} onChange={updateField} />
          </label>
          <label>
            Email
            <input name="email" type="email" autoComplete="email" required value={form.email} onChange={updateField} />
          </label>
          <label>
            Password
            <input name="password" type="password" autoComplete="new-password" required value={form.password} onChange={updateField} />
          </label>
          <label>
            Confirm password
            <input name="password2" type="password" autoComplete="new-password" required value={form.password2} onChange={updateField} />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          {success && <p className="form-success" role="status">Your account is ready. <a href="/login">Sign in</a>.</p>}
          <button className="button button-primary" type="submit" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="auth-switch">Already have an account? <a href="/login">Sign in</a></p>
      </div>
    </section>
  )
}

export default Register
