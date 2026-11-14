import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { addToCart as addCakeToCart, getCakes, getMediaUrl } from '../services/api.js'

function Catalogue() {
  const [cakes, setCakes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addingCakeId, setAddingCakeId] = useState(null)

  async function addToCart(cake) {
    setAddingCakeId(cake.id)
    try {
      const result = await addCakeToCart(cake.id)
      toast.success(result?.message || `${cake.name} added to your cart.`)
    } catch (requestError) {
      toast.error(requestError.message || 'Unable to add this cake to your cart.')
    } finally {
      setAddingCakeId(null)
    }
  }

  useEffect(() => {
    let isCurrent = true
    getCakes()
      .then((data) => {
        if (isCurrent) setCakes(Array.isArray(data) ? data : data.results || [])
      })
      .catch((requestError) => {
        if (isCurrent) setError(requestError.message)
      })
      .finally(() => {
        if (isCurrent) setLoading(false)
      })
    return () => { isCurrent = false }
  }, [])

  return (
    <section className="page-section">
      <div className="page-heading">
        <p className="eyebrow">The cake counter</p>
        <h1>Find your new favourite</h1>
        <p>Browse our selection of celebration-ready cakes.</p>
      </div>
      {loading && <p className="notice">Loading cakes…</p>}
      {error && <p className="notice notice-error" role="alert">{error}. Please try again later.</p>}
      {!loading && !error && cakes.length === 0 && (
        <p className="notice">No cakes are available just yet. Please check back soon.</p>
      )}
      <div className="cake-grid">
        {cakes.map((cake) => {
          const primary = cake.images?.find((image) => image.is_primary) || cake.images?.[0]
          const image = getMediaUrl(primary?.image)
          return (
            <article className="cake-card" key={cake.id}>
              <a className="cake-card-image" href={`/cakes/${cake.id}`}>
                {image
                  ? <img src={image} alt={cake.name} />
                  : <span aria-hidden="true">🍰</span>}
              </a>
              <div className="cake-card-content">
                <p className="cake-category">{cake.category?.name || 'Freshly baked'}</p>
                <div className="cake-card-header">
                  <h2><a href={`/cakes/${cake.id}`}>{cake.name}</a></h2>
                  <button
                    className="catalogue-add-button"
                    type="button"
                    disabled={addingCakeId !== null}
                    onClick={() => addToCart(cake)}
                  >
                    {addingCakeId === cake.id ? 'Adding…' : 'Add to cart'}
                  </button>
                </div>
               
                <p className="cake-description">{cake.description || 'A delicious treat for a special day.'}</p>
                <div className="cake-card-bottom">
                  <strong>₹{Number(cake.price).toFixed(2)}</strong>
                  <a href={`/cakes/${cake.id}`} aria-label={`View ${cake.name}`}>View cake <span aria-hidden="true">→</span></a>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default Catalogue
