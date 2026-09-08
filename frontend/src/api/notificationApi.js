import { api } from './client';

export const notificationApi = {
  getUserNotifications: async (userId) => {
    const res = await api.get(`/notifications/user/${userId}`);
    return res.data;
  },
  markAsRead: async (notifId) => {
    const res = await api.patch(`/notifications/${notifId}/read`, {});
    return res.data;
  },
  sendNotification: async (data) => {
    const res = await api.post('/notifications/send', data);
    return res.data;
  },
  getMovieMessages: async (movieId) => {
    const res = await api.get(`/notifications/messages/${movieId}`);
    return res.data;
  },
  sendMovieMessage: async (data) => {
    const res = await api.post('/notifications/messages', data);
    return res.data;
  }
};
