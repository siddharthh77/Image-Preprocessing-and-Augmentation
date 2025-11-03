import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const uploadDataset = async (formData: FormData) => {
    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

// MODIFIED FUNCTION
export const startCleaning = (jobId: string, params: object) => {
    return axios.post(`${API_BASE_URL}/clean/${jobId}`, params);
};

export const startAugmentation = (jobId: string, params: object) => {
    return axios.post(`${API_BASE_URL}/augment/${jobId}`, params);
};

export const getStatus = (jobId: string) => {
    return axios.get(`${API_BASE_URL}/status/${jobId}`);
};

export const getDownloadLink = (jobId: string, type: 'cleaned' | 'augmented') => {
    return `${API_BASE_URL}/download/${jobId}/${type}`;
};