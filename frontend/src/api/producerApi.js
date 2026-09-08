import { api } from './client';

export const producerApi = {
  // Schedules
  getSchedules: async (movieId) => {
    const res = await api.get(`/producer/schedules/${movieId}`);
    return res.data;
  },
  createSchedule: async (data) => {
    const res = await api.post('/producer/schedules', data);
    return res.data;
  },
  updateSchedule: async (scheduleId, updates) => {
    const res = await api.put(`/producer/schedules/${scheduleId}`, updates);
    return res.data;
  },
  deleteSchedule: async (scheduleId) => {
    const res = await api.delete(`/producer/schedules/${scheduleId}`);
    return res.data;
  },

  // Expenses & Budget
  getExpenses: async (movieId) => {
    const res = await api.get(`/producer/expenses/${movieId}`);
    return res.data;
  },
  logExpense: async (data) => {
    const res = await api.post('/producer/expenses', data);
    return res.data;
  },
  updateExpense: async (expenseId, updates) => {
    const res = await api.put(`/producer/expenses/${expenseId}`, updates);
    return res.data;
  },
  deleteExpense: async (expenseId) => {
    const res = await api.delete(`/producer/expenses/${expenseId}`);
    return res.data;
  },
  getBudgetBreakdown: async (movieId) => {
    const res = await api.get(`/producer/budget-breakdown/${movieId}`);
    return res.data;
  },

  // Departments
  getDepartments: async (movieId) => {
    const res = await api.get(`/producer/departments/${movieId}`);
    return res.data;
  },
  createDepartment: async (data) => {
    const res = await api.post('/producer/departments', data);
    return res.data;
  },
  updateDepartment: async (depId, updates) => {
    const res = await api.put(`/producer/departments/${depId}`, updates);
    return res.data;
  },
  deleteDepartment: async (depId) => {
    const res = await api.delete(`/producer/departments/${depId}`);
    return res.data;
  },

  // Producer AI Assistant Auto-Generate & Fix
  aiGenerateAndFix: async (movieId) => {
    const res = await api.post(`/producer/ai-generate-and-fix/${movieId}`);
    return res.data;
  },

  // Resources
  getResources: async (movieId) => {
    const res = await api.get(`/producer/resources/${movieId}`);
    return res.data;
  },
  createResource: async (data) => {
    const res = await api.post('/producer/resources', data);
    return res.data;
  },
  updateResource: async (resId, updates) => {
    const res = await api.put(`/producer/resources/${resId}`, updates);
    return res.data;
  },

  // Risks
  getRisks: async (movieId) => {
    const res = await api.get(`/producer/risks/${movieId}`);
    return res.data;
  },
  logRisk: async (data) => {
    const res = await api.post('/producer/risks', data);
    return res.data;
  }
};
