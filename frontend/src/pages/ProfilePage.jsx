import { useEffect, useState } from 'react';

import {
  apiRequest,
  getCurrentUser,
  getUserStats,
  updateCurrentUser,
} from '../api';

import AppNavbar from '../components/AppNavbar';
import socket, { connectSocket } from '../socket';

import './ProfilePage.css';

function ProfilePage() {
  const [user, setUser] = useState(null);

  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);

  const [stats, setStats] = useState({
    totalStudySeconds: 0,
    sessionsCompleted: 0,
  });

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  const [friendEmail, setFriendEmail] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadProfileData = async () => {
    try {
      setError('');

      const [
        userResult,
        friendsResult,
        requestsResult,
        statsResult,
      ] = await Promise.all([
        getCurrentUser(),
        apiRequest('/friends'),
        apiRequest('/friends/requests'),
        getUserStats(),
      ]);

      setUser(userResult.user);

      setFirstName(userResult.user.firstName);
      setLastName(userResult.user.lastName);
      setEmail(userResult.user.email);

      setFriends(friendsResult.friends);
      setRequests(requestsResult.requests);
      setStats(statsResult.stats);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  useEffect(() => {
    connectSocket();

    const handleFriendStatusUpdate = async () => {
      try {
        const result = await apiRequest('/friends');
        setFriends(result.friends);
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

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    try {
      setError('');
      setMessage('');

      const result = await updateCurrentUser(
        firstName,
        lastName,
        email
      );

      setUser(result.user);
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSendRequest = async (event) => {
    event.preventDefault();

    try {
      setError('');
      setMessage('');

      await apiRequest('/friends/requests', {
        method: 'POST',
        body: JSON.stringify({
          email: friendEmail,
        }),
      });

      setFriendEmail('');
      setMessage('Friend request sent.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      setError('');
      setMessage('');

      await apiRequest(
        `/friends/requests/${requestId}/accept`,
        {
          method: 'PATCH',
        }
      );

      setMessage('Friend request accepted.');
      await loadProfileData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDecline = async (requestId) => {
    try {
      setError('');
      setMessage('');

      await apiRequest(
        `/friends/requests/${requestId}`,
        {
          method: 'DELETE',
        }
      );

      setMessage('Friend request declined.');
      await loadProfileData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveFriend = async (friendshipId) => {
    try {
      setError('');
      setMessage('');

      await apiRequest(`/friends/${friendshipId}`, {
        method: 'DELETE',
      });

      setMessage('Friend removed.');
      await loadProfileData();
    } catch (err) {
      setError(err.message);
    }
  };

  const statusLabel = (status) => {
    if (status === 'studying') {
      return '● Studying';
    }

    if (status === 'break') {
      return '◐ Break';
    }

    return '○ Offline';
  };

  const statusClass = (status) => {
    if (status === 'studying') {
      return 'studying';
    }

    if (status === 'break') {
      return 'break';
    }

    return 'offline';
  };

  const formatStudyTime = (totalSeconds) => {
    const hours = Math.floor(
      totalSeconds / 3600
    );

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    );

    if (hours === 0) {
      return `${minutes}m`;
    }

    return `${hours}h ${minutes}m`;
  };

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <AppNavbar />

      <main className="profile-page">
        <header className="profile-heading">
          <h1>Profile</h1>

          <p>
            Manage your account, study statistics,
            and friends.
          </p>
        </header>

        {error && (
          <div className="profile-message error">
            {error}
          </div>
        )}

        {message && (
          <div className="profile-message success">
            {message}
          </div>
        )}

        <section className="profile-card">
          <div className="profile-card-header">
            <h2>USER INFORMATION</h2>
          </div>

          <form
            className="profile-form"
            onSubmit={handleSaveProfile}
          >
            <div className="profile-form-grid">
              <label>
                <span>First Name</span>

                <input
                  type="text"
                  value={firstName}
                  onChange={(event) =>
                    setFirstName(event.target.value)
                  }
                  required
                />
              </label>

              <label>
                <span>Last Name</span>

                <input
                  type="text"
                  value={lastName}
                  onChange={(event) =>
                    setLastName(event.target.value)
                  }
                  required
                />
              </label>

              <label>
                <span>Email</span>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                />
              </label>
            </div>

            <button
              type="submit"
              className="profile-primary-button"
            >
              SAVE CHANGES
            </button>
          </form>
        </section>

        <section className="profile-card">
          <div className="profile-card-header">
            <h2>STUDY STATS</h2>
          </div>

          <div className="stats-grid">
            <div className="profile-stat">
              <strong>
                {formatStudyTime(
                  stats.totalStudySeconds
                )}
              </strong>

              <span>TOTAL STUDY TIME</span>
            </div>

            <div className="profile-stat">
              <strong>
                {stats.sessionsCompleted}
              </strong>

              <span>SESSIONS COMPLETED</span>
            </div>

            <div className="profile-stat">
              <strong>
                {friends.length}
              </strong>

              <span>FRIENDS</span>
            </div>
          </div>
        </section>

        <section className="profile-card">
          <div className="profile-card-header">
            <h2>FRIENDS LIST</h2>
          </div>

          <div className="friends-management">
            <section className="profile-subsection">
              <h3>ADD FRIEND BY EMAIL</h3>

              <form
                className="add-friend-form"
                onSubmit={handleSendRequest}
              >
                <input
                  type="email"
                  placeholder="friend@example.com"
                  value={friendEmail}
                  onChange={(event) =>
                    setFriendEmail(
                      event.target.value
                    )
                  }
                  required
                />

                <button
                  type="submit"
                  className="profile-primary-button"
                >
                  SEND REQUEST
                </button>
              </form>
            </section>

            <section className="profile-subsection">
              <h3>
                FRIEND REQUESTS ({requests.length})
              </h3>

              {requests.length === 0 ? (
                <div className="empty-profile-row">
                  No pending friend requests.
                </div>
              ) : (
                <div className="profile-list">
                  {requests.map((request) => (
                    <article
                      className="profile-list-row"
                      key={request.id}
                    >
                      <div>
                        <strong>
                          {
                            request.requester
                              .firstName
                          }{' '}
                          {
                            request.requester
                              .lastName
                          }
                        </strong>

                        <span>
                          {request.requester.email}
                        </span>
                      </div>

                      <div className="request-actions">
                        <button
                          type="button"
                          className="profile-primary-button small"
                          onClick={() =>
                            handleAccept(
                              request.id
                            )
                          }
                        >
                          ACCEPT
                        </button>

                        <button
                          type="button"
                          className="profile-secondary-button small"
                          onClick={() =>
                            handleDecline(
                              request.id
                            )
                          }
                        >
                          DECLINE
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="profile-subsection">
              <h3>
                MY FRIENDS ({friends.length})
              </h3>

              {friends.length === 0 ? (
                <div className="empty-profile-row">
                  No friends yet.
                </div>
              ) : (
                <div className="profile-list">
                  {friends.map((friend) => (
                    <article
                      className="profile-list-row"
                      key={friend.friendshipId}
                    >
                      <div className="friend-profile-info">
                        <strong>
                          {friend.firstName}{' '}
                          {friend.lastName}
                        </strong>

                        <span>{friend.email}</span>
                      </div>

                      <span
                        className={`profile-friend-status ${statusClass(
                          friend.studyStatus
                        )}`}
                      >
                        {statusLabel(
                          friend.studyStatus
                        )}
                      </span>

                      <button
                        type="button"
                        className="profile-secondary-button small"
                        onClick={() =>
                          handleRemoveFriend(
                            friend.friendshipId
                          )
                        }
                      >
                        REMOVE
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </section>
      </main>
    </>
  );
}

export default ProfilePage;