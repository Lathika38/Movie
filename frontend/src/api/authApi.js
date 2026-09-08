import { api } from './client';

export const authApi = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  getProfile: async (userId) => {
    const res = await api.get(`/auth/me/${userId}`);
    return res.data;
  },
  updateProfile: async (userId, updates) => {
    const res = await api.put(`/auth/profile/${userId}`, updates);
    return res.data;
  },
  getUsers: async (role, search) => {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await api.get(`/users${query}`);
    return res.data;
  },
  getActors: async (genre, skill, availableOnly = false) => {
    const params = new URLSearchParams();
    if (genre) params.append('genre', genre);
    if (skill) params.append('skill', skill);
    if (availableOnly) params.append('available_only', 'true');
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await api.get(`/users/actors${query}`);
    return res.data;
  },
  
  // Admin Management Endpoints
  getAdminUsers: async () => {
    const res = await api.get('/admin/users');
    return res.data;
  },
  disableUser: async (uid) => {
    const res = await api.post(`/admin/users/${uid}/disable`, {});
    return res.data;
  },
  enableUser: async (uid) => {
    const res = await api.post(`/admin/users/${uid}/enable`, {});
    return res.data;
  },
  resetPassword: async (uid) => {
    const res = await api.post(`/admin/users/${uid}/reset-password`, {});
    return res.data;
  },
  deleteUser: async (uid) => {
    const res = await api.delete(`/admin/users/${uid}`);
    return res.data;
  }
};
