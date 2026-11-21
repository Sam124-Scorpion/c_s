import { Link } from 'react-router-dom'

function Home() {
  return (
    <section className="hero-section">
      <div className="hero-copy">
        <p className="eyebrow">A little sweetness for every occasion</p>
        <h1>Good days start with cake.</h1>
        <p className="hero-description">
          Discover freshly made cakes for birthdays, celebrations, and all the
          lovely moments in between.
        </p>
        <Link className="button button-primary" to="/catalogue">Explore the cakes</Link>
      </div>
      <div className="hero-art" role="img" aria-label="A freshly baked celebration cake">
        <span className="hero-sparkle sparkle-one" aria-hidden="true">✦</span>
        <span className="hero-sparkle sparkle-two" aria-hidden="true">✧</span>
        <div className="cake-illustration" aria-hidden="true">
          <div className="cake-top"><span>✿</span></div>
          <div className="cake-layer cake-layer-top" />
          <div className="cake-layer cake-layer-bottom" />
          <div className="cake-plate" />
        </div>
        <p>Baked fresh, shared with love</p>
      </div>
      <div className="home-highlights">
        <article><span>01</span><h2>Made fresh</h2><p>Small-batch bakes made for your moments.</p></article>
        <article><span>02</span><h2>Made personal</h2><p>Find a favourite for every kind of celebration.</p></article>
        <article><span>03</span><h2>Made to share</h2><p>Bring a little joy to the table.</p></article>
      </div>
    </section>
  )
}

export default Home
