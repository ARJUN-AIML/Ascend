import api from './api';

const analyzeJobMatch = async (resumeText, jobDescription) => {
  const res = await api.post('/api/ai/jd-match', { resumeText, jobDescription });
  return res.data;
};

const jdMatchEngine = { analyzeJobMatch };
export default jdMatchEngine;
