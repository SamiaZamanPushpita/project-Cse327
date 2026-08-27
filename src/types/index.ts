export type UserRole = 'TUTOR' | 'STUDENT' | 'PARENT';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  profileImage?: string;
  roleProfileId?: number;
  permissions?: string[];
}

export interface Batch {
  id: number;
  tutor_id: number;
  name: string;
  subject: string;
  description: string;
  schedule_info: string;
  enrolled_count?: number;
  created_at?: string;
}

export interface Session {
  id: number;
  tutor_id: number;
  batch_id?: number;
  student_id?: number;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location: string;
  session_type: 'ONE_TO_ONE' | 'BATCH';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  batch_name?: string;
  student_name?: string;
}

export interface LearningMaterial {
  id: number;
  tutor_id: number;
  batch_id?: number;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  uploaded_at: string;
}

export interface Assignment {
  id: number;
  tutor_id: number;
  batch_id?: number;
  title: string;
  description: string;
  deadline: string;
  total_marks: number;
  score?: number;
  feedback?: string;
  submitted_at?: string;
}

export interface QuizQuestion {
  id: number;
  quiz_id: number;
  question_text: string;
  question_type: 'MCQ' | 'SHORT_ANSWER';
  options: string[];
  marks: number;
}

export interface Quiz {
  id: number;
  tutor_id: number;
  batch_id?: number;
  title: string;
  description: string;
  time_limit_mins: number;
  total_marks: number;
  attempt_score?: number;
  attempted_at?: string;
  questions?: QuizQuestion[];
}

export interface Attendance {
  id: number;
  session_id: number;
  student_id: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  notes?: string;
  session_title?: string;
  start_time?: string;
}

export interface SessionLog {
  id: number;
  session_id: number;
  tutor_id: number;
  topics_covered: string;
  homework?: string;
  notes?: string;
  next_session_plan?: string;
  session_title?: string;
  created_at?: string;
}

export interface Announcement {
  id: number;
  tutor_id: number;
  batch_id?: number;
  title: string;
  content: string;
  tutor_name?: string;
  created_at: string;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  link?: string;
  is_read: number;
  created_at: string;
}

export interface ChatMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_name?: string;
  sender_avatar?: string;
  content: string;
  sent_at: string;
}

export interface ChatConversation {
  id: number;
  title: string;
  last_message?: string;
  last_message_at?: string;
  otherParticipant: {
    id: number;
    name: string;
    role: string;
    profile_image?: string;
  };
}

export interface PatternExecutionResult {
  patternId: number;
  name: string;
  description: string;
  fileRef: string;
  executionResult: any;
}
