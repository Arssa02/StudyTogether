import { NavLink, useNavigate } from 'react-router-dom';
import socket from '../socket';

function AppNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    socket.disconnect();
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="app-navbar">
      <div className="navbar-inner">
        <NavLink to="/dashboard" className="app-brand">
          STUDY SESSION TRACKER
        </NavLink>

        <nav className="main-navigation">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `nav-button ${isActive ? 'active' : ''}`
            }
          >
            ▣ Dashboard
          </NavLink>

          <NavLink
            to="/sessions"
            className={({ isActive }) =>
              `nav-button ${isActive ? 'active' : ''}`
            }
          >
            ☷ Sessions
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `nav-button ${isActive ? 'active' : ''}`
            }
          >
            ♙ Profile
          </NavLink>
        </nav>

        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default AppNavbar;