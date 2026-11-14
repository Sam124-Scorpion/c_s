import { useEffect, useState } from 'react'
import { getCake, getMediaUrl } from '../services/api.js'

function CakeDetails({ cakeId }) {
  const [cake, setCake] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrent = true
    getCake(cakeId)
      .then((data) => { if (isCurrent) setCake(data) })
      .catch((requestError) => { if (isCurrent) setError(requestError.message) })
      .finally(() => { if (isCurrent) setLoading(false) })
    return () => { isCurrent = false }
  }, [cakeId])

  if (loading) return <section className="page-section"><p className="notice">Loading cake…</p></section>
  if (error) return <section className="page-section"><p className="notice notice-error" role="alert">{error}</p></section>
  if (!cake) return <section className="page-section"><p className="notice">Cake not found.</p></section>

  const primaryImage = cake.images?.find((image) => image.is_primary) || cake.images?.[0]
  const imageUrl = getMediaUrl(primaryImage?.image)

  return (
    <section className="page-section detail-layout">
      <div className="detail-image">
        {imageUrl ? <img src={imageUrl} alt={cake.name} /> : <span aria-hidden="true">🍰</span>}
      </div>
      <div className="detail-copy">
        <p className="eyebrow">{cake.category?.name || 'Freshly baked'}</p>
        <h1>{cake.name}</h1>
        <p>{cake.description || 'A delicious treat, baked fresh for your celebration.'}</p>
        <p className="detail-price">₹{Number(cake.price).toFixed(2)}</p>
        <p className="stock-note">
          {cake.stock > 0 ? `${cake.stock} available` : 'Currently out of stock'}
        </p>
        <a className="button button-primary" href="/catalogue">Browse more cakes</a>
        <p className="detail-hint">Cart and ordering services are not connected yet.</p>
      </div>
    </section>
  )
}

export default CakeDetails
