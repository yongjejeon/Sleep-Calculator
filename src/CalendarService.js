import { gapi } from 'gapi-script';

const CLIENT_ID = process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID;
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

export const initializeGapiClient = () => {
    gapi.load('client:auth2', () => {
        gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES,
        });
    });
};

export const checkForUpcomingEvent = async () => {
    const response = await gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 1,
        singleEvents: true,
        orderBy: 'startTime',
    });

    const events = response.result.items;
    if (events.length > 0) {
        const eventStart = new Date(events[0].start.dateTime || events[0].start.date);
        const now = new Date();
        const timeToEvent = eventStart - now;
        const REM_CYCLE_MS = 90 * 60 * 1000; // 90 minutes in milliseconds
        const maxCycles = Math.floor(timeToEvent / REM_CYCLE_MS);

        if (maxCycles >= 1) {
            const optimalSleepDuration = maxCycles * REM_CYCLE_MS;
            const optimalWakeUpTime = new Date(now.getTime() + optimalSleepDuration);
            
            return {
                mainMessage: `Your next schedule is ${events[0].summary} at ${eventStart.toLocaleTimeString()}.`,
                remCycleMessage: `You have time for ${maxCycles} REM cycle${maxCycles > 1 ? 's' : ''}!`,
                alarmTime: optimalWakeUpTime.toLocaleTimeString(),
            };
        } else {
            return {
                mainMessage: `Your next schedule is ${events[0].summary} at ${eventStart.toLocaleTimeString()}.`,
                remCycleMessage: "There is not enough time for 1 REM Cycle.",
                alarmTime: "",
            };
        }
    }
    return { mainMessage: "No upcoming events found.", remCycleMessage: "", alarmTime: "" };
};


export async function checkForWeeklyEvents() {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    try {
        const response = await gapi.client.calendar.events.list({
            calendarId: "primary",
            timeMin: today.toISOString(),
            timeMax: nextWeek.toISOString(),
            singleEvents: true,
            orderBy: "startTime",
        });

        const events = response.result.items || [];
        return events.map(event => ({
            summary: event.summary,
            start: new Date(event.start.dateTime || event.start.date),
            end: new Date(event.end.dateTime || event.end.date),
        }));
    } catch (error) {
        console.error("Error fetching weekly events:", error);
        return [];
    }
}
