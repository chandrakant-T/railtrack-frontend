import api from './axios';

export const getDashboardStats = () => api.get('/admin/stats');
export const getAllComplaints = (params) => api.get('/admin/complaints', { params });
export const manageVendorStatus = (id, status) => api.put(`/admin/vendors/${id}/status`, { status });
export const createStationAdmin = (data) => api.post('/admin/station-admin', data);
export const updatePriceList = (id, data) => api.put(`/admin/prices/${id}`, data);