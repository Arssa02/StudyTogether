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

import './StudyRoomPage.css';

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

  const getMyStatusLabel = () => {
    if (!currentActivity) return '○ NOT STARTED';
    if (currentActivity.type === 'study') return '● STUDYING';
    return '◐ BREAK';
  };

  return (
    <>
      <AppNavbar />

      <main className="study-room-page">
        <section className="study-room-heading">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate('/dashboard')}
          >
            ←
          </button>

          <div>
            <h1>Study Room</h1>
            <p>Active shared study session</p>
          </div>
        </section>

        {error && (
          <div className="study-room-error">
            {error}
          </div>
        )}

        <section className="study-room-card">
          <div className="room-header">
            <strong>VIRTUAL STUDY ROOM</strong>

            <span>
              ♙ {participants.length}{' '}
              {participants.length === 1
                ? 'participant'
                : 'participants'}
            </span>
          </div>

          <div className="participants-scene">
            {participants.length === 0 ? (
              <p>No participants.</p>
            ) : (
              participants.map((participant, index) => (
                <div
                  className="participant-desk"
                  key={participant.participation_id}
                >
                  <div className="participant-character">
                    <div className="character-head" />
                    <div className="character-body" />

                    <div className="desk">
                      <div className="desk-object laptop">
                        ▰
                      </div>
                    </div>
                  </div>

                  <strong className="participant-name">
                    {participant.first_name}{' '}
                    {participant.last_name}
                  </strong>

                  <span className="participant-state">
                    {index === 0 ? 'Studying' : 'Present'}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="study-controls-area">
            <div className="study-timer-box">
              <strong className="timer-value">
                00:00:00
              </strong>

              <span>YOUR STUDY TIME</span>
            </div>

            <div className="study-control-panel">
              <div className="current-status">
                {getMyStatusLabel()}
              </div>

              <div className="study-buttons">
                {!currentActivity && (
                  <button
                    type="button"
                    className="study-primary-button"
                    onClick={handleStart}
                  >
                    ▶ START STUDYING
                  </button>
                )}

                {currentActivity?.type === 'study' && (
                  <button
                    type="button"
                    className="study-primary-button"
                    onClick={handleBreak}
                  >
                    TAKE BREAK
                  </button>
                )}

                {currentActivity?.type === 'break' && (
                  <button
                    type="button"
                    className="study-primary-button"
                    onClick={handleResume}
                  >
                    ▶ RESUME STUDYING
                  </button>
                )}

                <button
                  type="button"
                  className="leave-session-button"
                  onClick={handleLeave}
                >
                  LEAVE SESSION
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default StudyRoomPage;