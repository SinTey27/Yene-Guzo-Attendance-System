// src/utils/api.ts

// Use Next.js API route as proxy
const API_BASE_URL = "/api/google-script";

export const api = {
  // POST method (for Google Script calls)
  async post(action: string, data: any = {}) {
    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, ...data }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${action}):`, error);
      throw error;
    }
  },

  // GET method (for regular API endpoints if needed)
  async get(endpoint: string) {
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API GET Error:`, error);
      throw error;
    }
  },

  // Dashboard specific methods
  async getDashboardData() {
    return this.post("getDashboardData");
  },

  async getStaffList() {
    return this.post("getStaffList");
  },

  async getTerminals() {
    return this.post("getTerminals");
  },

  async getAllAttendance() {
    return this.post("getAllAttendance");
  },

  async getAttendanceSummary(date?: string) {
    return this.post("getAttendanceSummary", { date });
  },

  async processAttendance(
    email: string,
    code: string,
    lat: number | null,
    lng: number | null,
    ip: string,
    action: string,
  ) {
    return this.post("processAttendance", {
      email,
      code,
      lat,
      lng,
      ip,
      actionType: action,
    });
  },

  async getPaginatedStaff(
    page: number = 1,
    pageSize: number = 10,
    searchTerm: string = "",
  ) {
    return this.post("getPaginatedStaff", { page, pageSize, searchTerm });
  },

  async getPaginatedAttendance(
    page: number = 1,
    pageSize: number = 10,
    searchTerm: string = "",
    filterType: string = "all",
  ) {
    return this.post("getPaginatedAttendance", {
      page,
      pageSize,
      searchTerm,
      filterType,
    });
  },

  async addStaff(
    email: string,
    code: string,
    name: string,
    position: string,
    terminalID: string,
  ) {
    return this.post("addStaff", { email, code, name, position, terminalID });
  },

  async updateStaff(
    email: string,
    code: string,
    name: string,
    position: string,
    terminalID: string,
    status: string,
  ) {
    return this.post("updateStaff", {
      email,
      code,
      name,
      position,
      terminalID,
      status,
    });
  },

  async deleteStaff(email: string) {
    return this.post("deleteStaff", { email });
  },

  async addTerminal(name: string, lat: number, lng: number, radius: number) {
    return this.post("addTerminal", { name, lat, lng, radius });
  },

  async updateTerminal(
    id: string,
    name: string,
    lat: number,
    lng: number,
    radius: number,
  ) {
    return this.post("updateTerminal", { id, name, lat, lng, radius });
  },

  async deleteTerminal(id: string) {
    return this.post("deleteTerminal", { id });
  },

  async generateReport(
    startDate: string,
    endDate: string,
    format: string = "json",
  ) {
    return this.post("generateReport", { startDate, endDate, format });
  },
};
