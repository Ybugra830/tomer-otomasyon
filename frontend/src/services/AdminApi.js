import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/',
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access') || localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const getStudentDetails = async (id) => {
    const response = await api.get(`basvuru-detay/${id}/`);
    return response.data;
};

export const reviewStudentApplication = async (id, action) => {
    const response = await api.post(`basvuru-incele/${id}/`, { action });
    return response.data;
};
