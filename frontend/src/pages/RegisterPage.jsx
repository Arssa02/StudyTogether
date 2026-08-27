import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api';
import './AuthPage.css';

function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {
      await register(
        form.firstName,
        form.lastName,
        form.email,
        form.password
      );

      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card register-card">
        <div className="auth-card-header">
          <h1>REGISTER</h1>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <label>
            <span>FIRST NAME</span>

            <input
              name="firstName"
              placeholder="John"
              value={form.firstName}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            <span>LAST NAME</span>

            <input
              name="lastName"
              placeholder="Doe"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            <span>EMAIL</span>

            <input
              name="email"
              type="email"
              placeholder="user@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            <span>PASSWORD</span>

            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
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
              ? 'CREATING ACCOUNT...'
              : 'REGISTER  →'}
          </button>
        </form>

        <div className="auth-divider" />

        <div className="auth-switch">
          <p>Already have an account?</p>

          <Link
            to="/login"
            className="auth-secondary-button"
          >
            LOGIN
          </Link>
        </div>
      </section>
    </main>
  );
}

export default RegisterPage;