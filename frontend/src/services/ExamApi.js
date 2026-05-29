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

export const startExam = async () => {
  try {
    const response = await api.post('exams/start/');
    return response.data;
  } catch (error) {
    console.error('Error starting exam:', error);
    throw error;
  }
};

export const submitAnswer = async (sessionId, questionId, selectedOption) => {
  try {
    const response = await api.post('exams/submit-answer/', {
      session_id: sessionId,
      question_id: questionId,
      selected_option: selectedOption,
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting answer:', error);
    throw error;
  }
};

export const getExamResult = async (sessionId) => {
  try {
    const response = await api.get(`exams/result/${sessionId}/`);
    return response.data;
  } catch (error) {
    console.error('Error getting exam result:', error);
    throw error;
  }
};

export default {
  startExam,
  submitAnswer,
  getExamResult,
};
