import api from './axios';

export const fileComplaint = (data) => api.post('/complaints', data);
export const trackComplaint = (referenceId) => api.get(`/complaints/track/${referenceId}`);
export const getMyComplaints = () => api.get('/complaints/my');
export const getStationComplaints = (params) => api.get('/complaints/station', { params });
export const updateComplaintStatus = (id, data) => api.put(`/complaints/${id}/status`, data);