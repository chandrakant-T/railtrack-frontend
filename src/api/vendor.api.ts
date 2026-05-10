import api from './axios';

export const getAllVendors = (params) => api.get('/vendors', { params });
export const getVendorById = (id) => api.get(`/vendors/${id}`);
export const getVendorsByTrain = (trainNumber) => api.get(`/vendors/train/${trainNumber}`);
export const createVendor = (data) => api.post('/vendors', data);
export const updateVendor = (id, data) => api.put(`/vendors/${id}`, data);
export const deleteVendor = (id) => api.delete(`/vendors/${id}`);