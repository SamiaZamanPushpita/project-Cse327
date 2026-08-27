const API_BASE = '/api';

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('tms_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'API Request Failed');
  }

  return data;
}

// Dedicated API Methods
export const authApi = {
  login: (credentials: any) => apiRequest<any>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (data: any) => apiRequest<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  me: () => apiRequest<any>('/auth/me'),
};

export const tutorApi = {
  getDashboard: () => apiRequest<any>('/tutor/dashboard'),
  getBatches: () => apiRequest<any>('/tutor/batches'),
  createBatch: (data: any) => apiRequest<any>('/tutor/batches', { method: 'POST', body: JSON.stringify(data) }),
  enrollStudent: (batchId: number, studentId: number) => apiRequest<any>(`/tutor/batches/${batchId}/enroll`, { method: 'POST', body: JSON.stringify({ studentId }) }),
  getStudents: () => apiRequest<any>('/tutor/students'),
  scheduleSession: (data: any) => apiRequest<any>('/tutor/sessions', { method: 'POST', body: JSON.stringify(data) }),
  rescheduleSession: (id: number, data: any) => apiRequest<any>(`/tutor/sessions/${id}/reschedule`, { method: 'PUT', body: JSON.stringify(data) }),
  cancelSession: (id: number) => apiRequest<any>(`/tutor/sessions/${id}/cancel`, { method: 'PUT' }),
  completeSession: (id: number) => apiRequest<any>(`/tutor/sessions/${id}/complete`, { method: 'PUT' }),
  undoLastCommand: () => apiRequest<any>('/tutor/sessions/undo', { method: 'POST' }),
  saveSessionLog: (id: number, data: any) => apiRequest<any>(`/tutor/sessions/${id}/log`, { method: 'POST', body: JSON.stringify(data) }),
  markAttendance: (id: number, records: any[]) => apiRequest<any>(`/tutor/sessions/${id}/attendance`, { method: 'POST', body: JSON.stringify({ attendanceRecords: records }) }),
  uploadMaterial: (data: any) => apiRequest<any>('/tutor/materials', { method: 'POST', body: JSON.stringify(data) }),
  createAssignment: (data: any) => apiRequest<any>('/tutor/assignments', { method: 'POST', body: JSON.stringify(data) }),
  gradeSubmission: (submissionId: number, score: number, feedback: string) => apiRequest<any>(`/tutor/submissions/${submissionId}/grade`, { method: 'POST', body: JSON.stringify({ score, feedback }) }),
  createQuiz: (data: any) => apiRequest<any>('/tutor/quizzes', { method: 'POST', body: JSON.stringify(data) }),
  postAnnouncement: (data: any) => apiRequest<any>('/tutor/announcements', { method: 'POST', body: JSON.stringify(data) }),
  handleScheduleRequest: (id: number, status: 'APPROVED' | 'REJECTED') => apiRequest<any>(`/tutor/schedule-requests/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

export const studentApi = {
  getDashboard: () => apiRequest<any>('/student/dashboard'),
  submitAssignment: (id: number, content: string, fileUrl?: string) => apiRequest<any>(`/student/assignments/${id}/submit`, { method: 'POST', body: JSON.stringify({ content, fileUrl }) }),
  getQuizDetails: (id: number) => apiRequest<any>(`/student/quizzes/${id}`),
  submitQuiz: (id: number, answers: any) => apiRequest<any>(`/student/quizzes/${id}/submit`, { method: 'POST', body: JSON.stringify({ answers }) }),
  evaluateProgress: (strategy: string) => apiRequest<any>(`/student/progress/evaluate?strategy=${strategy}`),
  requestScheduleChange: (data: any) => apiRequest<any>('/student/schedule-change-request', { method: 'POST', body: JSON.stringify(data) }),
};

export const parentApi = {
  getDashboard: () => apiRequest<any>('/parent/dashboard'),
  getChildProgress: (studentId: number) => apiRequest<any>(`/parent/children/${studentId}/progress`),
};

export const notificationApi = {
  getNotifications: () => apiRequest<any>('/notifications'),
  markRead: (id: number) => apiRequest<any>(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllRead: () => apiRequest<any>('/notifications/read-all', { method: 'PUT' }),
};

export const chatApi = {
  getConversations: () => apiRequest<any>('/chat/conversations'),
  getMessages: (convId: number) => apiRequest<any>(`/chat/conversations/${convId}/messages`),
  sendMessage: (convId: number, content: string) => apiRequest<any>(`/chat/conversations/${convId}/messages`, { method: 'POST', body: JSON.stringify({ content }) }),
  startConversation: (targetUserId: number, title?: string) => apiRequest<any>('/chat/conversations', { method: 'POST', body: JSON.stringify({ targetUserId, title }) }),
};

export const patternApi = {
  demonstrateAll: () => apiRequest<any>('/patterns/demonstrate'),
};
