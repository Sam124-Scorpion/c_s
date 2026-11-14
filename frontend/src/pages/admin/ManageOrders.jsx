import { useEffect, useState } from 'react'
import { getAdminOrders, updateAdminOrder } from '../../services/api.js'

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
const paymentStatuses = ['pending', 'paid', 'failed']

function ManageOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    let isCurrent = true
    getAdminOrders()
      .then((data) => {
        if (isCurrent) setOrders(Array.isArray(data) ? data : data.results || [])
      })
      .catch((requestError) => { if (isCurrent) setError(requestError.message) })
      .finally(() => { if (isCurrent) setLoading(false) })
    return () => { isCurrent = false }
  }, [])

  async function updateOrder(orderId, changes) {
    const oldOrder = orders.find((order) => order.id === orderId)
    if (!oldOrder) return
    setUpdatingId(orderId)
    setError('')
    try {
      const updatedOrder = await updateAdminOrder(orderId, changes)
      setOrders((current) => current.map((order) => (
        order.id === orderId ? updatedOrder : order
      )))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setUpdatingId(null)
    }
  }

  function formatDate(date) {
    return new Date(`${date}T00:00:00`).toLocaleDateString()
  }

  return (
    <div>
      <div className="admin-page-heading">
        <div><p className="eyebrow">Consumer fulfilment</p><h1>Manage orders</h1></div>
      </div>
      {error && <p className="admin-error" role="alert">{error}</p>}
      <section className="admin-list-card">
        <h2>Consumer orders <span>{orders.length}</span></h2>
        {loading
          ? <p className="admin-muted">Loading orders…</p>
          : orders.length === 0
            ? <div className="admin-empty-orders"><span aria-hidden="true">📦</span><p>No consumer orders have been placed yet.</p></div>
            : <div className="admin-order-list">
                {orders.map((order) => (
                  <article className="admin-order-card" key={order.id}>
                    <div className="admin-order-heading">
                      <div>
                        <span className="admin-order-number">Order #{order.id}</span>
                        <small>Placed {new Date(order.created_at).toLocaleString()}</small>
                      </div>
                      <strong>${Number(order.total_price).toFixed(2)}</strong>
                    </div>
                    <div className="admin-order-details">
                      <div>
                        <strong>{order.reciever_name}</strong>
                        <span>Account: {order.username}</span>
                        <span>{order.reciever_phone_number}</span>
                        <span>{order.delivery_address}, {order.city}</span>
                        <span>Delivery: {formatDate(order.delivery_date)} at {order.delivery_time}</span>
                      </div>
                      <div className="admin-order-items">
                        <strong>Items</strong>
                        {order.items.map((item) => (
                          <span key={item.id}>
                            {item.quantity} × {item.cake_name} — ${Number(item.line_total).toFixed(2)}
                          </span>
                        ))}
                        {order.special_instructions && <small>Note: {order.special_instructions}</small>}
                      </div>
                    </div>
                    <div className="admin-order-controls">
                      <label>
                        Order status
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(event) => updateOrder(order.id, { status: event.target.value })}
                        >
                          {statuses.map((status) => <option value={status} key={status}>{status}</option>)}
                        </select>
                      </label>
                      <label>
                        Payment
                        <select
                          value={order.payment_status}
                          disabled={updatingId === order.id}
                          onChange={(event) => updateOrder(order.id, { payment_status: event.target.value })}
                        >
                          {paymentStatuses.map((status) => <option value={status} key={status}>{status}</option>)}
                        </select>
                      </label>
                      {updatingId === order.id && <span className="admin-muted">Saving…</span>}
                    </div>
                  </article>
                ))}
              </div>}
      </section>
    </div>
  )
}

export default ManageOrders