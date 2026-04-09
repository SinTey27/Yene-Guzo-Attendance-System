export interface Staff {
  email: string;
  code: string;
  name: string;
  position: string;
  terminalID: string;
  firstIP?: string;
  status: "Active" | "Inactive";
  joinDate?: string;
  lastCheckin?: string;
  lastCheckout?: string;
  todayStatus?: "Present" | "Absent" | "Late";
  todayHours?: number;
  isLate?: boolean;
}

export interface Terminal {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
}

export interface AttendanceRecord {
  timestamp: string;
  email: string;
  name: string;
  position: string;
  terminal: string;
  action: "checkin" | "checkout";
  lat?: number | null;
  lng?: number | null;
  ip?: string;
  date: string;
  accuracy?: string;
  distance?: string;
  status?: string;
}

export interface TodaySummary {
  name: string;
  email: string;
  position: string;
  terminalID: string;
  status: "Present" | "Absent" | "Late";
  checkIn: string | null;
  checkOut: string | null;
  workingHours: number;
  isLate: boolean;
  checkInStatus: string;
}

export interface DashboardStats {
  totalStaff: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  attendanceRate: number;
  avgWorkingHours: number;
}

export interface DashboardData {
  staff: Staff[];
  terminals: Terminal[];
  attendance: AttendanceRecord[];
  todaySummary: TodaySummary[];
  stats: DashboardStats;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  searchTerm?: string;
  filterType?: string;
}

export interface ReportRecord {
  date: string;
  name: string;
  position: string;
  email: string;
  checkIn: string | null;
  checkOut: string | null;
  terminal: string;
  checkInStatus: string;
  workingHours: number | string;
}

export interface ReportSummary {
  totalRecords: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  totalHours: string;
  averageHours: string;
}

export interface ReportResponse {
  data: ReportRecord[];
  summary: ReportSummary;
}

export interface SavedUser {
  email: string;
  code: string;
  lastUsed: string;
}
