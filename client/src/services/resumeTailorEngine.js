import api from './api';

const tailorResume = async (resumeText, jobDescription) => {
  const res = await api.post('/api/ai/resume-tailor', { resumeText, jobDescription });
  return res.data;
};

const resumeTailorEngine = { tailorResume };
export default resumeTailorEngine;
