import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createOrder, getCart, submitPaymentReference } from '../services/api.js'

function Checkout() {
  const hasAccessToken = Boolean(sessionStorage.getItem('accessToken'))
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(hasAccessToken)
  const [submitting, setSubmitting] = useState(false)
  const [referenceSubmitting, setReferenceSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [placedOrder, setPlacedOrder] = useState(null)
  const [transactionReference, setTransactionReference] = useState('')
  const [referenceError, setReferenceError] = useState('')
  const [referenceSubmitted, setReferenceSubmitted] = useState(false)
  const [qrExpanded, setQrExpanded] = useState(false)
  const [form, setForm] = useState({
    reciever_name: '',
    reciever_phone_number: '',
    delivery_address: '',
    city: '',
    delivery_date: '',
    delivery_time: '',
    special_instructions: '',
    payment_method: 'cod',
  })
  const requiresSignIn = !hasAccessToken

  useEffect(() => {
    let isCurrent = true
    if (!hasAccessToken) return () => { isCurrent = false }

    getCart()
      .then((data) => { if (isCurrent) setCart(data) })
      .catch((requestError) => { if (isCurrent) setError(requestError.message) })
      .finally(() => { if (isCurrent) setLoading(false) })

    return () => { isCurrent = false }
  }, [hasAccessToken])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const result = await createOrder(form)
      setPlacedOrder(result.order)
      setCart({ items: [], total_price: '0.00' })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReferenceSubmit(event) {
    event.preventDefault()
    setReferenceSubmitting(true)
    setReferenceError('')
    try {
      await submitPaymentReference(placedOrder.id, transactionReference)
      setReferenceSubmitted(true)
    } catch (requestError) {
      setReferenceError(requestError.message)
    } finally {
      setReferenceSubmitting(false)
    }
  }

  const items = cart?.items || []

  const UPI_ID = 'soumikdas142@axl'
  const UPI_NAME = 'Cake Shop'

  return (
    <section className="page-section checkout-section">
      <div className="page-heading">
        <p className="eyebrow">Almost there</p>
        <h1>Checkout</h1>
        <p>Choose when and where your cakes should arrive.</p>
      </div>
      {loading && <p className="notice" role="status">Loading your cart…</p>}
      {!loading && requiresSignIn && (
        <div className="empty-state">
          <h2>Sign in to checkout</h2>
          <p>Your cart and delivery details are available after you sign in.</p>
          <Link className="button button-primary" to="/login">Sign in</Link>
        </div>
      )}
      {!loading && !requiresSignIn && error && items.length === 0 && !placedOrder && (
        <p className="notice notice-error" role="alert">{error}</p>
      )}
      {!loading && !requiresSignIn && !error && items.length === 0 && !placedOrder && (
        <div className="empty-state">
          <h2>Your cart is empty</h2>
          <p>Add a cake before continuing to checkout.</p>
          <Link className="button button-secondary" to="/catalogue">Back to the cakes</Link>
        </div>
      )}

      {placedOrder && (
        <div className="order-confirmation" role="status">
          <p className="eyebrow">Order placed</p>

          <h2>Order #{placedOrder.id}</h2>

          {form.payment_method === 'upi' ? (
            <div className="upi-payment-section">
              <h3>Complete your payment</h3>

              <p>
                Pay ₹{Number(placedOrder.total_price).toFixed(2)}
                {' '}using any UPI application.
              </p>

              <div className="upi-payment-card">
                <button
                  type="button"
                  className="upi-qr-trigger"
                  onClick={() => setQrExpanded(true)}
                  aria-label="Tap to zoom QR code"
                >
                  <img
                    src="/upi-qr.png"
                    alt="Scan to pay using UPI"
                    className="upi-qr-image"
                  />
                </button>

                {qrExpanded && (
                  <div
                    className="upi-qr-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-label="UPI QR code"
                    onClick={() => setQrExpanded(false)}
                  >
                    <button
                      type="button"
                      className="upi-qr-close"
                      aria-label="Close QR code"
                      onClick={() => setQrExpanded(false)}
                    >
                      ×
                    </button>
                    <img
                      src="/upi-qr.png"
                      alt="Expanded UPI QR code"
                      className="upi-qr-modal-image"
                    />
                  </div>
                )}

                <p>
                  <strong>UPI ID:</strong> {UPI_ID}
                </p>

                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => {
                    navigator.clipboard.writeText(UPI_ID)
                  }}
                >
                  Copy UPI ID
                </button>

                <a
                  className="button button-primary"
                  href={`upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(UPI_NAME)}&am=${Number(placedOrder.total_price).toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Order ${placedOrder.id}`)}`}
                >
                  Open UPI App
                </a>
              </div>

              {!referenceSubmitted ? (
                <form
                  className="payment-reference-form"
                  onSubmit={handleReferenceSubmit}
                >
                  {referenceError && (
                    <p className="form-error" role="alert">
                      {referenceError}
                    </p>
                  )}

                  <label htmlFor="transaction-reference">
                    UTR / Transaction Reference
                  </label>

                  <input
                    id="transaction-reference"
                    value={transactionReference}
                    onChange={(event) =>
                      setTransactionReference(event.target.value)
                    }
                    minLength={6}
                    maxLength={100}
                    placeholder="Enter transaction reference"
                    required
                  />

                  <button
                    className="button button-primary"
                    type="submit"
                    disabled={referenceSubmitting}
                  >
                    {referenceSubmitting
                      ? 'Processing...'
                      : 'Confirm Payment'}
                  </button>
                </form>
              ) : (
                <div className="payment-reference-success">
                  <h3>✓ Payment marked completed!</h3>
                  <p>Your transaction reference has been accepted.</p>
                  <p>Order #{placedOrder.id} is now being processed.</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h3>Cash on Delivery selected</h3>
              <p>
                Your order is placed. Payment is due when your
                cakes arrive.
              </p>
            </div>
          )}

          <Link className="button button-primary" to="/orders">
            View my orders
          </Link>
        </div>
      )}

      {!loading && !requiresSignIn && items.length > 0 && !placedOrder && (
        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleSubmit}>
            {error && <p className="form-error" role="alert">{error}</p>}
            <fieldset>
              <legend>Delivery details</legend>
              <div className="checkout-fields">
                <label>
                  Recipient name
                  <input name="reciever_name" value={form.reciever_name} onChange={updateField} required maxLength={100} autoComplete="name" />
                </label>
                <label>
                  Phone number
                  <input name="reciever_phone_number" value={form.reciever_phone_number} onChange={updateField} required maxLength={15} type="tel" autoComplete="tel" />
                </label>
                <label className="checkout-field-wide">
                  Delivery address
                  <textarea name="delivery_address" value={form.delivery_address} onChange={updateField} required rows="3" autoComplete="street-address" />
                </label>
                <label>
                  City
                  <input name="city" value={form.city} onChange={updateField} required maxLength={50} autoComplete="address-level2" />
                </label>
                <label>
                  Delivery date
                  <input name="delivery_date" value={form.delivery_date} onChange={updateField} required type="date" min={new Date().toLocaleDateString('en-CA')} />
                </label>
                <label>
                  Delivery time
                  <input name="delivery_time" value={form.delivery_time} onChange={updateField} required type="time" />
                </label>
                <label className="checkout-field-wide">
                  Special instructions <span className="field-optional">Optional</span>
                  <textarea name="special_instructions" value={form.special_instructions} onChange={updateField} rows="3" />
                </label>
              </div>
            </fieldset>
            <fieldset className="checkout-payment">
              <legend>Payment method</legend>
              <div className="payment-options">
                <label className={form.payment_method === 'cod' ? 'payment-option selected' : 'payment-option'}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="cod"
                    checked={form.payment_method === 'cod'}
                    onChange={updateField}
                  />
                  <span><strong>Cash on delivery</strong><small>Pay when your order arrives</small></span>
                </label>
                <label className={form.payment_method === 'upi' ? 'payment-option selected' : 'payment-option'}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="upi"
                    checked={form.payment_method === 'upi'}
                    onChange={updateField}
                  />
                  <span><strong>UPI</strong><small>Submit your transaction reference after placing the order</small></span>
                </label>
              </div>
            </fieldset>
            <button className="button button-primary" type="submit" disabled={submitting}>
              {submitting ? 'Placing order…' : 'Place order'}
            </button>
          </form>
          <aside className="checkout-summary" aria-label="Order summary">
            <h2>Order summary</h2>
            <ul>
              {items.map((item) => (
                <li key={item.id}>
                  <span>{item.cake_name} <small>× {item.quantity}</small></span>
                  <strong>₹{Number(item.subtotal).toFixed(2)}</strong>
                </li>
              ))}
            </ul>
            <p className="checkout-total"><span>Total</span><strong>₹{Number(cart.total_price).toFixed(2)}</strong></p>
          </aside>
        </div>
      )}
    </section>
  )
}

export default Checkout

