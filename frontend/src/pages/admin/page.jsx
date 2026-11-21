import './admin.css'
import { Link } from 'react-router-dom'
import Dashboard from './Dashboard.jsx'
import ManageCakes from './ManageCakes.jsx'
import ManageOrders from './ManageOrders.jsx'

const sections = [
  { label: 'Overview', path: '/admin' },
  { label: 'Cakes', path: '/admin/cakes' },
  { label: 'Orders', path: '/admin/orders' },
]

function AdminPage({ path, authStatus }) {
  const selectedPath = path.replace(/\/+$/, '') || '/admin'
  if (authStatus === 'loading') {
    return (
      <div className="admin-access-shell">
        <section className="admin-access-card" aria-live="polite">
          <span className="admin-access-icon" aria-hidden="true">…</span>
          <h1>Checking access</h1>
          <p>Verifying your account permissions.</p>
        </section>
      </div>
    )
  }

  if (authStatus !== 'superuser') {
    const isSignedIn = authStatus === 'consumer'
    return (
      <div className="admin-access-shell">
        <section className="admin-access-card" role="alert">
          <span className="admin-access-icon" aria-hidden="true">🔒</span>
          <p className="eyebrow">Administrator access</p>
          <h1>{isSignedIn ? 'Superuser access only' : 'Sign in to continue'}</h1>
          <p>
            {isSignedIn
              ? 'This account is a customer account. Only the shop superuser can access management.'
              : authStatus === 'error'
                ? 'We could not verify your account right now. Please try signing in again.'
                : 'You need to sign in before you can access shop management.'}
          </p>
          <div className="admin-access-actions">
            {isSignedIn
              ? <Link className="admin-primary-button" to="/">Go to storefront</Link>
              : <>
                  <Link className="admin-primary-button" to={`/login?next=${encodeURIComponent(selectedPath)}`}>
                    Sign in
                  </Link>
                  <Link className="admin-outline-button" to="/">Back to storefront</Link>
                </>}
          </div>
        </section>
      </div>
    )
  }

  let content
  if (selectedPath === '/admin/cakes') content = <ManageCakes />
  else if (selectedPath === '/admin/orders') content = <ManageOrders />
  else content = <Dashboard />

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <p className="admin-sidebar-label">Shop management</p>
        <nav aria-label="Administration">
          {sections.map((section) => (
            <Link
              className={selectedPath === section.path ? 'selected' : ''}
              to={section.path}
              key={section.path}
            >
              {section.label}
            </Link>
          ))}
        </nav>
        <Link className="admin-back-link" to="/">← Back to shop</Link>
      </aside>
      <section className="admin-content">{content}</section>
    </div>
  )
}

export default AdminPage
