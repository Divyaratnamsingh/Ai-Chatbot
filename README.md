# MindWell

MindWell is an AI-powered Mental Health & Wellness companion app. It provides a conversational AI chatbot, mood tracking, daily journaling, wellness analytics, and meditation tools to help users track and improve their mental health.

## Features
- **AI Chat**: Conversational AI powered by Google Gemini for empathetic support.
- **Mood Tracker**: Log your daily moods, activities, and emotions with visual trends.
- **Journal**: Guided journaling with AI prompts.
- **Wellness Hub**: Breathing exercises, meditation timers, and daily affirmations.
- **Analytics**: Visualize your mental health progress over time with a unified wellness score.

## Tech Stack
- **Frontend**: React 19, Vite, Material UI (MUI), Recharts
- **Backend**: Node.js, Express, MongoDB (Mongoose), Google Gemini API
- **Design System**: "Serene Modernity" Google Stitch aesthetics (Teals, Sage Greens, Warm Neutrals)

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB connection string
- Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd chatbot
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   ```
   - Create a `.env` file in the `backend` folder with:
     ```env
     PORT=5000
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     GEMINI_API_KEY=your_gemini_api_key
     ```
   - Start the backend server:
     ```bash
     npm run dev
     ```

3. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   ```
   - Start the frontend server:
     ```bash
     npm run dev
     ```

4. **Open Application:**
   Visit `http://localhost:5173` in your browser.

## Disclaimer
MindWell is a self-care tool and is not a replacement for professional therapy or medical advice. Crisis resources are available in the Wellness Hub for immediate support.
