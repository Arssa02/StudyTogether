import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  deletePlannedSession,
  getMyPlannedSessions,
} from '../api';

function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState('');

  const loadSessions = async () => {
    try {
      const result = await getMyPlannedSessions();
      setSessions(result.sessions);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deletePlannedSession(id);
      await loadSessions();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main>
      <h1>Study Sessions</h1>

      <p>
        <Link to="/plan-session">
          + Plan Session
        </Link>
      </p>

      {error && <p>{error}</p>}

      <section>
        <h2>Planned Sessions</h2>

        {sessions.length === 0 ? (
          <p>No planned sessions yet.</p>
        ) : (
          sessions.map((session) => (
            <article key={session.id}>
              <h3>{session.title}</h3>

              <p>
                Start:{' '}
                {new Date(
                  session.start_time
                ).toLocaleString()}
              </p>

              <p>
                End:{' '}
                {new Date(
                  session.end_time
                ).toLocaleString()}
              </p>

              <button
                onClick={() =>
                  handleDelete(session.id)
                }
              >
                Delete
              </button>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

export default SessionsPage;