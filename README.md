# Ascend: Career Acceleration & Intelligence

Ascend is a next-generation Career Intelligence platform that delivers deterministic resume parsing, real-time market fit analysis, and unvarnished interview simulations. Built on the MERN stack with highly optimized AI integrations.

## Features
- **Deterministic Resume Parsing:** Deep extraction of skills without fluff.
- **Real-Time Market Fit Analysis:** Match your profile against top-tier tech roles.
- **Universal Skill Radar Engine:** Comprehensive scoring models and role resolution mapping.
- **Interview Simulation:** Practice against rigorous AI-driven interviewers.

## Tech Stack
- **Frontend:** React, React Router, Recharts, Context API (deployed on Vercel)
- **Backend:** Node.js, Express.js, MongoDB, JWT Auth (deployed on Render)
- **AI Integrations:** Groq SDK for ultra-fast inference

## Folder Structure
`
Ascend/
+-- client/       # React Frontend (Create React App)
+-- server/       # Node.js/Express Backend
+-- README.md     # You are here
`

## Installation & Local Setup

### 1. Clone the repository
`ash
git clone https://github.com/YOUR_USERNAME/ascend.git
cd ascend
`

### 2. Backend Setup
`ash
cd server
npm install
`
Create a .env file in the /server directory and add:
`env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ascend?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key
GROQ_API_KEY=your_groq_api_key
NODE_ENV=development
`
Start the server:
`ash
npm run dev
`

### 3. Frontend Setup
`ash
cd ../client
npm install
`
Create a .env file in the /client directory and add:
`env
REACT_APP_API_URL=http://localhost:5000
`
Start the client:
`ash
npm start
`

## Deployment Links
- **Frontend:** [https://your-vercel-app-url.vercel.app](https://your-vercel-app-url.vercel.app)
- **Backend:** [https://your-render-app-url.onrender.com](https://your-render-app-url.onrender.com)

## Author
Developed by Arjun & Antigravity (AI).
