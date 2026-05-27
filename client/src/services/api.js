import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hirectrack_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hirectrack_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ──────── Service Objects ────────
export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

export const studentService = {
  getDashboard: () => api.get('/student/dashboard'),
  getEligibleDrives: () => api.get('/student/drives'),
  applyToDrive: (driveId) => api.post(`/student/apply/${driveId}`),
  getApplications: () => api.get('/student/applications'),
  getInterviews: () => api.get('/student/interviews'),
  uploadResume: (formData) => api.post('/student/resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  analyzeFit: (driveId) => api.post('/student/analyze-fit', { driveId }),
  getProfile: () => api.get('/student/profile'),
  updateProfile: (data) => api.put('/student/profile', data),
};

export const companyService = {
  getDashboard: () => api.get('/company/dashboard'),
  createDrive: (data) => api.post('/company/drives', data),
  getDrives: () => api.get('/company/drives'),
  getApplicants: (driveId) => api.get(`/company/applicants/${driveId}`),
  updateShortlist: (appId, data) => api.put(`/company/shortlist/${appId}`, data),
  bulkShortlist: (data) => api.post('/company/bulk-shortlist', data),
  scheduleInterview: (data) => api.post('/company/schedule', data),
  setResult: (appId, data) => api.put(`/company/result/${appId}`, data),
  addFeedback: (slotId, data) => api.put(`/company/feedback/${slotId}`, data),
  exportApplicants: (driveId) => api.get(`/company/export/${driveId}`, { responseType: 'blob' }),
};

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getPendingCompanies: () => api.get('/admin/companies/pending'),
  approveCompany: (id) => api.put(`/admin/companies/${id}/approve`),
  rejectCompany: (id, reason) => api.put(`/admin/companies/${id}/reject`, { reason }),
  getStatistics: () => api.get('/admin/statistics'),
};

export const chatService = {
  sendMessage: (message) => api.post('/chat/send', { message }),
  getHistory: () => api.get('/chat/history'),
  clearHistory: () => api.delete('/chat/history'),
};

export const notificationService = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export default api;
