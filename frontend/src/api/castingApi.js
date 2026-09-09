import { api } from './client';

export const castingApi = {
  createCastingRequest: async (requestData, directorId) => {
    const params = directorId ? `?director_id=${directorId}` : '';
    const res = await api.post(`/casting${params}`, requestData);
    return res.data;
  },
  getMovieCastingRequests: async (movieId) => {
    const res = await api.get(`/casting/movie/${movieId}`);
    return res.data;
  },
  getActorCastingRequests: async (actorId) => {
    const res = await api.get(`/casting/actor/${actorId}`);
    return res.data;
  },
  respondToCastingRequest: async (requestId, status, actorResponseNote = '') => {
    const res = await api.patch(`/casting/${requestId}/respond`, {
      status,
      actorResponseNote
    });
    return res.data;
  },
  getScriptCharacterMatches: async (movieId) => {
    const res = await api.get(`/casting/script-matches/${movieId}`);
    return res.data;
  },
  assignDirect: async (payload) => {
    const res = await api.post('/casting/assign-direct', payload);
    return res.data;
  }
};
