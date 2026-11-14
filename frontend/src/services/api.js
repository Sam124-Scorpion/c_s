const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://c-s-810e.onrender.com/api'
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '')

export function getMediaUrl(path) {
  if (!path || /^https?:\/\//i.test(path)) return path
  return `${API_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {})
  headers.set('Accept', 'application/json')
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const responseText = await response.text()
  let data = null
  if (responseText) {
    try {
      data = JSON.parse(responseText)
    } catch {
      data = responseText
    }
  }

  if (!response.ok) {
    const detail = data?.detail || data?.message || (data ? JSON.stringify(data) : response.statusText)
    const error = new Error(typeof detail === 'string' ? detail : JSON.stringify(detail))
    error.status = response.status
    throw error
  }

  return data
}

export function getCakes() {
  return request('/products/cakes/')
}

export function getCategories() {
  return request('/products/categories/')
}

export function getAdminCategories() {
  return adminRequest('/products/admin/categories/')
}

export function getCake(cakeId) {
  return request(`/products/cakes/${encodeURIComponent(cakeId)}/`)
}

function authenticatedRequest(path, options = {}) {
  const accessToken = sessionStorage.getItem('accessToken')
  if (!accessToken) {
    throw new Error('Sign in to continue.')
  }
  const sendWithToken = (token) => {
    const headers = new Headers(options.headers || {})
    headers.set('Authorization', `Bearer ${token}`)
    return request(path, { ...options, headers })
  }

  return sendWithToken(accessToken).catch(async (error) => {
    if (error.status !== 401) throw error

    const refreshToken = sessionStorage.getItem('refreshToken')
    if (refreshToken) {
      let tokens
      try {
        tokens = await request('/auth/refresh/', {
          method: 'POST',
          body: JSON.stringify({ refresh: refreshToken }),
        })
      } catch (refreshError) {
        if (refreshError.status !== 401) throw refreshError
      }

      if (tokens?.access) {
        sessionStorage.setItem('accessToken', tokens.access)
        try {
          return await sendWithToken(tokens.access)
        } catch (retryError) {
          if (retryError.status !== 401) throw retryError
        }
      } else if (tokens) {
        throw new Error('The token refresh response did not include an access token.')
      }
    }

    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('refreshToken')
    window.dispatchEvent(new Event('authchange'))
    throw new Error('Your session is invalid or expired. Please sign in again.')
  })
}

function adminRequest(path, options = {}) {
  return authenticatedRequest(path, options)
}

export function getCurrentUser() {
  return authenticatedRequest('/auth/me/')
}

export function getCart() {
  return authenticatedRequest('/cart/cart/')
}

export function addToCart(cakeId, quantity = 1) {
  return authenticatedRequest('/cart/cart/add/', {
    method: 'POST',
    body: JSON.stringify({ cake_id: cakeId, quantity }),
  })
}

export function updateCartItem(itemId, quantity) {
  return authenticatedRequest(`/cart/cart/items/${encodeURIComponent(itemId)}/`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  })
}

export function removeCartItem(itemId) {
  return authenticatedRequest(`/cart/cart/items/${encodeURIComponent(itemId)}/remove/`, {
    method: 'DELETE',
  })
}

export function getMyOrders() {
  return authenticatedRequest('/orders/')
}

export function createOrder(order) {
  return authenticatedRequest('/orders/', {
    method: 'POST',
    body: JSON.stringify(order),
  })
}

export function submitPaymentReference(orderId, transactionReference) {
  return authenticatedRequest('/payments/submit-reference/', {
    method: 'POST',
    body: JSON.stringify({ order_id: orderId, transaction_reference: transactionReference }),
  })
}

export function getAdminCakes() {
  return adminRequest('/products/admin/cakes/')
}

export function getAdminOrders() {
  return adminRequest('/orders/admin/')
}

export function updateAdminOrder(orderId, changes) {
  return adminRequest(`/orders/admin/${encodeURIComponent(orderId)}/`, {
    method: 'PATCH',
    body: JSON.stringify(changes),
  })
}

export function createCake(cake) {
  return adminRequest('/products/admin/cakes/', {
    method: 'POST',
    body: JSON.stringify(cake),
  })
}

export function updateCake(cakeId, cake) {
  return adminRequest(`/products/admin/cakes/${encodeURIComponent(cakeId)}/`, {
    method: 'PUT',
    body: JSON.stringify(cake),
  })
}

export function deleteCake(cakeId) {
  return adminRequest(`/products/admin/cakes/${encodeURIComponent(cakeId)}/`, {
    method: 'DELETE',
  })
}

export function uploadCakeImage(cakeId, image, isPrimary = false) {
  const body = new FormData()
  body.append('image', image)
  body.append('is_primary', String(isPrimary))
  return adminRequest(`/products/admin/cakes/${encodeURIComponent(cakeId)}/images/`, {
    method: 'POST',
    body,
  })
}

export function setCakeImagePrimary(cakeId, imageId) {
  return adminRequest(
    `/products/admin/cakes/${encodeURIComponent(cakeId)}/images/${encodeURIComponent(imageId)}/primary`,
    {
      method: 'PATCH',
      body: JSON.stringify({ is_primary: true }),
    },
  )
}

export function deleteCakeImage(cakeId, imageId) {
  return adminRequest(
    `/products/admin/cakes/${encodeURIComponent(cakeId)}/images/${encodeURIComponent(imageId)}/delete/`,
    { method: 'DELETE' },
  )
}

export function createCategory(category) {
  return adminRequest('/products/admin/categories/', {
    method: 'POST',
    body: JSON.stringify(category),
  })
}

export function updateCategory(categoryId, category) {
  return adminRequest(`/products/admin/categories/${encodeURIComponent(categoryId)}/`, {
    method: 'PUT',
    body: JSON.stringify(category),
  })
}

export function deleteCategory(categoryId) {
  return adminRequest(`/products/admin/categories/${encodeURIComponent(categoryId)}/`, {
    method: 'DELETE',
  })
}

export function login(credentials) {
  return request('/auth/login/', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

export function register(account) {
  return request('/auth/register/', {
    method: 'POST',
    body: JSON.stringify(account),
  })
}
