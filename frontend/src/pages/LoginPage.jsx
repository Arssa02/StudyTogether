import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api';
import './AuthPage.css';

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);

      localStorage.setItem('token', result.token);

      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-card-header">
          <h1>LOGIN</h1>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <label>
            <span>EMAIL</span>

            <input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />
          </label>

          <label>
            <span>PASSWORD</span>

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
            />
          </label>

          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="auth-primary-button"
            disabled={loading}
          >
            {loading
              ? 'LOGGING IN...'
              : 'LOGIN  →'}
          </button>
        </form>

        <div className="auth-divider" />

        <div className="auth-switch">
          <p>Don't have an account?</p>

          <Link
            to="/register"
            className="auth-secondary-button"
          >
            REGISTER
          </Link>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;