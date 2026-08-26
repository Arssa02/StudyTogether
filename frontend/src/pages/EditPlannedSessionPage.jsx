import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  getMyPlannedSessions,
  updatePlannedSession,
} from '../api';

function EditPlannedSessionPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

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
          new Date(session.start_time)
            .toISOString()
            .slice(0, 16)
        );

        setEndTime(
          new Date(session.end_time)
            .toISOString()
            .slice(0, 16)
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

      await updatePlannedSession(
        Number(id),
        title,
        startTime,
        endTime
      );

      navigate('/sessions');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <main>
      <h1>Edit Planned Session</h1>

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>
          Session title
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </label>

        <label>
          Start time
          <input
            type="datetime-local"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
            required
          />
        </label>

        <label>
          End time
          <input
            type="datetime-local"
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
            required
          />
        </label>

        <button type="submit">
          Save Changes
        </button>

        <button
          type="button"
          onClick={() => navigate('/sessions')}
        >
          Cancel
        </button>
      </form>
    </main>
  );
}

export default EditPlannedSessionPage;