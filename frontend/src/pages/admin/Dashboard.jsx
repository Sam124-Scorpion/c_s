import { useEffect, useState } from 'react'
import { getAdminCakes, getAdminOrders } from '../../services/api.js'

function Dashboard() {
  const [summary, setSummary] = useState({ cakes: 0, orders: 0, pending: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrent = true
    Promise.all([getAdminCakes(), getAdminOrders()])
      .then(([cakeData, orderData]) => {
        const cakes = Array.isArray(cakeData) ? cakeData : cakeData.results || []
        const orders = Array.isArray(orderData) ? orderData : orderData.results || []
        if (isCurrent) {
          setSummary({
            cakes: cakes.length,
            orders: orders.length,
            pending: orders.filter((order) => order.status === 'pending').length,
          })
        }
      })
      .catch((requestError) => { if (isCurrent) setError(requestError.message) })
      .finally(() => { if (isCurrent) setLoading(false) })
    return () => { isCurrent = false }
  }, [])

  return (
    <div>
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">Sweet Crumbs administration</p>
          <h1>Shop overview</h1>
        </div>
        <a className="admin-outline-button" href="/catalogue">View storefront ↗</a>
      </div>
      {error && <p className="admin-error" role="alert">{error}</p>}
      <div className="admin-stat-grid">
        <article className="admin-stat-card"><span>Total cakes</span><strong>{loading ? '—' : summary.cakes}</strong><a href="/admin/cakes">Manage cakes →</a></article>
        <article className="admin-stat-card"><span>Consumer orders</span><strong>{loading ? '—' : summary.orders}</strong><a href="/admin/orders">Manage orders →</a></article>
        <article className="admin-stat-card"><span>Pending orders</span><strong>{loading ? '—' : summary.pending}</strong><span className="admin-stat-caption">Awaiting processing</span></article>
      </div>
      <div className="admin-welcome-card">
        <p className="eyebrow">A good place to start</p>
        <h2>Keep your cake counter fresh.</h2>
        <p>Update cakes and review consumer orders from one place.</p>
        <div className="admin-quick-links">
          <a className="admin-primary-button" href="/admin/cakes">Manage cakes</a>
          <a className="admin-outline-button" href="/admin/orders">Manage orders</a>
        </div>
      </div>
    </div>
  )
}

export default Dashboard