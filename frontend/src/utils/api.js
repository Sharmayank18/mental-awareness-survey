import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5001/api' });

export const submitSurvey = (data) => api.post('/survey', data);
export const getResult = (id) => api.get(`/survey/${id}`);
export const getPdfUrl = (id) => `http://localhost:5001/api/survey/${id}/pdf`;

export const adminApi = {
  getResults: (params, secret) =>
    api.get('/admin/results', { params, headers: { 'x-admin-secret': secret } }),
  getAnalytics: (secret) =>
    api.get('/admin/analytics', { headers: { 'x-admin-secret': secret } }),
  getExportUrl: () => `http://localhost:5001/api/admin/export`,
};
