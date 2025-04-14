import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only clear auth data, don't redirect automatically
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Projects endpoints
export const getProjects = () => api.get('/projects');
export const getProjectById = (id) => api.get(`/projects/${id}`);
export const createProject = (projectData) => api.post('/projects', projectData);

// Applications endpoints
export const createApplication = (applicationData) => api.post('/applications', applicationData);
export const getProjectApplications = (projectId) => api.get(`/applications/project/${projectId}`);
export const updateApplicationStatus = (applicationId, status) => api.patch(`/applications/${applicationId}/status`, { status });

export const getworkerApplications = (workerId) => api.get(`/applications/worker/${workerId}`);

// Add getProfile method
api.getProfile = async () => {
  try {
    const response = await api.get('/profile');
    return response;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

// Add specific method for submitting applications
const submitApplication = async (applicationData) => {
  try {
    const response = await api.post('/applications', applicationData);
    return response;
  } catch (error) {
    console.error('Error submitting application:', error);
    throw error;
  }
};

export { submitApplication };
export default api; 