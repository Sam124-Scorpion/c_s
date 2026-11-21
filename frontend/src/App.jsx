import 'react-toastify/dist/ReactToastify.css'
import './App.css'
import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { getCurrentUser } from './services/api.js'

const CakeDetails = lazy(() => import('./pages/CakeDetails.jsx'))
const Cart = lazy(() => import('./pages/Cart.jsx'))
const Catalogue = lazy(() => import('./pages/Catalogue.jsx'))
const Checkout = lazy(() => import('./pages/Checkout.jsx'))
const Home = lazy(() => import('./pages/Home.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const MyOrders = lazy(() => import('./pages/MyOrders.jsx'))
const Profile = lazy(() => import('./pages/Profile.jsx'))
const Register = lazy(() => import('./pages/Register.jsx'))
const AdminPage = lazy(() => import('./pages/admin/page.jsx'))

const customerLinks = [
  ['Home', '/'],
  ['Cakes', '/catalogue'],
  ['Cart', '/cart'],
  ['My orders', '/orders'],
]

const adminStorefrontLinks = [
  ['Home', '/'],
  ['Cakes', '/catalogue'],
  ['My orders', '/orders'],
]

const guestLinks = [
  ['Home', '/'],
  ['Cakes', '/catalogue'],
]

function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const [authStatus, setAuthStatus] = useState(() => (
    sessionStorage.getItem('accessToken') ? 'loading' : 'guest'
  ))
  const path = location.pathname.replace(/\/+$/, '') || '/'
  const isAdminPath = path === '/admin' || path.startsWith('/admin/')
  const links =
    authStatus === 'consumer'
      ? customerLinks
      : authStatus === 'superuser'
        ? adminStorefrontLinks
        : guestLinks

  useEffect(() => {
    let isCurrent = true

    async function syncAuthentication() {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      if (!sessionStorage.getItem('accessToken')) {
        if (isCurrent) setAuthStatus('guest')
        return
      }

      if (isCurrent) setAuthStatus('loading')
      try {
        const user = await getCurrentUser()
        if (isCurrent) setAuthStatus(user.is_superuser ? 'superuser' : 'consumer')
      } catch {
        if (isCurrent) {
          setAuthStatus(sessionStorage.getItem('accessToken') ? 'error' : 'guest')
        }
      }
    }

    syncAuthentication()
    window.addEventListener('authchange', syncAuthentication)
    return () => {
      isCurrent = false
      window.removeEventListener('authchange', syncAuthentication)
    }
  }, [])

  function handleSignOut() {
    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('refreshToken')
    window.dispatchEvent(new Event('authchange'))
    navigate('/')
  }

  return (
    <div className="site-shell">
      {!isAdminPath && <header className="site-header">
        <Link className="brand" to="/" aria-label="Sweet Crumbs home">
          <img src="/cropped_circle_image.png" height="70" width="70" alt="Ankits's Homebake" />
          <span>Ankita's Homebake</span>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          {links.map(([label, href]) => (
            <Link className={path === href ? 'active' : ''} to={href} key={href}>
              {label}
            </Link>
          ))}
          {authStatus === 'superuser' && (
            <Link className={path.startsWith('/admin') ? 'active' : ''} to="/admin" key="/admin">
              Admin
            </Link>
          )}
        </nav>
        <div className="account-actions">
          {authStatus === 'consumer' || authStatus === 'superuser'
            ? <>
              <Link className="account-link" to="/profile">My account</Link>
              <button className="account-link account-button" type="button" onClick={handleSignOut}>Sign out</button>
            </>
            : authStatus === 'loading'
              ? <span className="account-link">Checking account…</span>
              : <Link className="account-link" to="/login">Sign in</Link>}
        </div>
      </header>}
      <main>
        <Suspense fallback={<section className="page-section"><p className="notice">Loading…</p></section>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalogue" element={<Catalogue authStatus={authStatus} />} />
            <Route path="/cakes/:cakeId" element={<CakeDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/*" element={<AdminPage path={path} authStatus={authStatus} />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </main>

<ToastContainer
  position="top-right"
  autoClose={2800}
  newestOnTop
  closeOnClick
  pauseOnHover
/>

<footer className="site-footer">
  <p>
    © {new Date().getFullYear()} Ankita's Homebake. All rights reserved.
  </p>
  <p className="site-credit">
    Designed & Developed by <strong>Sam Creative Company</strong>
  </p>
</footer>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

export default App
