import { api } from './client';

export const scriptApi = {
  analyzeScriptText: async (movieId, scriptContent, version = 'v1.0') => {
    const res = await api.post('/scripts/analyze-text', { movieId, scriptContent, version });
    return res.data;
  },
  uploadScriptFile: async (movieId, file) => {
    const formData = new FormData();
    formData.append('movieId', movieId);
    formData.append('file', file);
    const res = await api.post('/scripts/upload-file', formData);
    return res.data;
  },
  getScenes: async (movieId, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.characterName) params.append('character_name', filters.characterName);
    if (filters.setting) params.append('setting', filters.setting);
    if (filters.timeOfDay) params.append('time_of_day', filters.timeOfDay);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await api.get(`/scripts/scenes/${movieId}${query}`);
    return res.data;
  },
  getCharacters: async (movieId) => {
    const res = await api.get(`/scripts/characters/${movieId}`);
    return res.data;
  },
  updateScene: async (sceneId, updates) => {
    const res = await api.put(`/scripts/scenes/${sceneId}`, updates);
    return res.data;
  }
};
