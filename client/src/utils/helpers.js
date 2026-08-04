export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const getStatusColor = (status) => {
  if (status === true) return 'status-cleared';
  if (status === false) return 'status-rejected';
  if (status === null || status === undefined) return 'status-pending';
  return 'status-na';
};

export const getStatusIcon = (status) => {
  if (status === true) return '✓';
  if (status === false) return '✗';
  if (status === null || status === undefined) return '⏳';
  return '—';
};

export const getResultBadgeClass = (result) => {
  switch (result) {
    case 'SELECTED': return 'status-selected';
    case 'REJECTED': return 'status-rejected';
    case 'ON_HOLD': return 'status-pending';
    default: return 'status-pending';
  }
};

export const getDashboardRoute = (role) => {
  switch (role) {
    case 'STUDENT': return '/student/dashboard';
    case 'COMPANY': return '/company/dashboard';
    case 'ADMIN': return '/admin/dashboard';
    default: return '/';
  }
};

export const daysUntil = (date) => {
  const diff = new Date(date) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
