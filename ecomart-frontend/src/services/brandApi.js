import axiosClient from './axiosClient';

export const brandApi = {
  getAll: () => axiosClient.get('/brands'),
};
