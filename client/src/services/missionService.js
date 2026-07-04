import api from './api';

const getTodayMissions = async () => {
  const res = await api.get('/api/copilot/missions');
  return res.data;
};

const updateMissionStatus = async (id, status) => {
  const res = await api.patch(`/api/copilot/missions/${id}`, { status });
  return res.data;
};

const missionService = { getTodayMissions, updateMissionStatus };
export default missionService;
