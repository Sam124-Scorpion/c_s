import { useEffect, useState } from 'react'
import {
  createCategory,
  deleteCategory,
  getAdminCategories,
  updateCategory,
} from '../../services/api.js'

const emptyForm = { name: '', description: '', is_active: true }

function ManageCategories() {
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadCategories() {
    try {
      const data = await getAdminCategories()
      setCategories(Array.isArray(data) ? data : data.results || [])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isCurrent = true
    getAdminCategories()
      .then((data) => {
        if (isCurrent) setCategories(Array.isArray(data) ? data : data.results || [])
      })
      .catch((requestError) => { if (isCurrent) setError(requestError.message) })
      .finally(() => { if (isCurrent) setLoading(false) })
    return () => { isCurrent = false }
  }, [])

  function startEdit(category) {
    setEditingId(category.id)
    setForm({
      name: category.name,
      description: category.description || '',
      is_active: category.is_active,
    })
  }

  function resetForm() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editingId) await updateCategory(editingId, form)
      else await createCategory(form)
      resetForm()
      await loadCategories()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(category) {
    if (!window.confirm(`Delete the "${category.name}" category?`)) return
    setError('')
    try {
      await deleteCategory(category.id)
      if (editingId === category.id) resetForm()
      await loadCategories()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <div>
      <div className="admin-page-heading">
        <div><p className="eyebrow">Shop organization</p><h1>Categories</h1></div>
      </div>
      {error && <p className="admin-error" role="alert">{error}</p>}
      <div className="admin-management-grid">
        <form className="admin-form-card" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Edit category' : 'Add a category'}</h2>
          <label>
            Name
            <input required maxLength="100" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </label>
          <label>
            Description
            <textarea rows="4" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </label>
          <label className="admin-checkbox">
            <input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} />
            Active on the storefront
          </label>
          <div className="admin-form-actions">
            <button className="admin-primary-button" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save category' : 'Add category'}</button>
            {editingId && <button className="admin-outline-button" type="button" onClick={resetForm}>Cancel</button>}
          </div>
        </form>
        <section className="admin-list-card">
          <h2>All categories <span>{categories.length}</span></h2>
          {loading ? <p className="admin-muted">Loading categories…</p> : categories.length === 0
            ? <p className="admin-muted">No categories yet. Add your first one.</p>
            : <div className="admin-table-wrap"><table className="admin-table">
              <thead><tr><th>Name</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{categories.map((category) => (
                <tr key={category.id}>
                  <td><strong>{category.name}</strong><small>{category.description || 'No description'}</small></td>
                  <td><span className={`admin-status ${category.is_active ? 'status-active' : 'status-inactive'}`}>{category.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td><div className="admin-row-actions"><button type="button" onClick={() => startEdit(category)}>Edit</button><button className="danger-action" type="button" onClick={() => handleDelete(category)}>Delete</button></div></td>
                </tr>
              ))}</tbody>
            </table></div>}
        </section>
      </div>
    </div>
  )
}

export default ManageCategories