import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPlannedSession } from '../api';

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
    <main>
      <h1>Plan Study Session</h1>

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>
          Session title
          <input
            type="text"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            required
          />
        </label>

        <label>
          Start time
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
          End time
          <input
            type="datetime-local"
            value={endTime}
            onChange={(event) =>
              setEndTime(event.target.value)
            }
            required
          />
        </label>

        <button type="submit">
          Plan Session
        </button>

        <button
          type="button"
          onClick={() => navigate('/dashboard')}
        >
          Cancel
        </button>
      </form>
    </main>
  );
}

export default PlanSessionPage;