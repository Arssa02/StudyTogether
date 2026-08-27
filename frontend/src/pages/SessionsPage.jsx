import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import AppNavbar from '../components/AppNavbar';

import {
  deletePlannedSession,
  getMyPlannedSessions,
  getActiveStudySessions,
  joinStudySession,
} from '../api';

import './SessionsPage.css';

function SessionsPage() {
  const navigate = useNavigate();

  const [activeSessions, setActiveSessions] = useState([]);
  const [plannedSessions, setPlannedSessions] = useState([]);

  const [error, setError] = useState('');
  const [joiningId, setJoiningId] = useState(null);

  const loadSessions = async () => {
    try {
      setError('');

      const [activeResult, plannedResult] =
        await Promise.all([
          getActiveStudySessions(),
          getMyPlannedSessions(),
        ]);

      setActiveSessions(activeResult.sessions);
      setPlannedSessions(plannedResult.sessions);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleJoin = async (sessionId) => {
    try {
      setError('');
      setJoiningId(sessionId);

      await joinStudySession(sessionId);

      navigate(`/study-room/${sessionId}`);
    } catch (err) {
      setError(err.message);
      setJoiningId(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      setError('');

      await deletePlannedSession(id);
      await loadSessions();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <AppNavbar />

      <main className="sessions-page">
        <section className="sessions-heading">
          <div>
            <h1>Study Sessions</h1>
            <p>
              Join your friends or manage your planned
              study sessions.
            </p>
          </div>

          <Link
            to="/plan-session"
            className="plan-session-button"
          >
            + PLAN SESSION
          </Link>
        </section>

        {error && (
          <div className="sessions-error">
            {error}
          </div>
        )}

        {/* ACTIVE SESSIONS */}

        <section className="sessions-section">
          <div className="sessions-section-header">
            <h2>ACTIVE SESSIONS</h2>

            <span className="sessions-count">
              {activeSessions.length}
            </span>
          </div>

          {activeSessions.length === 0 ? (
            <div className="empty-sessions">
              <strong>No active sessions</strong>

              <p>
                When you or one of your friends starts
                studying, the session will appear here.
              </p>
            </div>
          ) : (
            <div className="active-session-list">
              {activeSessions.map((session) => {
                const isParticipating =
                  Number(session.is_participating) === 1;

                return (
                  <article
                    className="active-session-row"
                    key={session.id}
                  >
                    <div className="session-icon">
                      ▣
                    </div>

                    <div className="active-session-info">
                      <strong>
                        {session.title ||
                          'Study Session'}
                      </strong>

                      <span>
                        {session.first_name}{' '}
                        {session.last_name}
                      </span>
                    </div>

                    <div className="active-session-members">
                      ♙ {session.participant_count}{' '}
                      {Number(
                        session.participant_count
                      ) === 1
                        ? 'member'
                        : 'members'}
                    </div>

                    <div className="active-session-status">
                      ● ACTIVE
                    </div>

                    {isParticipating ? (
                      <button
                        type="button"
                        className="session-open-button"
                        onClick={() =>
                          navigate(
                            `/study-room/${session.id}`
                          )
                        }
                      >
                        OPEN
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="session-join-button"
                        disabled={
                          joiningId === session.id
                        }
                        onClick={() =>
                          handleJoin(session.id)
                        }
                      >
                        {joiningId === session.id
                          ? 'JOINING...'
                          : 'JOIN'}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* PLANNED SESSIONS */}

        <section className="sessions-section">
          <div className="sessions-section-header">
            <h2>PLANNED SESSIONS</h2>

            <span className="sessions-count">
              {plannedSessions.length}
            </span>
          </div>

          {plannedSessions.length === 0 ? (
            <div className="empty-sessions">
              <strong>
                No planned sessions yet
              </strong>

              <p>
                Plan a future study session and it will
                appear here.
              </p>
            </div>
          ) : (
            <div className="planned-session-list">
              {plannedSessions.map((session) => (
                <article
                  className="planned-session-row"
                  key={session.id}
                >
                  <div className="planned-session-date">
                    <strong>
                      {new Date(
                        session.start_time
                      ).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </strong>

                    <span>
                      {new Date(
                        session.start_time
                      ).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="planned-session-info">
                    <strong>
                      {session.title}
                    </strong>

                    <span>
                      {new Date(
                        session.start_time
                      ).toLocaleString()}
                      {' → '}
                      {new Date(
                        session.end_time
                      ).toLocaleString()}
                    </span>
                  </div>

                  <div className="planned-session-actions">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/planned-sessions/${session.id}/edit`
                        )
                      }
                    >
                      EDIT
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(session.id)
                      }
                    >
                      DELETE
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export default SessionsPage;