import api from './api';

const generateInsight = async () => {
  const res = await api.get('/api/ai/insights');
  return res.data;
};

const extractResume = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/api/ai/extract-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

const analyzeResume = async (data) => {
  const res = await api.post('/api/ai/resume-analyze', data);
  return res.data;
};

const analyzeSkillGap = async (data) => {
  const res = await api.post('/api/ai/skill-gap', data);
  return res.data;
};

const aiService = { generateInsight, extractResume, analyzeResume, analyzeSkillGap };
// eslint-disable-next-line import/no-anonymous-default-export
export default aiService;
