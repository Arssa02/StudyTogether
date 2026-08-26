import { useEffect, useState } from 'react';
import {
  apiRequest,
  getCurrentUser,
} from '../api';

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [friendEmail, setFriendEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadProfileData = async () => {
    try {
      setError('');

      const [userResult, friendsResult, requestsResult] =
        await Promise.all([
          getCurrentUser(),
          apiRequest('/friends'),
          apiRequest('/friends/requests'),
        ]);

      setUser(userResult.user);
      setFriends(friendsResult.friends);
      setRequests(requestsResult.requests);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const handleSendRequest = async (event) => {
    event.preventDefault();

    try {
      setError('');
      setMessage('');

      await apiRequest('/friends/requests', {
        method: 'POST',
        body: JSON.stringify({ email: friendEmail }),
      });

      setFriendEmail('');
      setMessage('Friend request sent.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await apiRequest(`/friends/requests/${requestId}/accept`, {
        method: 'PATCH',
      });

      await loadProfileData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDecline = async (requestId) => {
    try {
      await apiRequest(`/friends/requests/${requestId}`, {
        method: 'DELETE',
      });

      await loadProfileData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveFriend = async (friendshipId) => {
    try {
      await apiRequest(`/friends/${friendshipId}`, {
        method: 'DELETE',
      });

      await loadProfileData();
    } catch (err) {
      setError(err.message);
    }
  };

  const statusLabel = (status) => {
    if (status === 'studying') return '● Studying';
    if (status === 'break') return '◐ Break';
    return '○ Offline';
  };

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <main className="profile-page">
      <h1>Profile</h1>

      {error && <p>{error}</p>}
      {message && <p>{message}</p>}

      <section>
        <h2>User Information</h2>
        <p>
          {user.firstName} {user.lastName}
        </p>
        <p>{user.email}</p>
      </section>

      <section>
        <h2>Study Statistics</h2>
        <p>Total study time: —</p>
        <p>Sessions completed: —</p>
        <p>Friends: {friends.length}</p>
      </section>

      <section>
        <h2>Add Friend by Email</h2>

        <form onSubmit={handleSendRequest}>
          <input
            type="email"
            placeholder="friend@example.com"
            value={friendEmail}
            onChange={(event) =>
              setFriendEmail(event.target.value)
            }
            required
          />

          <button type="submit">
            Send Request
          </button>
        </form>
      </section>

      <section>
        <h2>Friend Requests</h2>

        {requests.length === 0 ? (
          <p>No pending friend requests.</p>
        ) : (
          requests.map((request) => (
            <div key={request.id}>
              <strong>
                {request.requester.firstName}{' '}
                {request.requester.lastName}
              </strong>

              <p>{request.requester.email}</p>

              <button
                onClick={() => handleAccept(request.id)}
              >
                Accept
              </button>

              <button
                onClick={() => handleDecline(request.id)}
              >
                Decline
              </button>
            </div>
          ))
        )}
      </section>

      <section>
        <h2>Friends</h2>

        {friends.length === 0 ? (
          <p>No friends yet.</p>
        ) : (
          friends.map((friend) => (
            <div key={friend.friendshipId}>
              <strong>
                {friend.firstName} {friend.lastName}
              </strong>

              <p>{friend.email}</p>

              <p>{statusLabel(friend.studyStatus)}</p>

              <button
                onClick={() =>
                  handleRemoveFriend(friend.friendshipId)
                }
              >
                Remove
              </button>
            </div>
          ))
        )}
      </section>
    </main>
  );
}

export default ProfilePage;