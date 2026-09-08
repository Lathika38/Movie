import { api } from './client';

export const musicApi = {
  getMusicProject: async (movieId) => {
    const res = await api.get(`/music/projects/${movieId}`);
    return res.data;
  },
  createMusicProject: async (data) => {
    const res = await api.post('/music/projects', data);
    return res.data;
  },
  getTracks: async (movieId, trackType) => {
    const params = trackType ? `?track_type=${trackType}` : '';
    const res = await api.get(`/music/tracks/${movieId}${params}`);
    return res.data;
  },
  createTrack: async (data) => {
    const res = await api.post('/music/tracks', data);
    return res.data;
  },
  updateTrack: async (trackId, updates) => {
    const res = await api.put(`/music/tracks/${trackId}`, updates);
    return res.data;
  },
  deleteTrack: async (trackId) => {
    const res = await api.delete(`/music/tracks/${trackId}`);
    return res.data;
  },
  submitTrackForReview: async (trackId) => {
    const res = await api.post(`/music/tracks/${trackId}/submit-review`, {});
    return res.data;
  },
  reviewTrack: async (trackId, status, feedback, rating = 5) => {
    const res = await api.post('/music/tracks/review', {
      trackId,
      status,
      feedback,
      rating
    });
    return res.data;
  },
  getThemes: async (movieId) => {
    const res = await api.get(`/music/themes/${movieId}`);
    return res.data;
  },
  createTheme: async (data) => {
    const res = await api.post('/music/themes', data);
    return res.data;
  }
};
