import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({ baseURL: API_URL });

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hirectrack_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally and unwrap standardized responses
api.interceptors.response.use(
  (response) => {
    // Automatically unwrap standard response payload from Epic 13 refactor
    if (response.data && response.data.success === true && response.data.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
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
  analyzeATS: (data) => api.post('/student/analyze-ats', data),
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

export const workflowService = {
  createTemplate: (data) => api.post('/workflow/template', data),
  getTemplates: () => api.get('/workflow/template'),
  moveCandidate: (appId, data) => api.post(`/workflow/application/${appId}/transition`, data),
  rejectCandidate: (appId, data) => api.post(`/workflow/application/${appId}/reject`, data),
  getTimeline: (appId) => api.get(`/workflow/application/${appId}/timeline`),
};

export const complianceService = {
  submitRequest: (data) => api.post('/compliance/verify/request', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getPendingRequests: () => api.get('/compliance/verify/pending'),
  processRequest: (id, data) => api.post(`/compliance/verify/${id}/action`, data),
  getAuditLogs: () => api.get('/compliance/audit/logs'),
  validateCompany: (data) => api.post('/compliance/fraud/validate-company', data),
};

export const coachingService = {
  startInterview: (data) => api.post('/coaching/mock-interview/start', data),
  submitAnswer: (attemptId, data) => api.post(`/coaching/mock-interview/${attemptId}/answer`, data),
  completeInterview: (attemptId) => api.post(`/coaching/mock-interview/${attemptId}/complete`),
  getRoadmap: () => api.get('/coaching/roadmap'),
};

export const assessmentService = {
  createAssessment: (data) => api.post('/assessment', data),
  addQuestions: (id, data) => api.post(`/assessment/${id}/questions`, data),
  attachToDrive: (id, driveId) => api.put(`/assessment/${id}/drive/${driveId}`),
  startAttempt: (id) => api.post(`/assessment/${id}/start`),
  submitAnswer: (attemptId, data) => api.post(`/assessment/attempt/${attemptId}/submit`, data),
  finishAttempt: (attemptId) => api.post(`/assessment/attempt/${attemptId}/finish`),
};

export default api;
