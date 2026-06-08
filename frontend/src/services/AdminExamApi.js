import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      alert("Oturum süreniz doldu, lütfen tekrar giriş yapın.");
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// --- Admin Exam Endpoints ---

export const getAdminExams = async () => {
  const response = await api.get('exams/admin/list/');
  return response.data;
};

export const createAdminExam = async (examData) => {
  const response = await api.post('exams/admin/list/', examData);
  return response.data;
};

export const getAdminQuestions = async (level = '', isReading = '', questionType = '') => {
  const params = new URLSearchParams();
  if (level) params.append('level', level);
  if (isReading) params.append('is_reading', isReading);
  if (questionType) params.append('question_type', questionType);

  const response = await api.get('exams/admin/questions/?' + params.toString());
  return response.data;
};

export const createAdminQuestion = async (formData) => {
  // formData can be FormData (multipart) or plain object
  const isFormData = formData instanceof FormData;
  const response = await api.post('exams/admin/questions/', formData, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response.data;
};

export const getExamDetail = async (examId) => {
  const response = await api.get(`exams/admin/detail/${examId}/`);
  return response.data;
};

export const assignExam = async (tc_pasaport_no, exam_id = null) => {
  const payload = { tc_pasaport_no };
  if (exam_id) payload.exam_id = exam_id;
  const response = await api.post('exams/admin/assign/', payload);
  return response.data;
};

export const getMyPendingExams = async () => {
  const response = await api.get('exams/my-assignments/');
  return response.data;
};

export const toggleExamStatus = async (examId) => {
  const response = await api.post(`exams/admin/toggle-status/${examId}/`);
  return response.data;
};

export default {
  getAdminExams,
  createAdminExam,
  getAdminQuestions,
  createAdminQuestion,
  getExamDetail,
  assignExam,
  getMyPendingExams,
  toggleExamStatus,
};
