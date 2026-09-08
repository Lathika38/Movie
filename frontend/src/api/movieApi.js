import { api } from './client';

export const movieApi = {
  getMovies: async (userId, role, statusFilter) => {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    if (role) params.append('role', role);
    if (statusFilter) params.append('status_filter', statusFilter);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await api.get(`/movies${query}`);
    return res.data;
  },
  getMovie: async (movieId, userId) => {
    const query = userId ? `?user_id=${userId}` : '';
    const res = await api.get(`/movies/${movieId}${query}`);
    return res.data;
  },
  createMovie: async (movieData) => {
    const res = await api.post('/movies', movieData);
    return res.data;
  },
  updateMovie: async (movieId, updates, userId) => {
    const query = userId ? `?user_id=${userId}` : '';
    const res = await api.put(`/movies/${movieId}${query}`, updates);
    return res.data;
  },
  deleteMovie: async (movieId, userId) => {
    const query = userId ? `?user_id=${userId}` : '';
    const res = await api.delete(`/movies/${movieId}${query}`);
    return res.data;
  }
};
