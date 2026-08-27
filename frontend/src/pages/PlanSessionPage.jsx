import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPlannedSession } from '../api';
import AppNavbar from '../components/AppNavbar';
import './SessionFormPage.css';

function PlanSessionPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError('');

      await createPlannedSession(
        title,
        startTime,
        endTime
      );

      navigate('/sessions');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <AppNavbar />

      <main className="session-form-page">
        <section className="session-form-card plan-session-card">
          <div className="session-form-header">
            <h1>PLAN STUDY SESSION</h1>
            <p>
              Schedule a future study session.
            </p>
          </div>

          {error && (
            <div className="session-form-error">
              {error}
            </div>
          )}

          <form
            className="session-form"
            onSubmit={handleSubmit}
          >
            <label>
              <span>SESSION TITLE</span>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="e.g. Programming II"
                required
              />
            </label>

            <div className="session-form-grid">
              <label>
                <span>START TIME</span>

                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(event) =>
                    setStartTime(event.target.value)
                  }
                  required
                />
              </label>

              <label>
                <span>END TIME</span>

                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(event) =>
                    setEndTime(event.target.value)
                  }
                  required
                />
              </label>
            </div>

            <div className="session-form-actions">
              <button
                type="submit"
                className="session-primary-button"
              >
                + PLAN SESSION
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

export default PlanSessionPage;