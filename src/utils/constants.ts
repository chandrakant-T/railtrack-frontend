export const API_BASE = 'http://localhost:3000/api';

export const ROLES = {
  PASSENGER: 'passenger',
  VENDOR: 'vendor',
  STATION_ADMIN: 'station_admin',
  SUPER_ADMIN: 'super_admin'
};

export const COMPLAINT_TYPES = {
  OVERCHARGING: 'overcharging',
  CASH_DEMAND: 'cash_demand'
};

export const COMPLAINT_STATUS = {
  SUBMITTED: 'submitted',
  FORWARDED: 'forwarded',
  ACKNOWLEDGED: 'acknowledged',
  RESOLVED: 'resolved',
  REJECTED: 'rejected'
};

export const VENDOR_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  BLACKLISTED: 'blacklisted'
};