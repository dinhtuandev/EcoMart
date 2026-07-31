import axiosClient from './axiosClient';

export const authApi = {
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  register: (userData) => axiosClient.post('/auth/register', userData),
  getProfile: () => axiosClient.get('/me'),
  updateProfile: (profileData) => axiosClient.put('/me', profileData),
};
