import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

export const getDiller = async () => {
  try {
    const response = await api.get('diller/');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching diller:', error);
    return [];
  }
};

export const getSeviyeler = async () => {
  try {
    const response = await api.get('seviyeler/');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching seviyeler:', error);
    return [];
  }
};

export const getSubeler = async () => {
  try {
    const response = await api.get('subeler/');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching subeler:', error);
    return [];
  }
};

export const getUyruklar = async () => {
  try {
    const response = await api.get('uyruklar/');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching uyruklar:', error);
    return [];
  }
};

export const getIndirimler = async () => {
  try {
    // Assuming you have an indirimler endpoint, replace 'indirimler/' if different
    const response = await api.get('indirimler/');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching indirimler:', error);
    return [];
  }
};

export const getSinavTurleri = async () => {
  try {
    // Assuming you have a sinav_turleri endpoint, replace 'sinav-turleri/' if different
    const response = await api.get('sinav-turleri/');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching sinav turleri:', error);
    return [];
  }
};

export const fetchAllFormOptions = async () => {
  try {
    const [diller, seviyeler, subeler, uyruklar, indirimler, sinavTurleri] = await Promise.all([
      getDiller(),
      getSeviyeler(),
      getSubeler(),
      getUyruklar(),
      getIndirimler(),
      getSinavTurleri()
    ]);

    return {
      diller,
      seviyeler,
      subeler,
      uyruklar,
      indirimler,
      sinavTurleri
    };
  } catch (error) {
    console.error('Error in fetchAllFormOptions:', error);
    return {
      diller: [],
      seviyeler: [],
      subeler: [],
      uyruklar: [],
      indirimler: [],
      sinavTurleri: []
    };
  }
};

export const submitApplication = async (endpoint, formData) => {
  try {
    const response = await api.post(endpoint, formData, {
      // Axios usually sets correct headers for FormData automatically
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.error(`Error in submitApplication to ${endpoint}:`, error);
    throw error;
  }
};

export const ogrenciLogin = async (formData) => {
  try {
    const response = await api.post('ogrenci-login/', formData);
    return response;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export default {
  getDiller,
  getSeviyeler,
  getSubeler,
  getUyruklar,
  getIndirimler,
  getSinavTurleri,
  fetchAllFormOptions,
  submitApplication,
  ogrenciLogin,
};
