import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  getCurrentUser,
  getFriends,
  getMyPlannedSessions,
  getFriendPlannedSessions,
} from '../api';

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getStatusLabel = (status) => {
    if (status === 'studying') return '● Studying';
    if (status === 'break') return '◐ Break';
    return '○ Offline';
  };

  const getOverlaps = () => {
    const overlaps = [];

    for (const mine of mySessions) {
      for (const theirs of friendSessions) {
        const myStart = new Date(mine.start_time);
        const myEnd = new Date(mine.end_time);

        const theirStart = new Date(theirs.start_time);
        const theirEnd = new Date(theirs.end_time);

        const overlapStart = new Date(
          Math.max(myStart.getTime(), theirStart.getTime())
        );

        const overlapEnd = new Date(
          Math.min(myEnd.getTime(), theirEnd.getTime())
        );

        if (overlapStart < overlapEnd) {
          overlaps.push({
            mySession: mine,
            friendSession: theirs,
            start: overlapStart,
            end: overlapEnd,
          });
        }
      }
    }

    return overlaps;
  };

  const overlaps = getOverlaps();

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <main>
      <h1>Dashboard</h1>

      <p>
        Welcome, {user.firstName} {user.lastName}
      </p>

      <p>{user.email}</p>

      <nav>
        <Link to="/plan-session">+ Plan Session</Link>
        {' | '}
        <Link to="/sessions">Study Sessions</Link>
        {' | '}
        <Link to="/profile">Profile</Link>
      </nav>

      <hr />

      {error && <p>{error}</p>}

      <section>
        <h2>My Planned Sessions</h2>

        {mySessions.length === 0 ? (
          <p>No planned sessions.</p>
        ) : (
          mySessions.map((session) => (
            <article key={session.id}>
              <strong>{session.title}</strong>

              <p>
                {new Date(session.start_time).toLocaleString()}
                {' → '}
                {new Date(session.end_time).toLocaleString()}
              </p>
            </article>
          ))
        )}
      </section>

      <hr />

      <section>
        <h2>Friends</h2>

        {friends.length === 0 ? (
          <p>No friends yet.</p>
        ) : (
          friends.map((friend) => (
            <button
              key={friend.friendshipId}
              onClick={() => handleSelectFriend(friend)}
            >
              {friend.firstName} {friend.lastName}
              {' — '}
              {getStatusLabel(friend.studyStatus)}
            </button>
          ))
        )}
      </section>

      {selectedFriend && (
        <>
          <hr />

          <section>
            <h2>
              {selectedFriend.firstName}'s Planned Sessions
            </h2>

            {friendSessions.length === 0 ? (
              <p>No planned sessions.</p>
            ) : (
              friendSessions.map((session) => (
                <article key={session.id}>
                  <strong>{session.title}</strong>

                  <p>
                    {new Date(session.start_time).toLocaleString()}
                    {' → '}
                    {new Date(session.end_time).toLocaleString()}
                  </p>
                </article>
              ))
            )}
          </section>

          <hr />

          <section>
            <h2>Overlapping Study Times</h2>

            {overlaps.length === 0 ? (
              <p>No overlapping planned study times.</p>
            ) : (
              overlaps.map((overlap, index) => (
                <article key={index}>
                  <p>
                    <strong>
                      {overlap.mySession.title}
                    </strong>
                    {' + '}
                    <strong>
                      {overlap.friendSession.title}
                    </strong>
                  </p>

                  <p>
                    {overlap.start.toLocaleString()}
                    {' → '}
                    {overlap.end.toLocaleString()}
                  </p>
                </article>
              ))
            )}
          </section>
        </>
      )}

      <hr />

      <button onClick={handleLogout}>
        Logout
      </button>
    </main>
  );
}

export default DashboardPage;