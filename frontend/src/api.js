const API_BASE_URL = '/api';

const getToken = () => localStorage.getItem('token');

export const apiRequest = async (path, options = {}) => {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
};

export const login = (email, password) =>
  apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const register = (firstName, lastName, email, password) =>
  apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      firstName,
      lastName,
      email,
      password,
    }),
  });

export const getCurrentUser = () =>
  apiRequest('/users/me');

export const getMyPlannedSessions = () =>
  apiRequest('/planned-sessions');

export const createPlannedSession = (title, startTime, endTime) =>
  apiRequest('/planned-sessions', {
    method: 'POST',
    body: JSON.stringify({
      title,
      startTime,
      endTime,
    }),
  });

export const updatePlannedSession = (id, title, startTime, endTime) =>
  apiRequest(`/planned-sessions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      title,
      startTime,
      endTime,
    }),
  });

export const deletePlannedSession = (id) =>
  apiRequest(`/planned-sessions/${id}`, {
    method: 'DELETE',
  });

export const getFriendPlannedSessions = (friendId) =>
  apiRequest(`/planned-sessions/friend/${friendId}`);

export const getFriends = () =>
  apiRequest('/friends');

export const startStudySession = (title) =>
  apiRequest('/study-sessions', {
    method: 'POST',
    body: JSON.stringify({
      title: title?.trim() || null,
    }),
  });

export const getSessionParticipants = (sessionId) =>
  apiRequest(`/study-sessions/${sessionId}/participants`);

export const startStudying = (sessionId) =>
  apiRequest(`/study-sessions/${sessionId}/activity/start`, {
    method: 'POST',
  });

export const takeBreak = (sessionId) =>
  apiRequest(`/study-sessions/${sessionId}/activity/break`, {
    method: 'POST',
  });

export const resumeStudying = (sessionId) =>
  apiRequest(`/study-sessions/${sessionId}/activity/resume`, {
    method: 'POST',
  });

export const getMyStudyActivity = (sessionId) =>
  apiRequest(`/study-sessions/${sessionId}/activity/me`);

export const leaveStudySession = (sessionId) =>
  apiRequest(`/study-sessions/${sessionId}/leave`, {
    method: 'POST',
  });

  export const getActiveStudySessions = () =>
  apiRequest('/study-sessions/active');

export const joinStudySession = (sessionId) =>
  apiRequest(`/study-sessions/${sessionId}/join`, {
    method: 'POST',
  });

  export const startPlannedStudySession = (plannedSessionId) =>
  apiRequest(`/study-sessions/planned/${plannedSessionId}/start`, {
    method: 'POST',
  });

  export const getUserStats = () =>
  apiRequest('/users/stats');

  export const updateCurrentUser = (
  firstName,
  lastName,
  email
) =>
  apiRequest('/users/me', {
    method: 'PATCH',
    body: JSON.stringify({
      firstName,
      lastName,
      email,
    }),
  });