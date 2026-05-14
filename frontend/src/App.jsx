import './App.css'

function App() {
  return (
    <main className="app-shell">
      <aside className="sidebar-panel">
        <div className="brand-block">
          <p className="eyebrow">StudyTogether</p>
          <h2>Study smart. Sync fast.</h2>
          <p className="muted">Plan sessions and track progress with friends.</p>
        </div>

        <nav className="sidebar-nav">
          <a href="#dashboard" className="active">
            Dashboard
          </a>
          <a href="#sessions">Sessions</a>
          <a href="#profile">Profile</a>
        </nav>

        <div className="sidebar-card">
          <h3>Quick status</h3>
          <p className="muted">Active sessions, friends, and study room updates.</p>
        </div>
      </aside>

      <section className="content-panel" id="dashboard">
        <header className="page-header">
          <div>
            <h1>Dashboard</h1>
            <p className="lead">
              A desktop-style workspace for study sessions and friend activity.
            </p>
          </div>
        </header>

        <div className="feature-grid">
          <article className="feature-card">
            <h2>Weekly calendar</h2>
            <p>See study sessions in a clear weekly view.</p>
          </article>
          <article className="feature-card">
            <h2>Friends status</h2>
            <p>Check who is active, planned, or on break.</p>
          </article>
          <article className="feature-card">
            <h2>Study room</h2>
            <p>Join sessions and follow the shared study space.</p>
          </article>
        </div>
      </section>
    </main>
  )
}

export default App
