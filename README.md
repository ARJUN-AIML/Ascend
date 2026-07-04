# Ascend — Career Intelligence Platform

Ascend is a career intelligence platform built to help students and aspiring tech professionals prepare for interviews and understand their market fit. Instead of generic advice, it parses resumes to identify actual skill gaps, compares profiles against real job requirements, and provides AI-driven interview practice.

---

## 🚀 Live Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | https://ascend-seven-lake.vercel.app |
| Backend API | Render | https://ascend-backend-xmfc.onrender.com |

> **Note:** The backend API is hosted on Render's free tier. If the application has been inactive, the first request may take **30–60 seconds** to wake up the server. Subsequent requests will be fast.

---

## ✨ Features
- **Resume Parsing:** Accurately extracts skills from your resume to identify missing technologies.
- **Market Fit Analysis:** Compares your current skill set against standard requirements for your target role.
- **Skill Radar:** Visualizes your strengths and weaknesses using dynamic charts.
- **Interview Practice:** Offers technical interview simulations using AI to help you practice in a realistic setting.

---

## 🛠 Tech Stack

Built with a standard MERN stack, separated into a client and server application.

### Frontend
- **React.js** (Create React App)
- **React Router** for navigation
- **Recharts** for data visualization
- **Context API** for state management

### Backend
- **Node.js & Express.js** for the REST API
- **JSON Web Tokens (JWT)** via HTTP-only cookies for authentication
- **Helmet & Express Rate Limit** for API security

### Database
- **MongoDB Atlas** for cloud database storage
- **Mongoose** for data modeling

### AI Integration
- **Groq SDK** for fast AI inference

### Deployment
- **Vercel** (Frontend)
- **Render** (Backend)

---

## 🏗 Architecture

The app uses a decoupled client-server architecture:

1. **Client (Vercel):** The React frontend handles all UI state and rendering. It communicates with the backend via REST API calls using Axios.
2. **API (Render):** The Express server handles authentication, rate-limiting, and AI processing.
3. **Database (MongoDB):** Stores user profiles, progress, and interview history.

```text
[ React Frontend ]  <-- (REST API over HTTPS) -->  [ Node.js/Express Backend ]
       |                                                    |
   (Vercel)                                            (Render)
                                                            |
                                                            v
                                                   [ MongoDB Atlas ]
```

---

## 💻 Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/ascend.git
cd ascend
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` folder:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ascend?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key
GROQ_API_KEY=your_groq_api_key
NODE_ENV=development
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```
Create a `.env` file in the `client` folder:
```env
REACT_APP_API_URL=http://localhost:5000
```
Start the frontend client:
```bash
npm start
```

---

## 👤 Author
**Arjun S**  
Artificial Intelligence & Machine Learning Engineer  
Passionate about AI, full-stack development, and building impactful products.
