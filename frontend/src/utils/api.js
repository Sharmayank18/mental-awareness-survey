import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
});

export const submitSurvey = (data) => api.post('/survey', data);

export const getResult = (id) => api.get(`/survey/${id}`);

export const getPdfUrl = (id) =>
  `${BASE_URL}/survey/${id}/pdf`;

export const adminApi = {
  getResults: (params, secret) =>
    api.get('/admin/results', {
      params,
      headers: { 'x-admin-secret': secret },
    }),

  getAnalytics: (secret) =>
    api.get('/admin/analytics', {
      headers: { 'x-admin-secret': secret },
    }),

  getExportUrl: () =>
    `${BASE_URL}/admin/export`,
};