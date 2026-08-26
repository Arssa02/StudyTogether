import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AppNavbar from '../components/AppNavbar';

import {
  getCurrentUser,
  getFriends,
  getMyPlannedSessions,
  getFriendPlannedSessions,
} from '../api';

import './DashboardPage.css';

const HOURS = [9, 12, 15, 18, 21];

function DashboardPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [mySessions, setMySessions] = useState([]);

  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friendSessions, setFriendSessions] = useState([]);

  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [userResult, friendsResult, sessionsResult] =
          await Promise.all([
            getCurrentUser(),
            getFriends(),
            getMyPlannedSessions(),
          ]);

        setUser(userResult.user);
        setFriends(friendsResult.friends);
        setMySessions(sessionsResult.sessions);
      } catch (err) {
        setError(err.message);
      }
    };

    loadDashboard();
  }, []);

  const handleSelectFriend = async (friend) => {
    try {
      setError('');

      if (selectedFriend?.id === friend.id) {
        setSelectedFriend(null);
        setFriendSessions([]);
        return;
      }

      const result = await getFriendPlannedSessions(friend.id);

      setSelectedFriend(friend);
      setFriendSessions(result.sessions);
    } catch (err) {
      setError(err.message);
    }
  };

  const statusLabel = (status) => {
    if (status === 'studying') return '● Studying';
    if (status === 'break') return '◐ Break';
    return '○ Offline';
  };

  const statusClass = (status) => {
    if (status === 'studying') return 'status-studying';
    if (status === 'break') return 'status-break';
    return 'status-offline';
  };

  const weekDates = useMemo(() => {
    const today = new Date();

    const day = today.getDay();
    const distanceToMonday = day === 0 ? -6 : 1 - day;

    const monday = new Date(today);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(today.getDate() + distanceToMonday);

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return date;
    });
  }, []);

  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  const formatShortDate = (date) =>
    date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });

  const isSameDay = (dateA, dateB) =>
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate();

  const overlaps = useMemo(() => {
    const result = [];

    for (const mine of mySessions) {
      for (const theirs of friendSessions) {
        const myStart = new Date(mine.start_time);
        const myEnd = new Date(mine.end_time);

        const theirStart = new Date(theirs.start_time);
        const theirEnd = new Date(theirs.end_time);

        const start = new Date(
          Math.max(myStart.getTime(), theirStart.getTime())
        );

        const end = new Date(
          Math.min(myEnd.getTime(), theirEnd.getTime())
        );

        if (start < end) {
          result.push({
            mine,
            theirs,
            start,
            end,
          });
        }
      }
    }

    return result;
  }, [mySessions, friendSessions]);

  const getSessionForCell = (date, hour) => {
    const overlap = overlaps.find((item) => {
      const overlapDate = item.start;

      return (
        isSameDay(overlapDate, date) &&
        overlapDate.getHours() >= hour &&
        overlapDate.getHours() < hour + 3
      );
    });

    if (overlap) {
      return {
        type: 'overlap',
        title: overlap.mine.title,
        subtitle: 'BOTH',
      };
    }

    const mine = mySessions.find((session) => {
      const start = new Date(session.start_time);

      return (
        isSameDay(start, date) &&
        start.getHours() >= hour &&
        start.getHours() < hour + 3
      );
    });

    if (mine) {
      return {
        type: 'mine',
        title: mine.title,
        subtitle: 'YOU',
      };
    }

    const theirs = friendSessions.find((session) => {
      const start = new Date(session.start_time);

      return (
        isSameDay(start, date) &&
        start.getHours() >= hour &&
        start.getHours() < hour + 3
      );
    });

    if (theirs) {
      return {
        type: 'friend',
        title: theirs.title,
        subtitle: selectedFriend?.firstName || 'FRIEND',
      };
    }

    return null;
  };

  if (!user) {
    return <p className="dashboard-loading">Loading...</p>;
  }

  return (
    <>
      <AppNavbar />

      <main className="dashboard-page">
        <section className="dashboard-heading-row">
          <div>
            <h1>Dashboard</h1>

            <p className="week-label">
              Week of {formatShortDate(weekStart)} –{' '}
              {formatShortDate(weekEnd)}, {weekEnd.getFullYear()}
            </p>
          </div>

          <div className="dashboard-actions">
            <button
              type="button"
              className="secondary-action"
              onClick={() => navigate('/plan-session')}
            >
              + PLAN SESSION
            </button>

            <button
              type="button"
              className="primary-action"
              onClick={() => navigate('/start-studying')}
            >
              ▶ START STUDYING
            </button>

            <button
              type="button"
              className="secondary-action"
              onClick={() => navigate('/sessions')}
            >
              VIEW ALL SESSIONS
            </button>
          </div>
        </section>

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        <section className="dashboard-layout">
          <div className="calendar-card">
            <div className="calendar-card-header">
              <div>
                <h2>Weekly Calendar</h2>

                <p>
                  {selectedFriend
                    ? `Comparing your schedule with ${selectedFriend.firstName} ${selectedFriend.lastName}`
                    : 'Select a friend to compare planned study times'}
                </p>
              </div>

              <button
                type="button"
                className="small-outline-button"
              >
                DAY VIEW
              </button>
            </div>

            <div className="calendar-grid">
              <div className="calendar-corner" />

              {weekDates.map((date) => (
                <div
                  className="calendar-day-header"
                  key={date.toISOString()}
                >
                  <strong>
                    {date
                      .toLocaleDateString(undefined, {
                        weekday: 'short',
                      })
                      .toUpperCase()}
                  </strong>

                  <span>{date.getDate()}</span>
                </div>
              ))}

              {HOURS.map((hour) => (
                <div
                  className="calendar-row"
                  key={hour}
                >
                  <div className="calendar-time">
                    {hour > 12 ? hour - 12 : hour}
                    {hour >= 12 ? 'PM' : 'AM'}
                  </div>

                  {weekDates.map((date) => {
                    const session =
                      getSessionForCell(date, hour);

                    return (
                      <div
                        className="calendar-cell"
                        key={`${date.toISOString()}-${hour}`}
                      >
                        {session && (
                          <div
                            className={`calendar-session ${session.type}`}
                          >
                            <strong>
                              {session.title}
                            </strong>

                            <span>
                              {session.subtitle}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="calendar-legend">
              <div>
                <span className="legend-box mine" />
                My Planned Session
              </div>

              <div>
                <span className="legend-box friend" />
                Friend's Planned Session
              </div>

              <div>
                <span className="legend-box overlap" />
                Overlapping Study Time
              </div>
            </div>
          </div>

          <aside className="dashboard-sidebar">
            <section className="sidebar-box">
              <h2>Today's Stats</h2>

              <div className="stats-row">
                <span>Study Time</span>
                <strong>—</strong>
              </div>

              <div className="stats-row">
                <span>Sessions</span>
                <strong>—</strong>
              </div>
            </section>

            <section className="sidebar-box friends-box">
              <h2>Friends</h2>

              <p className="sidebar-description">
                Select to compare schedules
              </p>

              <div className="friends-list">
                {friends.length === 0 ? (
                  <p>No friends yet.</p>
                ) : (
                  friends.map((friend) => (
                    <button
                      type="button"
                      key={friend.friendshipId}
                      className={`friend-row ${
                        selectedFriend?.id === friend.id
                          ? 'selected'
                          : ''
                      }`}
                      onClick={() =>
                        handleSelectFriend(friend)
                      }
                    >
                      <span
                        className={statusClass(
                          friend.studyStatus
                        )}
                      >
                        {statusLabel(
                          friend.studyStatus
                        )}
                      </span>

                      <strong>
                        {friend.firstName}{' '}
                        {friend.lastName}
                      </strong>

                      {selectedFriend?.id ===
                        friend.id && (
                        <span className="selected-check">
                          ✓
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>

              <div className="status-legend">
                <span>● Studying</span>
                <span>◐ Break</span>
                <span>○ Offline</span>
              </div>

              <button
                type="button"
                className="manage-friends-button"
                onClick={() => navigate('/profile')}
              >
                MANAGE FRIENDS
              </button>
            </section>
          </aside>
        </section>
      </main>
    </>
  );
}

export default DashboardPage;