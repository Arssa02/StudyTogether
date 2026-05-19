import './App.css'
import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

function DashboardPage() {
  return (
    <main className="app-shell">
      <aside className="sidebar-panel">
        <div className="brand-block">
          <p className="eyebrow">StudyTogether</p>
          <h2>Study smart. Sync fast.</h2>
          <p className="muted">Plan sessions and track progress with friends.</p>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Dashboard
          </NavLink>
          <NavLink to="/login" className={({ isActive }) => (isActive ? 'active' : '')}>
            Login
          </NavLink>
          <NavLink to="/register" className={({ isActive }) => (isActive ? 'active' : '')}>
            Register
          </NavLink>
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  )
}

export default App
