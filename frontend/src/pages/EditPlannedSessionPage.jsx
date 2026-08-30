import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  getMyPlannedSessions,
  updatePlannedSession,
} from '../api';
import AppNavbar from '../components/AppNavbar';
import './SessionFormPage.css';

function toLocalDateTimeInput(dateString) {
  const date = new Date(dateString);

  const offset = date.getTimezoneOffset();
  const localDate = new Date(
    date.getTime() - offset * 60 * 1000
  );

  return localDate.toISOString().slice(0, 16);
}

function EditPlannedSessionPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const result = await getMyPlannedSessions();

        const session = result.sessions.find(
          (item) => item.id === Number(id)
        );

        if (!session) {
          setError('Planned session not found');
          return;
        }

        setTitle(session.title);

        setStartTime(
          toLocalDateTimeInput(session.start_time)
        );

        setEndTime(
          toLocalDateTimeInput(session.end_time)
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError('');
      setSaving(true);

      await updatePlannedSession(
        Number(id),
        title,
        startTime,
        endTime
      );

      navigate('/sessions');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AppNavbar />

      <main className="session-form-page">
        <section className="session-form-card plan-session-card">
          <div className="session-form-header">
            <h1>EDIT PLANNED SESSION</h1>
            <p>
              Update your planned study session.
            </p>
          </div>

          {error && (
            <div className="session-form-error">
              {error}
            </div>
          )}

          {loading ? (
            <div className="session-form-loading">
              Loading session...
            </div>
          ) : (
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
                  disabled={saving}
                >
                  {saving
                    ? 'SAVING...'
                    : 'SAVE CHANGES'}
                </button>

                <button
                  type="button"
                  className="session-secondary-button"
                  onClick={() =>
                    navigate('/sessions')
                  }
                >
                  CANCEL
                </button>
              </div>
            </form>
          )}
        </section>
      </main>
    </>
  );
}

export default EditPlannedSessionPage;