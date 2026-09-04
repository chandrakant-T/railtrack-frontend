export const formatCurrency = (amount) =>
  `₹${parseFloat(amount).toFixed(2)}`;

export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

export const getStatusColor = (status) => {
  const map = {
    submitted:    'bg-blue-100 text-blue-800',
    forwarded:    'bg-yellow-100 text-yellow-800',
    acknowledged: 'bg-orange-100 text-orange-800',
    resolved:     'bg-green-100 text-green-800',
    rejected:     'bg-red-100 text-red-800'
  };
  return map[status] || 'bg-gray-100 text-gray-800';
};

export const getVendorStatusColor = (status: string) => {
  const map: Record<string, string> = {
    active:           'bg-green-100 text-green-800',
    suspended:        'bg-yellow-100 text-yellow-800',
    blacklisted:      'bg-red-100 text-red-800',
    pending_approval: 'bg-orange-100 text-orange-800'
  };
  return map[status] || 'bg-gray-100 text-gray-800';
};

export const getPriorityColor = (priority) =>
  priority === 'high'
    ? 'bg-red-100 text-red-800'
    : 'bg-gray-100 text-gray-800';