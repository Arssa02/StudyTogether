import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AppNavbar from '../components/AppNavbar';
import { startStudySession } from '../api';
import './SessionFormPage.css';

function StartStudyingPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStart = async (event) => {
    event.preventDefault();

    try {
      setError('');
      setLoading(true);

      const result = await startStudySession(title);

      navigate(`/study-room/${result.session.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppNavbar />

      <main className="session-form-page">
        <section className="session-form-card">
          <div className="session-form-header">
            <h1>START STUDYING</h1>
            <p>
              Start a study session immediately.
              The title is optional.
            </p>
          </div>

          {error && (
            <div className="session-form-error">
              {error}
            </div>
          )}

          <form
            className="session-form"
            onSubmit={handleStart}
          >
            <label>
              <span>SESSION TITLE</span>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="e.g. Systems III Study"
              />
            </label>

            <div className="session-form-actions">
              <button
                type="submit"
                className="session-primary-button"
                disabled={loading}
              >
                {loading
                  ? 'STARTING...'
                  : '▶ START STUDYING'}
              </button>

              <button
                type="button"
                className="session-secondary-button"
                onClick={() =>
                  navigate('/dashboard')
                }
              >
                CANCEL
              </button>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}

export default StartStudyingPage;