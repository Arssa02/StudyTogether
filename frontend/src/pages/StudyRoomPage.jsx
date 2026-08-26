import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import AppNavbar from '../components/AppNavbar';

import {
  getSessionParticipants,
  getMyStudyActivity,
  startStudying,
  takeBreak,
  resumeStudying,
  leaveStudySession,
} from '../api';

function StudyRoomPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [participants, setParticipants] = useState([]);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [error, setError] = useState('');

  const loadRoom = async () => {
    try {
      setError('');

      const [participantsResult, activityResult] =
        await Promise.all([
          getSessionParticipants(id),
          getMyStudyActivity(id),
        ]);

      setParticipants(participantsResult.participants);
      setCurrentActivity(activityResult.current);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadRoom();
  }, [id]);

  const handleStart = async () => {
    try {
      await startStudying(id);
      await loadRoom();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBreak = async () => {
    try {
      await takeBreak(id);
      await loadRoom();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResume = async () => {
    try {
      await resumeStudying(id);
      await loadRoom();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLeave = async () => {
    try {
      await leaveStudySession(id);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <AppNavbar />

      <main className="study-room-page">
        <h1>Study Room</h1>

        {error && <p>{error}</p>}

        <section>
          <h2>Participants</h2>

          {participants.map((participant) => (
            <div key={participant.participation_id}>
              <strong>
                {participant.first_name}{' '}
                {participant.last_name}
              </strong>
            </div>
          ))}
        </section>

        <section>
          <h2>Your Status</h2>

          {!currentActivity && (
            <>
              <p>Ready to study</p>

              <button onClick={handleStart}>
                ▶ START STUDYING
              </button>
            </>
          )}

          {currentActivity?.type === 'study' && (
            <>
              <p>● Studying</p>

              <button onClick={handleBreak}>
                TAKE BREAK
              </button>
            </>
          )}

          {currentActivity?.type === 'break' && (
            <>
              <p>◐ Break</p>

              <button onClick={handleResume}>
                ▶ RESUME STUDYING
              </button>
            </>
          )}

          <button onClick={handleLeave}>
            LEAVE SESSION
          </button>
        </section>
      </main>
    </>
  );
}

export default StudyRoomPage;