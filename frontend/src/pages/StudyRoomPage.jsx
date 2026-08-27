import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import socket, { connectSocket } from '../socket';
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
    const [activityHistory, setActivityHistory] = useState([]);
    const [timerSeconds, setTimerSeconds] = useState(0);
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
            setActivityHistory(activityResult.history);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        loadRoom();
    }, [id]);

    useEffect(() => {
        const updateTimer = () => {
            setTimerSeconds(calculateStudySeconds());
        };

        updateTimer();

        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [activityHistory, currentActivity]);

    useEffect(() => {
        connectSocket();

        socket.emit('join-study-room', id);

        socket.on('study-room-updated', () => {
            loadRoom();
        });

        return () => {
            socket.emit('leave-study-room', id);
            socket.off('study-room-updated');
            socket.disconnect();
        };
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

    const calculateStudySeconds = () => {
        let totalMilliseconds = 0;

        for (const activity of activityHistory) {
            if (activity.type !== 'study') {
                continue;
            }

            const start = new Date(activity.start_time);

            const end = activity.end_time
                ? new Date(activity.end_time)
                : new Date();

            totalMilliseconds += end.getTime() - start.getTime();
        }

        return Math.max(
            0,
            Math.floor(totalMilliseconds / 1000)
        );
    };

    const formatStudyTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);

        const minutes = Math.floor(
            (totalSeconds % 3600) / 60
        );

        const seconds = totalSeconds % 60;

        return [
            hours,
            minutes,
            seconds,
        ]
            .map((value) =>
                String(value).padStart(2, '0')
            )
            .join(':');
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
                            participants.map((participant) => (
                                <div
                                    className="participant-desk"
                                    key={participant.participation_id}
                                >
                                    <div className="participant-character">
                                        <div className="character-head" />
                                        <div className="character-body" />

                                        <div className="desk">
                                            <div className="desk-object">
                                                {participant.activity_type === 'break'
                                                    ? '☕'
                                                    : '▰'}
                                            </div>
                                        </div>
                                    </div>

                                    <strong className="participant-name">
                                        {participant.first_name}{' '}
                                        {participant.last_name}
                                    </strong>

                                    <span
                                        className={`participant-state ${participant.activity_type === 'study'
                                            ? 'studying'
                                            : participant.activity_type === 'break'
                                                ? 'break'
                                                : 'not-started'
                                            }`}
                                    >
                                        {participant.activity_type === 'study'
                                            ? 'Studying'
                                            : participant.activity_type === 'break'
                                                ? 'Break'
                                                : 'Not Started'}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="study-controls-area">
                        <div className="study-timer-box">
                            <strong className="timer-value">
                                {formatStudyTime(timerSeconds)}
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