import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import socket, { connectSocket } from '../socket';

import AppNavbar from '../components/AppNavbar';

import {
  getCurrentUser,
  getFriends,
  getMyPlannedSessions,
  getFriendPlannedSessions,
  getUserStats,
} from '../api';

import './DashboardPage.css';

const CALENDAR_START_HOUR = 0;
const CALENDAR_END_HOUR = 24;
const DAY_MINUTES = 24 * 60;

const HOURS = Array.from(
  { length: 25 },
  (_, index) => index
);

function DashboardPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [mySessions, setMySessions] = useState([]);

  const [stats, setStats] = useState(null);

  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friendSessions, setFriendSessions] = useState([]);

  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [
          userResult,
          friendsResult,
          sessionsResult,
          statsResult,
        ] = await Promise.all([
          getCurrentUser(),
          getFriends(),
          getMyPlannedSessions(),
          getUserStats(),
        ]);

        setUser(userResult.user);
        setFriends(friendsResult.friends);
        setMySessions(sessionsResult.sessions);
        setStats(statsResult.stats);
      } catch (err) {
        setError(err.message);
      }
    };

    loadDashboard();
  }, []);

  useEffect(() => {
    connectSocket();

    const handleFriendStatusUpdate = async () => {
      try {
        const friendsResult = await getFriends();
        setFriends(friendsResult.friends);
      } catch (err) {
        setError(err.message);
      }
    };

    socket.on(
      'friend-status-updated',
      handleFriendStatusUpdate
    );

    return () => {
      socket.off(
        'friend-status-updated',
        handleFriendStatusUpdate
      );

      socket.disconnect();
    };
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

  const getDayStart = (date) => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  };

  const getNextDayStart = (date) => {
    const result = getDayStart(date);
    result.setDate(result.getDate() + 1);
    return result;
  };

  const getIntervalForDay = (startDate, endDate, day) => {
    const dayStart = getDayStart(day);
    const nextDayStart = getNextDayStart(day);

    const visibleStart = new Date(
      Math.max(startDate.getTime(), dayStart.getTime())
    );

    const visibleEnd = new Date(
      Math.min(endDate.getTime(), nextDayStart.getTime())
    );

    if (visibleStart >= visibleEnd) {
      return null;
    }

    return {
      start: visibleStart,
      end: visibleEnd,
    };
  };

  const getMinutesFromMidnight = (date) =>
    date.getHours() * 60 + date.getMinutes();

  const getCalendarPosition = (startDate, endDate, day) => {
    const dayStart = getDayStart(day);
    const nextDayStart = getNextDayStart(day);

    const clippedStart = new Date(
      Math.max(startDate.getTime(), dayStart.getTime())
    );

    const clippedEnd = new Date(
      Math.min(endDate.getTime(), nextDayStart.getTime())
    );

    const startMinutes =
      getMinutesFromMidnight(clippedStart);

    const endMinutes =
      clippedEnd.getTime() === nextDayStart.getTime()
        ? DAY_MINUTES
        : getMinutesFromMidnight(clippedEnd);

    return {
      top: `${(startMinutes / DAY_MINUTES) * 100}%`,
      height: `${((endMinutes - startMinutes) / DAY_MINUTES) * 100}%`,
    };
  };

  const formatTime = (date) =>
    date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatHour = (hour) => {
    if (hour === 0 || hour === 24) return '12AM';
    if (hour < 12) return `${hour}AM`;
    if (hour === 12) return '12PM';
    return `${hour - 12}PM`;
  };

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

  const formatStudyTime = (seconds = 0) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
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

            </div>

            <div className="calendar-grid">
              <div className="calendar-scroll">
                <div className="precise-calendar">
                  <div className="calendar-time-column">
                    <div className="calendar-time-header" />

                    <div className="calendar-time-body">
                      {HOURS.map((hour) => (
                        <div
                          key={hour}
                          className="calendar-hour-label"
                          style={{
                            top: `${(hour / 24) * 100}%`,
                          }}
                        >
                          {formatHour(hour)}
                        </div>
                      ))}
                    </div>
                  </div>

                  {weekDates.map((date) => {
                    const myDaySessions = mySessions
                      .map((session) => {
                        const start = new Date(session.start_time);
                        const end = new Date(session.end_time);

                        const interval = getIntervalForDay(
                          start,
                          end,
                          date
                        );

                        return interval
                          ? { session, start, end }
                          : null;
                      })
                      .filter(Boolean);

                    const friendDaySessions = friendSessions
                      .map((session) => {
                        const start = new Date(session.start_time);
                        const end = new Date(session.end_time);

                        const interval = getIntervalForDay(
                          start,
                          end,
                          date
                        );

                        return interval
                          ? { session, start, end }
                          : null;
                      })
                      .filter(Boolean);

                    const dayOverlaps = overlaps.filter((overlap) =>
                      getIntervalForDay(
                        overlap.start,
                        overlap.end,
                        date
                      )
                    );

                    return (
                      <div
                        className="precise-day-column"
                        key={date.toISOString()}
                      >
                        <div className="precise-day-header">
                          <strong>
                            {date
                              .toLocaleDateString(undefined, {
                                weekday: 'short',
                              })
                              .toUpperCase()}
                          </strong>

                          <span>{date.getDate()}</span>
                        </div>

                        <div className="precise-day-body">
                          {HOURS.map((hour) => (
                            <div
                              key={hour}
                              className="calendar-hour-line"
                              style={{
                                top: `${(hour / 24) * 100}%`,
                              }}
                            />
                          ))}

                          {myDaySessions.map(
                            ({ session, start, end }) => (
                              <div
                                key={`mine-${session.id}`}
                                className="precise-session mine"
                                style={getCalendarPosition(
                                  start,
                                  end,
                                  date
                                )}
                              >
                                <strong>{session.title}</strong>

                                <span>
                                  {formatTime(start)}–{formatTime(end)}
                                </span>

                                <small>YOU</small>
                              </div>
                            )
                          )}

                          {friendDaySessions.map(
                            ({ session, start, end }) => (
                              <div
                                key={`friend-${session.id}`}
                                className="precise-session friend"
                                style={getCalendarPosition(
                                  start,
                                  end,
                                  date
                                )}
                              >
                                <strong>{session.title}</strong>

                                <span>
                                  {formatTime(start)}–{formatTime(end)}
                                </span>

                                <small>
                                  {selectedFriend?.firstName || 'FRIEND'}
                                </small>
                              </div>
                            )
                          )}

                          {dayOverlaps.map((overlap, index) => (
                            <div
                              key={`overlap-${index}`}
                              className="precise-session overlap"
                              style={getCalendarPosition(
                                overlap.start,
                                overlap.end,
                                date
                              )}
                            >
                              <strong>BOTH</strong>

                              <span>
                                {formatTime(overlap.start)}–
                                {formatTime(overlap.end)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
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
                <strong>
                  {formatStudyTime(stats?.todayStudySeconds)}
                </strong>
              </div>

              <div className="stats-row">
                <span>Sessions</span>
                <strong>
                  {stats?.todaySessions ?? 0}
                </strong>
              </div>
            </section>

            <section className="sidebar-box">
              <h2>This Week</h2>

              <div className="stats-row">
                <span>Study Time</span>
                <strong>
                  {formatStudyTime(stats?.weekStudySeconds)}
                </strong>
              </div>

              <div className="stats-row">
                <span>Sessions</span>
                <strong>
                  {stats?.weekSessions ?? 0}
                </strong>
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
                      className={`friend-row ${selectedFriend?.id === friend.id
                        ? 'selected'
                        : ''
                        }`}
                      onClick={() => handleSelectFriend(friend)}
                    >
                      <div className="friend-identity">
                        <strong className="friend-name">
                          {friend.firstName} {friend.lastName}
                        </strong>

                        <span
                          className={`friend-status ${statusClass(
                            friend.studyStatus
                          )}`}
                        >
                          {statusLabel(friend.studyStatus)}
                        </span>
                      </div>

                      {selectedFriend?.id === friend.id && (
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