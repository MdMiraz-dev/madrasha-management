export interface Role {
  id: string;
  name: string; // e.g. "Principal", "Vice Principal", "Teacher", "Student", "Guardian"
  permissions: string[];
}

export interface UserProfile {
  id: string; // matches Firebase Auth UID
  roleId: string;
  name: string;
  phone: string; // For WhatsApp automation
  photoUrl?: string;
}

export interface Student {
  id: string; // matches UserProfile ID
  guardianPhone: string; // WhatsApp communication
  classScheduleId: string;
  mealPlanId: string;
  attendanceRecords: string[]; // List of attendance record IDs
  rollNumber?: string;
  serialNumber?: string;
}

export interface ClassSchedule {
  id: string;
  className: string;
  routine: Record<string, any>; // Days -> subjects -> times
}

export interface MealPlan {
  id: string;
  planName: string;
  details: string;
}
