export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const ROLES = { STUDENT: 'STUDENT', COMPANY: 'COMPANY', ADMIN: 'ADMIN' };

export const BRANCHES = [
  'Computer Science', 'Information Technology', 'Electronics',
  'Electrical', 'Mechanical', 'Civil', 'Chemical', 'Aerospace', 'Biotechnology',
];

export const JOB_TYPES = [
  { value: 'FULL_TIME', label: 'Full-Time' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'BOTH', label: 'Both' },
];

export const ROUND_LABELS = {
  cvScreening: 'CV Screening',
  aptitudeTest: 'Aptitude Test',
  technicalRound1: 'Technical Round 1',
  technicalRound2: 'Technical Round 2',
  hrRound: 'HR Round',
};

export const RESULT_LABELS = {
  IN_PROGRESS: 'In Progress',
  SELECTED: 'Selected',
  REJECTED: 'Rejected',
  ON_HOLD: 'On Hold',
};
