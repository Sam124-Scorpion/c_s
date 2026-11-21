import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  createCake,
  deleteCake,
  deleteCakeImage,
  getAdminCakes,
  getAdminCategories,
  getMediaUrl,
  setCakeImagePrimary,
  uploadCakeImage,
  updateCake,
} from '../../services/api.js'

const emptyForm = {
  name: '',
  description: '',
  price: '',
  stock: '0',
  weight: '',
  category_id: '',
  is_featured: false,
  is_available: true,
}

function ManageCakes() {
  const [cakes, setCakes] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imageIsPrimary, setImageIsPrimary] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadData() {
    try {
      const [cakeData, categoryData] = await Promise.all([getAdminCakes(), getAdminCategories()])
      setCakes(Array.isArray(cakeData) ? cakeData : cakeData.results || [])
      setCategories(Array.isArray(categoryData) ? categoryData : categoryData.results || [])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isCurrent = true
    Promise.all([getAdminCakes(), getAdminCategories()])
      .then(([cakeData, categoryData]) => {
        if (isCurrent) {
          setCakes(Array.isArray(cakeData) ? cakeData : cakeData.results || [])
          setCategories(Array.isArray(categoryData) ? categoryData : categoryData.results || [])
        }
      })
      .catch((requestError) => { if (isCurrent) setError(requestError.message) })
      .finally(() => { if (isCurrent) setLoading(false) })
    return () => { isCurrent = false }
  }, [])

  function startEdit(cake) {
    setEditingId(cake.id)
    setForm({
      name: cake.name,
      description: cake.description || '',
      price: cake.price,
      stock: String(cake.stock),
      weight: cake.weight || '',
      category_id: String(cake.category?.id || ''),
      is_featured: Boolean(cake.is_featured),
      is_available: Boolean(cake.is_available),
    })
    setSelectedImage(null)
    setImageIsPrimary(!(cake.images || []).some((image) => image.is_primary))
  }

  function resetForm() {
    setEditingId(null)
    setForm(emptyForm)
    setSelectedImage(null)
    setImageIsPrimary(true)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      category_id: Number(form.category_id),
    }
    let savedCake
    try {
      savedCake = editingId
        ? await updateCake(editingId, payload)
        : await createCake(payload)
      if (selectedImage) {
        try {
          await uploadCakeImage(savedCake.id, selectedImage, imageIsPrimary)
        } catch (uploadError) {
          setEditingId(savedCake.id)
          setError(`Cake details were saved, but the image upload failed: ${uploadError.message}`)
          await loadData()
          return
        }
      }
      resetForm()
      await loadData()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(cake) {
    if (!window.confirm(`Delete "${cake.name}"? This cannot be undone.`)) return
    setError('')
    try {
      await deleteCake(cake.id)
      if (editingId === cake.id) resetForm()
      await loadData()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function handleImageAction(cakeId, imageId, action) {
    setError('')
    try {
      if (action === 'primary') await setCakeImagePrimary(cakeId, imageId)
      else await deleteCakeImage(cakeId, imageId)
      await loadData()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  function updateField(event) {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  return (
    <div>
      <div className="admin-page-heading">
        <div><p className="eyebrow">Your product counter</p><h1>Manage cakes</h1></div>
        <Link className="admin-outline-button" to="/catalogue">View storefront ↗</Link>
      </div>
      {error && <p className="admin-error" role="alert">{error}</p>}
      <div className="admin-management-grid cake-management-grid">
        <form className="admin-form-card" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Edit cake' : 'Add a cake'}</h2>
          <label>Name<input name="name" required maxLength="100" value={form.name} onChange={updateField} /></label>
          <label>Description<textarea name="description" rows="3" value={form.description} onChange={updateField} /></label>
          <div className="admin-inline-fields">
            <label>Price<input name="price" type="number" min="0" step="0.01" required value={form.price} onChange={updateField} /></label>
            <label>Stock<input name="stock" type="number" min="0" step="1" required value={form.stock} onChange={updateField} /></label>
          </div>
          <div className="admin-inline-fields">
            <label>Weight<input name="weight" maxLength="10" placeholder="e.g. 1 kg" value={form.weight} onChange={updateField} /></label>
            <label>Category
              <select name="category_id" required value={form.category_id} onChange={updateField}>
                <option value="">Choose a category</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </label>
          </div>
          <label>
            Cake image
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setSelectedImage(event.target.files?.[0] || null)}
            />
          </label>
          {selectedImage && (
            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={imageIsPrimary}
                onChange={(event) => setImageIsPrimary(event.target.checked)}
              />
              Set this as the primary image
            </label>
          )}
          {editingId && (
            <div className="admin-image-list">
              <span className="admin-image-list-title">Saved images</span>
              {(cakes.find((cake) => cake.id === editingId)?.images || []).length === 0
                ? <p className="admin-muted">No images uploaded yet.</p>
                : (cakes.find((cake) => cake.id === editingId)?.images || []).map((image) => (
                  <div className="admin-image-row" key={image.id}>
                    <img src={getMediaUrl(image.image)} alt="" />
                    <span>{image.is_primary ? 'Primary image' : 'Cake image'}</span>
                    {!image.is_primary && <button type="button" onClick={() => handleImageAction(editingId, image.id, 'primary')}>Make primary</button>}
                    <button className="danger-action" type="button" onClick={() => handleImageAction(editingId, image.id, 'delete')}>Remove</button>
                  </div>
                ))}
            </div>
          )}
          <label className="admin-checkbox"><input name="is_available" type="checkbox" checked={form.is_available} onChange={updateField} />Available on the storefront</label>
          <label className="admin-checkbox"><input name="is_featured" type="checkbox" checked={form.is_featured} onChange={updateField} />Featured cake</label>
          <div className="admin-form-actions">
            <button className="admin-primary-button" disabled={saving || categories.length === 0}>{saving ? 'Saving…' : editingId ? 'Save cake' : 'Add cake'}</button>
            {editingId && <button className="admin-outline-button" type="button" onClick={resetForm}>Cancel</button>}
          </div>
          {categories.length === 0 && <p className="admin-muted">Create a category before adding a cake.</p>}
        </form>
        <section className="admin-list-card">
          <h2>All cakes <span>{cakes.length}</span></h2>
          {loading ? <p className="admin-muted">Loading cakes…</p> : cakes.length === 0
            ? <p className="admin-muted">No cakes yet. Add your first one.</p>
            : <div className="admin-table-wrap"><table className="admin-table">
              <thead><tr><th>Cake</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{cakes.map((cake) => {
                const image = cake.images?.find((item) => item.is_primary) || cake.images?.[0]
                return <tr key={cake.id}>
                  <td><div className="admin-product-name">{image?.image ? <img src={getMediaUrl(image.image)} alt="" /> : <span aria-hidden="true">🍰</span>}<div><strong>{cake.name}</strong><small>{cake.category?.name || 'Uncategorized'}</small></div></div></td>
                  <td>₹{Number(cake.price).toFixed(2)}</td>
                  <td><span className={cake.stock < 5 ? 'low-stock' : ''}>{cake.stock}</span></td>
                  <td><span className={`admin-status ${cake.is_available ? 'status-active' : 'status-inactive'}`}>{cake.is_available ? 'Available' : 'Hidden'}</span></td>
                  <td><div className="admin-row-actions"><button type="button" onClick={() => startEdit(cake)}>Edit</button><button className="danger-action" type="button" onClick={() => handleDelete(cake)}>Delete</button></div></td>
                </tr>
              })}</tbody>
            </table></div>}
        </section>
      </div>
    </div>
  )
}

export default ManageCakes