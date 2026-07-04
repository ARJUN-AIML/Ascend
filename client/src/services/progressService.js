import api from './api';

const getProgress = async () => {
  const res = await api.get('/api/progress');
  return res.data;
};

const awardXP = async (actionType, achievementIds = []) => {
  const res = await api.post('/api/progress/award', { actionType, achievementIds });
  return res.data;
};

const progressService = { getProgress, awardXP };
export default progressService;
