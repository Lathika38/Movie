import { api } from './client';

export const weatherApi = {
  getWeather: async (location = 'Los Angeles, CA', date = null) => {
    const params = new URLSearchParams({ location });
    if (date) params.append('date', date);
    const res = await api.get(`/weather?${params.toString()}`);
    return res.data;
  }
};

export const researchApi = {
  searchResearch: async (query, category = 'cinematography') => {
    const params = new URLSearchParams({ query, category });
    const res = await api.get(`/research?${params.toString()}`);
    return res.data;
  }
};

export const seedApi = {
  seedDatabase: async () => {
    const res = await api.post('/seed', {});
    return res.data;
  },
  resetDatabase: async () => {
    const res = await api.post('/seed/reset', {});
    return res.data;
  }
};
