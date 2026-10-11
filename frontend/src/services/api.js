import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  createJob: async (jobData) => {
    const response = await apiClient.post('/jobs/', jobData);
    return response.data;
  },
  
  getJob: async (jobId) => {
    const response = await apiClient.get(`/jobs/${jobId}`);
    return response.data;
  },

  listJobs: async (limit = 20) => {
    const response = await apiClient.get('/jobs/', { params: { limit } });
    return response.data;
  },

  listCertificates: async (query = '', limit = 50) => {
    const response = await apiClient.get('/certificates/', { params: { query: query || undefined, limit } });
    return response.data;
  },
  
  getCertificateLink: async (certificateId) => {
    const response = await apiClient.get(`/certificates/${certificateId}`);
    return response.data;
  },

  getCertificateViewUrl: (certificateId) => {
    return `${API_URL}/certificates/${certificateId}/view`;
  },
  
  getCertificateDownloadUrl: (certificateId, format = 'pdf') => {
    return `${API_URL}/certificates/${certificateId}/download?format=${format}`;
  },
  
  getJobDownloadUrl: (jobId, format = 'pdf') => {
    return `${API_URL}/jobs/${jobId}/download?format=${format}`;
  },

  deleteJob: async (jobId) => {
    const response = await apiClient.delete(`/jobs/${jobId}`);
    return response.data;
  },

  deleteCertificate: async (certificateId) => {
    const response = await apiClient.delete(`/certificates/${certificateId}`);
    return response.data;
  }
};

