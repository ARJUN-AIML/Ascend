import api from './api';

const generateSession = async (role, difficulty, experience) => {
  const res = await api.post('/api/interview/generate', { role, difficulty, experience });
  return res.data;
};

const evaluateSession = async (role, difficulty, experience, sessionData) => {
  const res = await api.post('/api/interview/evaluate', { role, difficulty, experience, sessionData });
  return res.data;
};

const interviewEngine = { generateSession, evaluateSession };
export default interviewEngine;
