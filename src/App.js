import React, { useState, useEffect } from 'react';
import './App.css';
import starsBackground from './stars.jpeg'; 
import { checkForUpcomingEvent, checkForWeeklyEvents, initializeGapiClient } from './CalendarService';
import { gapi } from 'gapi-script';

function App() {
    const [sleepMessage, setSleepMessage] = useState('');
    const [remCycles, setRemCycles] = useState('');
    const [alarmTime, setAlarmTime] = useState('');
    const [userWakeUpTime, setUserWakeUpTime] = useState('');
    const [userAlarmTime, setUserAlarmTime] = useState('');
    const [maxUserRemCycles, setMaxUserRemCycles] = useState('');
    const [conflictMessage, setConflictMessage] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [weeklySchedule, setWeeklySchedule] = useState([]);
    const [countdown, setCountdown] = useState('');

    const handleRunClick = async () => {
        try {
            await new Promise((resolve, reject) => {
                gapi.load('client:auth2', {
                    callback: resolve,
                    onerror: () => reject("Failed to load gapi client"),
                });
            });

            await gapi.client.init({
                apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
                clientId: process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID,
                discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
                scope: "https://www.googleapis.com/auth/calendar.readonly",
            });

            const authInstance = gapi.auth2.getAuthInstance();
            await authInstance.signIn();

            setIsAuthenticated(true);
            setIsRunning(true);
            calculateUserAlarm(); // Calculate user alarm when Run is clicked
            checkWakeUpConflict(); // Check for schedule conflicts with desired wake-up time
        } catch (error) {
            console.error("Error initializing GAPI client or signing in:", error);
        }
    };

    const calculateUserAlarm = () => {
        if (!userWakeUpTime) return;

        const [userHours, userMinutes] = userWakeUpTime.split(":").map(Number);
        const wakeUpDate = new Date();
        wakeUpDate.setHours(userHours);
        wakeUpDate.setMinutes(userMinutes);
        wakeUpDate.setSeconds(0);
        wakeUpDate.setMilliseconds(0);

        const now = new Date();

        // If the wake-up time is earlier than the current time, assume it’s for the next day
        if (wakeUpDate <= now) {
            wakeUpDate.setDate(wakeUpDate.getDate() + 1);
        }

        const REM_CYCLE_MS = 90 * 60 * 1000; // 90 minutes in milliseconds
        let maxCycles = Math.floor((wakeUpDate - now) / REM_CYCLE_MS);

        // Calculate the closest alarm time to fit within the user's desired wake-up time
        if (maxCycles > 0) {
            const closestAlarmTime = new Date(now.getTime() + maxCycles * REM_CYCLE_MS);
            setMaxUserRemCycles(maxCycles);
            setUserAlarmTime(closestAlarmTime.toLocaleTimeString());
        } else {
            setMaxUserRemCycles(0);
            setUserAlarmTime("Not enough time for 1 REM cycle");
        }
    };

    const checkWakeUpConflict = async () => {
        if (!userWakeUpTime) return;

        const [userHours, userMinutes] = userWakeUpTime.split(":").map(Number);
        const wakeUpDate = new Date();
        wakeUpDate.setHours(userHours);
        wakeUpDate.setMinutes(userMinutes);
        wakeUpDate.setSeconds(0);
        wakeUpDate.setMilliseconds(0);

        // Adjust for the next day if the wake-up time is earlier than the current time
        if (wakeUpDate <= new Date()) {
            wakeUpDate.setDate(wakeUpDate.getDate() + 1);
        }

        // Fetch weekly events and check for conflicts
        const events = await checkForWeeklyEvents();
        const conflictingEvent = events.find(
            event => 
                (wakeUpDate >= event.start && wakeUpDate < event.end) // Event overlap with wake-up time
        );

        if (conflictingEvent) {
            setConflictMessage(`You cannot wake up at ${wakeUpDate.toLocaleTimeString()} since there is a ${conflictingEvent.summary} from ${conflictingEvent.start.toLocaleTimeString()} to ${conflictingEvent.end.toLocaleTimeString()}.`);
        } else {
            setConflictMessage('');
        }
    };

    useEffect(() => {
        if (isAuthenticated && isRunning) {
            const fetchEvents = async () => {
                const { mainMessage, remCycleMessage, alarmTime } = await checkForUpcomingEvent();
                setSleepMessage(mainMessage);
                setRemCycles(remCycleMessage);
                setAlarmTime(alarmTime);

                const schedule = await checkForWeeklyEvents();
                setWeeklySchedule(schedule);

                if (schedule.length > 0) {
                    const nextEvent = schedule[0].start;
                    const intervalId = setInterval(() => {
                        const now = new Date();
                        const timeLeft = nextEvent - now;
                        if (timeLeft > 0) {
                            const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
                            const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
                            const seconds = Math.floor((timeLeft / 1000) % 60);
                            setCountdown(`${hours}h ${minutes}m ${seconds}s`);
                        } else {
                            setCountdown("Event started!");
                            clearInterval(intervalId);
                        }
                    }, 1000);

                    return () => clearInterval(intervalId);
                }
            };
            fetchEvents();
        }
    }, [isAuthenticated, isRunning]);

    return (
        <div className="App">
            <div className="fixed-header">
                <h1>Sleep Time Calculator</h1>
                <div className="wake-up-input">
                    <label>
                        Enter the Time you would like to wake up:
                        <input 
                            type="time" 
                            value={userWakeUpTime} 
                            onChange={(e) => setUserWakeUpTime(e.target.value)} 
                        />
                    </label>
                </div>
                <button onClick={handleRunClick}>Run</button>
            </div>

            {/* Scrollable content */}
            <div className="scrollable-content">
                {isRunning && (
                    <>
                        <div className="alarm-box">
                            <p>{sleepMessage}</p>
                            {remCycles && (
                                <div className="rem-message">
                                    <p>{remCycles}</p>
                                    {alarmTime && (
                                        <p>
                                            <strong>Set your alarm clock to:</strong> <span className="alarm-time">{alarmTime}</span>
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="user-alarm-box">
                            <p>You want to wake up around {userWakeUpTime}.</p>
                            {conflictMessage ? (
                                <p className="conflict-message">{conflictMessage}</p>
                            ) : (
                                <>
                                    <p>The current time is: {new Date().toLocaleTimeString()}</p>
                                    <p>The maximum number of REM cycles is: {maxUserRemCycles}</p>
                                    {maxUserRemCycles > 0 && (
                                        <p>
                                            <strong>Set your alarm clock to:</strong> <span className="alarm-time">{userAlarmTime}</span>
                                        </p>
                                    )}
                                </>
                            )}
                        </div>

                        <h2>Weekly Schedule</h2>
                        <div className="schedule-container">
                            <ul>
                                {weeklySchedule.length > 0 ? (
                                    weeklySchedule.map((event, index) => (
                                        <li key={index}>
                                            <strong>{event.summary}</strong><br />
                                            {event.start.toLocaleString()} - {event.end.toLocaleString()}
                                        </li>
                                    ))
                                ) : (
                                    <li>No events scheduled for the week.</li>
                                )}
                            </ul>
                        </div>

                        {countdown && (
                            <div>
                                <h2>Countdown to Next Event</h2>
                                <p className="countdown-text">{countdown}</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default App;










/* global chrome */
// import React, { useState, useEffect } from 'react';
// import './App.css';

// function App() {
//     const [isYouTubePlaying, setIsYouTubePlaying] = useState(false);

//     // Check for the chrome object at the start
//     console.log("React App: chrome object is", typeof chrome !== "undefined" ? "available" : "unavailable");

//     useEffect(() => {
//         console.log("React App: useEffect triggered, setting up interval");

//         const checkYouTubePlayingStatus = () => {
//             console.log("React App: Running checkYouTubePlayingStatus");

//             if (chrome && chrome.storage) {
//                 chrome.storage.local.get("youtubePlaying", (result) => {
//                     console.log("React App: Retrieved youtubePlaying status from storage:", result.youtubePlaying);
//                     setIsYouTubePlaying(result.youtubePlaying || false);
//                 });
//             } else {
//                 console.log("React App: chrome.storage is not available");
//             }
//         };

//         const intervalId = setInterval(checkYouTubePlayingStatus, 5000);
//         checkYouTubePlayingStatus();

//         return () => clearInterval(intervalId);
//     }, []);

//     return (
//         <div className="App">
//             <h1>YouTube Habit Tracker</h1>
//             {isYouTubePlaying ? (
//                 <p>YouTube is running!</p>
//             ) : (
//                 <p>YouTube is not running.</p>
//             )}
//         </div>
//     );
// }

// export default App;

