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

module.exports = {
  notifyFriendsStatusChanged,
};