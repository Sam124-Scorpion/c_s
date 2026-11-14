import { useEffect, useState } from 'react'
import { getCart, getMediaUrl, removeCartItem, updateCartItem } from '../services/api.js'

function Cart() {
  const hasAccessToken = Boolean(sessionStorage.getItem('accessToken'))
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(hasAccessToken)
  const [error, setError] = useState('')
  const [busyItemId, setBusyItemId] = useState(null)
  const requiresSignIn = !hasAccessToken

  useEffect(() => {
    let isCurrent = true

    if (!hasAccessToken) {
      return () => { isCurrent = false }
    }

    getCart()
      .then((data) => {
        if (isCurrent) setCart(data)
      })
      .catch((requestError) => {
        if (isCurrent) setError(requestError.message)
      })
      .finally(() => {
        if (isCurrent) setLoading(false)
      })

    return () => { isCurrent = false }
  }, [hasAccessToken])

  async function changeQuantity(item, quantity) {
    if (quantity < 1) return
    setBusyItemId(item.id)
    setError('')
    try {
      const result = await updateCartItem(item.id, quantity)
      setCart(result.cart)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyItemId(null)
    }
  }

  async function removeItem(itemId) {
    setBusyItemId(itemId)
    setError('')
    try {
      const result = await removeCartItem(itemId)
      setCart(result.cart)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyItemId(null)
    }
  }

  const items = cart?.items || []

  return (
    <section className="page-section cart-section">
      <div className="page-heading">
        <p className="eyebrow">Your picks</p>
        <h1>Your cart</h1>
        <p>Review your cakes before you make them yours.</p>
      </div>
      {loading && <p className="notice" role="status">Loading your cart…</p>}
      {!loading && requiresSignIn && (
        <div className="empty-state">
          <h2>Sign in to see your cart</h2>
          <p>Your saved cakes are waiting for you.</p>
          <a className="button button-primary" href="/login">Sign in</a>
        </div>
      )}
      {!loading && !requiresSignIn && error && (
        <p className="notice notice-error" role="alert">{error}</p>
      )}
      {!loading && !requiresSignIn && !error && items.length === 0 && (
        <div className="empty-state">
          <span aria-hidden="true">🧁</span>
          <h2>Your cart is waiting for something sweet</h2>
          <p>Browse the catalogue to discover a cake for your next celebration.</p>
          <a className="button button-primary" href="/catalogue">Browse cakes</a>
        </div>
      )}
      {!loading && !requiresSignIn && items.length > 0 && (
        <div className="cart-content">
          {error && <p className="notice notice-error" role="alert">{error}</p>}
          <div className="cart-items">
            {items.map((item) => {
              const image = getMediaUrl(item.cake_image)
              const isBusy = busyItemId === item.id
              return (
                <article className="cart-item" key={item.id}>
                  <a className="cart-item-image" href={`/cakes/${item.cake}`}>
                    {image
                      ? <img src={image} alt={item.cake_name} />
                      : <span aria-hidden="true">🍰</span>}
                  </a>
                  <div className="cart-item-details">
                    <h2><a href={`/cakes/${item.cake}`}>{item.cake_name}</a></h2>
                    <p>₹{Number(item.cake_price).toFixed(2)} each</p>
                    <button
                      className="cart-remove"
                      type="button"
                      disabled={isBusy}
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="cart-item-actions">
                    <div className="quantity-control" aria-label={`Quantity for ${item.cake_name}`}>
                      <button
                        type="button"
                        aria-label={`Decrease ${item.cake_name} quantity`}
                        disabled={isBusy || item.quantity <= 1}
                        onClick={() => changeQuantity(item, item.quantity - 1)}
                      >−</button>
                      <span aria-live="polite">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Increase ${item.cake_name} quantity`}
                        disabled={isBusy}
                        onClick={() => changeQuantity(item, item.quantity + 1)}
                      >+</button>
                    </div>
                    <strong>₹{Number(item.subtotal).toFixed(2)}</strong>
                  </div>
                </article>
              )
            })}
          </div>
          <div className="cart-summary">
            <p><span>Subtotal</span><strong>₹{Number(cart.total_price).toFixed(2)}</strong></p>
            <a className="button button-primary" href="/checkout">Continue to checkout</a>
            <a className="cart-continue" href="/catalogue">Continue shopping</a>
          </div>
        </div>
      )}
    </section>
  )
}

export default Cart
