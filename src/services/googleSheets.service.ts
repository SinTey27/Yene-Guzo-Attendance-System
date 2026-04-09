// src/services/googleSheets.service.ts

export interface StaffMember {
  email: string;
  code: string;
  name: string;
  position: string;
  terminalID: string;
  firstIP: string;
  status: string;
  joinDate: string;
  lastCheckin: string;
  lastCheckout: string;
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
  action: string;
  lat: number | null;
  lng: number | null;
  ip: string;
  date: string;
  status: string;
  workingHours: string;
}

export interface TodaySummary {
  name: string;
  email: string;
  position: string;
  terminalID: string;
  status: string;
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
  staff: StaffMember[];
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
  searchTerm: string;
}

class GoogleSheetsService {
  private apiUrl: string;

  constructor() {
    if (typeof window !== "undefined") {
      this.apiUrl = `${window.location.origin}/api/google-script`;
    } else {
      this.apiUrl = "/api/google-script";
    }
    console.log("GoogleSheetsService initialized with URL:", this.apiUrl);
  }

  private async callScript<T>(
    action: string,
    params: Record<string, any> = {},
  ): Promise<T> {
    try {
      console.log(`Calling ${action} at ${this.apiUrl}...`);

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...params }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`${action} response:`, data);
      return data as T;
    } catch (error) {
      console.error(`Error calling ${action}:`, error);
      throw error;
    }
  }

  // ========== DASHBOARD FUNCTIONS ==========
  async getDashboardData(): Promise<DashboardData> {
    return this.callScript("getDashboardData");
  }

  async getStaffList(): Promise<StaffMember[]> {
    return this.callScript("getStaffList");
  }

  async getTerminals(): Promise<Terminal[]> {
    return this.callScript("getTerminals");
  }

  async getAllAttendance(): Promise<AttendanceRecord[]> {
    return this.callScript("getAllAttendance");
  }

  async getAttendanceSummary(date?: string): Promise<TodaySummary[]> {
    return this.callScript("getAttendanceSummary", { date });
  }

  // ========== ATTENDANCE FUNCTIONS ==========
  async processAttendance(
    email: string,
    code: string,
    lat: number | null,
    lng: number | null,
    ip: string,
    actionType: "checkin" | "checkout",
  ): Promise<{ success: boolean; message: string; workingHours?: string }> {
    return this.callScript("processAttendance", {
      email,
      code,
      lat,
      lng,
      ip,
      actionType,
    });
  }

  // ========== PAGINATED FUNCTIONS ==========
  async getPaginatedStaff(
    page: number = 1,
    pageSize: number = 10,
    searchTerm: string = "",
  ): Promise<PaginatedResponse<StaffMember>> {
    return this.callScript("getPaginatedStaff", { page, pageSize, searchTerm });
  }

  async getPaginatedAttendance(
    page: number = 1,
    pageSize: number = 10,
    searchTerm: string = "",
    filterType: string = "all",
  ): Promise<PaginatedResponse<AttendanceRecord>> {
    return this.callScript("getPaginatedAttendance", {
      page,
      pageSize,
      searchTerm,
      filterType,
    });
  }

  // ✅ ADD THIS METHOD - for terminals pagination
  async getPaginatedTerminals(
    page: number = 1,
    pageSize: number = 10,
    searchTerm: string = "",
  ): Promise<PaginatedResponse<Terminal>> {
    return this.callScript("getPaginatedTerminals", {
      page,
      pageSize,
      searchTerm,
    });
  }

  // ========== STAFF MANAGEMENT ==========
  async addStaff(
    email: string,
    code: string,
    name: string,
    position: string,
    terminalID: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.callScript("addStaff", {
      email,
      code,
      name,
      position,
      terminalID,
    });
  }

  async updateStaff(
    email: string,
    code: string,
    name: string,
    position: string,
    terminalID: string,
    status: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.callScript("updateStaff", {
      email,
      code,
      name,
      position,
      terminalID,
      status,
    });
  }

  async deleteStaff(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.callScript("deleteStaff", { email });
  }

  // ========== TERMINAL MANAGEMENT ==========
  async addTerminal(
    name: string,
    lat: number,
    lng: number,
    radius: number,
  ): Promise<{ success: boolean; message: string; id?: string }> {
    return this.callScript("addTerminal", { name, lat, lng, radius });
  }

  async updateTerminal(
    id: string,
    name: string,
    lat: number,
    lng: number,
    radius: number,
  ): Promise<{ success: boolean; message: string }> {
    return this.callScript("updateTerminal", { id, name, lat, lng, radius });
  }

  async deleteTerminal(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.callScript("deleteTerminal", { id });
  }

  // ========== REPORT FUNCTIONS ==========
  async generateReport(
    startDate: string,
    endDate: string,
    format: string = "json",
  ): Promise<{ data: any[]; summary: any }> {
    return this.callScript("generateReport", { startDate, endDate, format });
  }
}

export const googleSheetsService = new GoogleSheetsService();
