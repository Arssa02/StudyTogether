import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AppNavbar from '../components/AppNavbar';
import { startStudySession } from '../api';

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

      <main className="simple-form-page">
        <h1>Start Studying</h1>

        <p>
          Start a study session immediately.
          The title is optional.
        </p>

        {error && <p>{error}</p>}

        <form onSubmit={handleStart}>
          <label>
            Session title (optional)
            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="e.g. Systems III Study"
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading
              ? 'Starting...'
              : '▶ START STUDYING'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
          >
            CANCEL
          </button>
        </form>
      </main>
    </>
  );
}

export default StartStudyingPage;