import api from './axios';

export const getPriceList = () => api.get('/inventory/prices');
export const getVendorInventory = (vendorId) => api.get(`/inventory/vendor/${vendorId}`);
export const updateVendorInventory = (vendorId, items) => api.put(`/inventory/vendor/${vendorId}`, { items });
export const getFlaggedItems = () => api.get('/inventory/flagged');