import { Link } from 'react-router-dom'

function Profile() {
  return (
    <section className="page-section narrow-section">
      <div className="page-heading">
        <p className="eyebrow">Your account</p>
        <h1>Profile</h1>
        <p>Manage your account details and preferences.</p>
      </div>
      <div className="empty-state">
        <span aria-hidden="true">♡</span>
        <h2>Profile details are not available yet</h2>
        <p>Account registration and sign-in are available, but profile management is not connected yet.</p>
        <Link className="button button-primary" to="/login">Sign in</Link>
      </div>
    </section>
  )
}

export default Profile
