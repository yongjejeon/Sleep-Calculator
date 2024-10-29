# Sleep Time Calculator with Google Calendar Integration

This project is a sleep time calculator that integrates with Google Calendar to help you plan your optimal sleep schedule based on your upcoming events. It calculates when you need to go to sleep for a full REM cycle and alerts you if your sleep goal conflicts with any scheduled events. Sleeping for a full REM cycle will allow you to wake up in a fresh state!

## Features
- **Optimal Sleep Calculation**: Calculates the best time to go to sleep based on REM cycles.
- **Event Conflict Detection**: Alerts you if your desired wake-up time conflicts with events in your Google Calendar.
- **Weekly Schedule Display**: Shows upcoming events for the week.

## Setup Instructions

### Prerequisites
1. **Node.js**: Ensure that you have Node.js installed on your machine.
2. **Google API Setup**: You’ll need to set up a Google API project and enable the Google Calendar API.

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/your-repo.git
   cd your-repo
   ```

2. **Install Dependencies**:
   Install the necessary packages by running:
   ```bash
   npm install
   ```
   
3. **Install `gapi-script`**:
   Since this app uses the Google API, install `gapi-script`:
   ```bash
   npm install gapi-script
   ```

4. **Create a `.env` File**:
   In the root directory of your project, create a `.env` file to store your API keys.

   ```plaintext
   REACT_APP_GOOGLE_API_KEY=your_google_api_key
   REACT_APP_GOOGLE_OAUTH_CLIENT_ID=your_oauth_client_id
   ```

   - Replace `your_google_api_key` with your actual Google API key.
   - Replace `your_oauth_client_id` with your OAuth client ID.

### Running the App

1. **Start the Development Server**:
   To run the app locally, use:
   ```bash
   npm start
   ```

2. **Access the App**:
   Open your browser and go to `http://localhost:3000` to use the app.

### Usage

- **Set Desired Wake-Up Time**: Enter the time you'd like to wake up, and click "Run" to calculate the optimal sleep schedule.
- **View Weekly Schedule**: The app displays your weekly events to help you plan around your schedule.

