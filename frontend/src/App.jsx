import 'react-toastify/dist/ReactToastify.css'
import './App.css'
import { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'
import { getCurrentUser } from './services/api.js'
import CakeDetails from './pages/CakeDetails.jsx'
import Cart from './pages/Cart.jsx'
import Catalogue from './pages/Catalogue.jsx'
import Checkout from './pages/Checkout.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import MyOrders from './pages/MyOrders.jsx'
import Profile from './pages/Profile.jsx'
import Register from './pages/Register.jsx'
import AdminPage from './pages/admin/page.jsx'

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

function App() {
  const [authStatus, setAuthStatus] = useState(() => (
    sessionStorage.getItem('accessToken') ? 'loading' : 'guest'
  ))
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  const cakeMatch = path.match(/^\/cakes\/(\d+)$/)
  const isAdminPath = path === '/admin' || path.startsWith('/admin/')
  const links = authStatus === 'superuser' ? adminStorefrontLinks : customerLinks

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
    window.location.assign('/')
  }

  let page
  if (isAdminPath) page = <AdminPage path={path} authStatus={authStatus} />
  else if (path === '/catalogue') page = <Catalogue />
  else if (cakeMatch) page = <CakeDetails cakeId={cakeMatch[1]} />
  else if (path === '/cart') page = <Cart />
  else if (path === '/checkout') page = <Checkout />
  else if (path === '/orders') page = <MyOrders />
  else if (path === '/profile') page = <Profile />
  else if (path === '/login') page = <Login />
  else if (path === '/register') page = <Register />
  else page = <Home />

  return (
    <div className="site-shell">
      {!isAdminPath && <header className="site-header">
        <a className="brand" href="/" aria-label="Sweet Crumbs home">
          <img src="./cropped_circle_image.png" height="70" width="70" alt="Ankits's Homebake" />
          <span>Ankita's Homebake</span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          {links.map(([label, href]) => (
            <a className={path === href ? 'active' : ''} href={href} key={href}>
              {label}
            </a>
          ))}
          {authStatus === 'superuser' && (
            <a className={path.startsWith('/admin') ? 'active' : ''} href="/admin" key="/admin">
              Admin
            </a>
          )}
        </nav>
        <div className="account-actions">
          {authStatus === 'consumer' || authStatus === 'superuser'
            ? <>
                <a className="account-link" href="/profile">My account</a>
                <button className="account-link account-button" type="button" onClick={handleSignOut}>Sign out</button>
              </>
            : authStatus === 'loading'
              ? <span className="account-link">Checking account…</span>
              : <a className="account-link" href="/login">Sign in</a>}
        </div>
      </header>}
      <main>{page}</main>
      <ToastContainer position="top-right" autoClose={2800} newestOnTop closeOnClick pauseOnHover />
      {!isAdminPath && <footer className="site-footer">
        <a className="brand footer-brand" href="/">Sweet Crumbs</a>
        <p>Made with care, one slice at a time.</p>
      </footer>}
    </div>
  )
}

export default App
