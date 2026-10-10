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
  
  getCertificateLink: async (certificateId) => {
    const response = await apiClient.get(`/certificates/${certificateId}`);
    return response.data;
  },
  
  getJobDownloadUrl: (jobId) => {
    return `${API_URL}/jobs/${jobId}/download`;
  }
};
