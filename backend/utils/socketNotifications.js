const friendModel = require('../models/friendModel');

const notifyFriendsStatusChanged = async (
  io,
  userId
) => {
  const friendIds =
    await friendModel.getAcceptedFriendIds(userId);

  for (const friendId of friendIds) {
    io
      .to(`user-${friendId}`)
      .emit('friend-status-updated');
  }
};

const notifyActiveSessionsChanged = async (
  io,
  userId
) => {
  const friendIds =
    await friendModel.getAcceptedFriendIds(userId);

  // Notify the user who caused the change.
  io
    .to(`user-${userId}`)
    .emit('active-sessions-updated');

  // Notify only their accepted friends.
  for (const friendId of friendIds) {
    io
      .to(`user-${friendId}`)
      .emit('active-sessions-updated');
  }
};

module.exports = {
  notifyFriendsStatusChanged,
  notifyActiveSessionsChanged,
};