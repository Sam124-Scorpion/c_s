import { useEffect, useState } from 'react'
import { getMyOrders } from '../services/api.js'

function MyOrders() {
  const hasAccessToken = Boolean(sessionStorage.getItem('accessToken'))
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(hasAccessToken)
  const [error, setError] = useState('')
  const requiresSignIn = !hasAccessToken

  useEffect(() => {
    let isCurrent = true
    if (!hasAccessToken) return () => { isCurrent = false }

    getMyOrders()
      .then((data) => { if (isCurrent) setOrders(Array.isArray(data) ? data : []) })
      .catch((requestError) => { if (isCurrent) setError(requestError.message) })
      .finally(() => { if (isCurrent) setLoading(false) })

    return () => { isCurrent = false }
  }, [hasAccessToken])

  function formatDate(value) {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`))
  }

  function formatStatus(value) {
    return value.charAt(0).toUpperCase() + value.slice(1)
  }

  return (
    <section className="page-section orders-section">
      <div className="page-heading">
        <p className="eyebrow">The good things you ordered</p>
        <h1>My orders</h1>
        <p>Keep track of your cake orders and delivery details.</p>
      </div>
      {loading && <p className="notice" role="status">Loading your orders…</p>}
      {!loading && requiresSignIn && (
        <div className="empty-state">
          <h2>Sign in to view your orders</h2>
          <p>Your order history is linked to your account.</p>
          <a className="button button-primary" href="/login">Sign in</a>
        </div>
      )}
      {!loading && !requiresSignIn && error && (
        <p className="notice notice-error" role="alert">{error}</p>
      )}
      {!loading && !requiresSignIn && !error && orders.length === 0 && (
        <div className="empty-state">
          <span aria-hidden="true">📦</span>
          <h2>No orders yet</h2>
          <p>Your next celebration cake is just a browse away.</p>
          <a className="button button-primary" href="/catalogue">Explore the cakes</a>
        </div>
      )}
      {!loading && !requiresSignIn && !error && orders.length > 0 && (
        <div className="order-list">
          {orders.map((order) => (
            <article className="order-entry" key={order.id}>
              <header className="order-entry-header">
                <div>
                  <p className="eyebrow">Order #{order.id}</p>
                  <p className="order-date">Placed {formatDate(order.created_at.slice(0, 10))}</p>
                </div>
                <span className={`order-status order-status-${order.status}`}>{formatStatus(order.status)}</span>
              </header>
              <ul className="order-lines">
                {order.items.map((item) => (
                  <li key={item.id}>
                    <span>{item.cake_name} <small>× {item.quantity}</small></span>
                    <strong>₹{Number(item.line_total).toFixed(2)}</strong>
                  </li>
                ))}
              </ul>
              <div className="order-entry-details">
                <p><span>Delivery</span>{formatDate(order.delivery_date)} at {order.delivery_time.slice(0, 5)}</p>
                <p><span>To</span>{order.reciever_name}, {order.city}</p>
                <p><span>Payment</span>{formatStatus(order.payment_status)}</p>
                <strong>Total ₹{Number(order.total_price).toFixed(2)}</strong>
              </div>
              {order.special_instructions && <p className="order-instructions">{order.special_instructions}</p>}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default MyOrders
