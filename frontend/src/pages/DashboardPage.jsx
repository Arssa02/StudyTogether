import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../api';

function DashboardPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const result = await getCurrentUser();
        setUser(result.user);
      } catch (err) {
        setError(err.message);

        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    loadUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (error) {
    return <p>{error}</p>;
  }

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <main>
      <h1>Dashboard</h1>

      <p>
        Welcome, {user.firstName} {user.lastName}
      </p>

      <p>{user.email}</p>

      <button onClick={handleLogout}>
        Logout
      </button>
    </main>
  );
}

export default DashboardPage;