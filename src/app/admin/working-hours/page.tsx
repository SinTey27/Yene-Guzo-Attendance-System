"use client";

import { useEffect, useState } from "react";
import {
  FiClock,
  FiCalendar,
  FiDownload,
  FiSearch,
  FiTrendingUp,
  FiAward,
  FiUser,
  FiMapPin,
  FiChevronDown,
  FiFileText,
  FiHelpCircle,
} from "react-icons/fi";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useRouter } from "next/navigation";

// Define interfaces at the top
interface WorkingHoursRecord {
  date: string;
  name: string;
  position: string;
  terminal: string;
  checkIn: string | null;
  checkOut: string | null;
  hours: number;
  regularHours: number;
  overtimeHours: number;
  status: "Present" | "Absent" | "Late" | "Half Day";
  isLate: boolean;
}

interface WorkingHoursSummary {
  totalStaff: number;
  totalHours: number;
  totalRegularHours: number;
  totalOvertimeHours: number;
  averageHoursPerStaff: number;
  attendanceRate: number;
  presentDays: number;
  totalDays: number;
}

interface TerminalSummary {
  terminal: string;
  totalHours: number;
  overtimeHours: number;
  staffCount: number;
  attendanceRate: number;
}

export default function WorkingHoursPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [workingHours, setWorkingHours] = useState<WorkingHoursRecord[]>([]);
  const [filteredData, setFilteredData] = useState<WorkingHoursRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [summary, setSummary] = useState<WorkingHoursSummary>({
    totalStaff: 0,
    totalHours: 0,
    totalRegularHours: 0,
    totalOvertimeHours: 0,
    averageHoursPerStaff: 0,
    attendanceRate: 0,
    presentDays: 0,
    totalDays: 0,
  });
  const [terminalSummary, setTerminalSummary] = useState<TerminalSummary[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Mock working hours data with Terminal instead of Department
  const mockWorkingHoursData: WorkingHoursRecord[] = [
    {
      date: "2024-03-25",
      name: "Abebe Kebede",
      position: "Software Engineer",
      terminal: "Terminal A",
      checkIn: "08:45",
      checkOut: "17:30",
      hours: 8.75,
      regularHours: 8,
      overtimeHours: 0.75,
      status: "Present",
      isLate: false,
    },
    {
      date: "2024-03-25",
      name: "Sara Hailu",
      position: "Product Manager",
      terminal: "Terminal B",
      checkIn: "09:00",
      checkOut: "17:45",
      hours: 8.75,
      regularHours: 8,
      overtimeHours: 0.75,
      status: "Present",
      isLate: false,
    },
    {
      date: "2024-03-25",
      name: "Tekle Berhan",
      position: "UX Designer",
      terminal: "Terminal A",
      checkIn: "09:30",
      checkOut: "18:00",
      hours: 8.5,
      regularHours: 8,
      overtimeHours: 0.5,
      status: "Late",
      isLate: true,
    },
    {
      date: "2024-03-24",
      name: "Abebe Kebede",
      position: "Software Engineer",
      terminal: "Terminal A",
      checkIn: "08:30",
      checkOut: "17:15",
      hours: 8.75,
      regularHours: 8,
      overtimeHours: 0.75,
      status: "Present",
      isLate: false,
    },
    {
      date: "2024-03-24",
      name: "Sara Hailu",
      position: "Product Manager",
      terminal: "Terminal B",
      checkIn: "08:50",
      checkOut: "17:30",
      hours: 8.67,
      regularHours: 8,
      overtimeHours: 0.67,
      status: "Present",
      isLate: false,
    },
    {
      date: "2024-03-24",
      name: "Tekle Berhan",
      position: "UX Designer",
      terminal: "Terminal A",
      checkIn: null,
      checkOut: null,
      hours: 0,
      regularHours: 0,
      overtimeHours: 0,
      status: "Absent",
      isLate: false,
    },
    {
      date: "2024-03-23",
      name: "Meron Tesfaye",
      position: "Marketing Specialist",
      terminal: "Terminal C",
      checkIn: "08:55",
      checkOut: "17:15",
      hours: 8.33,
      regularHours: 8,
      overtimeHours: 0.33,
      status: "Present",
      isLate: false,
    },
    {
      date: "2024-03-23",
      name: "Dawit Mekonnen",
      position: "DevOps Engineer",
      terminal: "Terminal B",
      checkIn: "08:30",
      checkOut: "18:30",
      hours: 10.0,
      regularHours: 8,
      overtimeHours: 2.0,
      status: "Present",
      isLate: false,
    },
    {
      date: "2024-03-22",
      name: "Meron Tesfaye",
      position: "Marketing Specialist",
      terminal: "Terminal C",
      checkIn: null,
      checkOut: null,
      hours: 0,
      regularHours: 0,
      overtimeHours: 0,
      status: "Absent",
      isLate: false,
    },
    {
      date: "2024-03-22",
      name: "Dawit Mekonnen",
      position: "DevOps Engineer",
      terminal: "Terminal B",
      checkIn: "09:15",
      checkOut: "18:00",
      hours: 8.75,
      regularHours: 8,
      overtimeHours: 0.75,
      status: "Late",
      isLate: true,
    },
  ];

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminToken");
    if (!isLoggedIn) {
      router.push("/admin/login");
      return;
    }

    // Set default dates to current month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    setStartDate(firstDay.toISOString().split("T")[0]);
    setEndDate(lastDay.toISOString().split("T")[0]);

    setWorkingHours(mockWorkingHoursData);
  }, [router]);

  // Function to filter data based on date range and search query
  const applyFilters = (dateStart: string, dateEnd: string, search: string) => {
    let filtered = workingHours.filter((record) => {
      return record.date >= dateStart && record.date <= dateEnd;
    });

    if (search) {
      filtered = filtered.filter(
        (record) =>
          record.name.toLowerCase().includes(search.toLowerCase()) ||
          record.position.toLowerCase().includes(search.toLowerCase()) ||
          record.terminal.toLowerCase().includes(search.toLowerCase()),
      );
    }

    return filtered;
  };

  // Function to calculate summary from filtered data
  const calculateSummaryData = (filtered: WorkingHoursRecord[]) => {
    const uniqueStaff = new Set(filtered.map((r) => r.name));
    const totalHours = filtered.reduce((sum, r) => sum + r.hours, 0);
    const totalRegularHours = filtered.reduce(
      (sum, r) => sum + r.regularHours,
      0,
    );
    const totalOvertimeHours = filtered.reduce(
      (sum, r) => sum + r.overtimeHours,
      0,
    );
    const presentDays = filtered.filter((r) => r.status !== "Absent").length;
    const totalDays = filtered.length;
    const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    // Terminal summary
    const terminalMap = new Map<
      string,
      { totalHours: number; overtimeHours: number; staffCount: Set<string> }
    >();
    filtered.forEach((record) => {
      if (!terminalMap.has(record.terminal)) {
        terminalMap.set(record.terminal, {
          totalHours: 0,
          overtimeHours: 0,
          staffCount: new Set(),
        });
      }
      const terminal = terminalMap.get(record.terminal)!;
      terminal.totalHours += record.hours;
      terminal.overtimeHours += record.overtimeHours;
      terminal.staffCount.add(record.name);
    });

    const terminalSummary: TerminalSummary[] = Array.from(
      terminalMap.entries(),
    ).map(([terminal, data]) => ({
      terminal: terminal,
      totalHours: Math.round(data.totalHours * 100) / 100,
      overtimeHours: Math.round(data.overtimeHours * 100) / 100,
      staffCount: data.staffCount.size,
      attendanceRate: Math.min(
        100,
        (data.totalHours /
          (data.staffCount.size * 8 * (filtered.length / uniqueStaff.size))) *
          100,
      ),
    }));

    return {
      summary: {
        totalStaff: uniqueStaff.size,
        totalHours: Math.round(totalHours * 100) / 100,
        totalRegularHours: Math.round(totalRegularHours * 100) / 100,
        totalOvertimeHours: Math.round(totalOvertimeHours * 100) / 100,
        averageHoursPerStaff:
          uniqueStaff.size > 0
            ? Math.round((totalHours / uniqueStaff.size) * 100) / 100
            : 0,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
        presentDays,
        totalDays,
      },
      terminalSummary: terminalSummary,
    };
  };

  // Generate Report (respects current date range and search query)
  const generateReport = () => {
    setLoading(true);
    setTimeout(() => {
      const filtered = applyFilters(startDate, endDate, searchQuery);
      setFilteredData(filtered);
      const { summary: newSummary, terminalSummary: newTerminalSummary } =
        calculateSummaryData(filtered);
      setSummary(newSummary);
      setTerminalSummary(newTerminalSummary);
      setShowSummary(true);
      setCurrentPage(1);
      setLoading(false);
    }, 500);
  };

  // Search function - updates searchQuery and triggers report generation
  const handleSearch = () => {
    setSearchQuery(searchTerm);
    setLoading(true);
    setTimeout(() => {
      const filtered = applyFilters(startDate, endDate, searchTerm);
      setFilteredData(filtered);
      const { summary: newSummary, terminalSummary: newTerminalSummary } =
        calculateSummaryData(filtered);
      setSummary(newSummary);
      setTerminalSummary(newTerminalSummary);
      setShowSummary(true);
      setCurrentPage(1);
      setLoading(false);
    }, 500);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
    setSearchQuery("");
    setLoading(true);
    setTimeout(() => {
      const filtered = applyFilters(startDate, endDate, "");
      setFilteredData(filtered);
      const { summary: newSummary, terminalSummary: newTerminalSummary } =
        calculateSummaryData(filtered);
      setSummary(newSummary);
      setTerminalSummary(newTerminalSummary);
      setShowSummary(true);
      setCurrentPage(1);
      setLoading(false);
    }, 500);
  };

  // Handle date change
  const handleDateChange = (type: "start" | "end", value: string) => {
    if (type === "start") {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
    // Don't auto-generate - wait for user to click Generate
  };

  const formatHours = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const getStatusBadge = (status: string, isLate: boolean) => {
    if (isLate) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
          Late
        </span>
      );
    }
    switch (status) {
      case "Present":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
            Present
          </span>
        );
      case "Absent":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
            Absent
          </span>
        );
      case "Half Day":
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">
            Half Day
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const setDateRange = (type: "today" | "week" | "month") => {
    const today = new Date();
    let start = "";
    let end = "";

    if (type === "today") {
      start = today.toISOString().split("T")[0];
      end = today.toISOString().split("T")[0];
    } else if (type === "week") {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      start = weekAgo.toISOString().split("T")[0];
      end = today.toISOString().split("T")[0];
    } else if (type === "month") {
      const monthAgo = new Date(today);
      monthAgo.setDate(today.getDate() - 30);
      start = monthAgo.toISOString().split("T")[0];
      end = today.toISOString().split("T")[0];
    }

    setStartDate(start);
    setEndDate(end);
  };

  const exportToCSV = () => {
    if (filteredData.length === 0) {
      alert("No data to export. Please generate a report first.");
      return;
    }

    const headers = [
      "Date",
      "Name",
      "Terminal",
      "Position",
      "Check In",
      "Check Out",
      "Total Hours",
      "Regular Hours",
      "Overtime",
      "Status",
    ];
    const rows = filteredData.map((record) => [
      record.date,
      record.name,
      record.terminal,
      record.position,
      record.checkIn || "-",
      record.checkOut || "-",
      formatHours(record.hours),
      formatHours(record.regularHours),
      formatHours(record.overtimeHours),
      record.isLate ? "Late" : record.status,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute(
      "download",
      `working-hours-${startDate}-to-${endDate}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    router.push("/admin/login");
  };

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 w-64">
          <Sidebar onLogout={handleLogout} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar onLogout={handleLogout} />
      </div>

      <div className="flex-1 lg:ml-64 overflow-y-auto">
        <Header
          title="Working Hours"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FiCalendar className="text-[#EB7D23]" />
                Generate Working Hours Report
                <div className="relative group ml-2">
                  <FiHelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10">
                    Overtime is calculated as hours worked beyond 8 hours per
                    day
                  </div>
                </div>
              </h3>
            </div>

            <div className="p-6">
              {/* Quick Date Selectors */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setDateRange("today")}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setDateRange("week")}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Last 7 Days
                </button>
                <button
                  type="button"
                  onClick={() => setDateRange("month")}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Last 30 Days
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    const firstDay = new Date(
                      today.getFullYear(),
                      today.getMonth(),
                      1,
                    );
                    const lastDay = new Date(
                      today.getFullYear(),
                      today.getMonth() + 1,
                      0,
                    );
                    setStartDate(firstDay.toISOString().split("T")[0]);
                    setEndDate(lastDay.toISOString().split("T")[0]);
                  }}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  This Month
                </button>
              </div>

              {/* Date Range and Search */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleDateChange("start", e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EB7D23] focus:border-transparent"
                  />
                </div>
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => handleDateChange("end", e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EB7D23] focus:border-transparent"
                  />
                </div>
                <div className="flex-1 min-w-[250px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Staff
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Search by name, position, terminal..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EB7D23] focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleSearch}
                      disabled={loading}
                      className="px-4 py-1.5 bg-[#EB7D23] text-white rounded-lg hover:bg-[#f08c3a] transition-all flex items-center gap-2 disabled:opacity-50 text-sm"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FiSearch />
                      )}
                      Search
                    </button>
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="px-4 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all text-sm"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {searchQuery && (
                    <p className="text-xs text-gray-500 mt-1">
                      Showing results for: <strong>"{searchQuery}"</strong>
                    </p>
                  )}
                </div>
                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    onClick={generateReport}
                    disabled={loading}
                    className="px-4 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all flex items-center gap-2 disabled:opacity-50 text-sm"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiCalendar />
                    )}
                    Generate All
                  </button>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowExportOptions(!showExportOptions)}
                      className="px-4 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all flex items-center gap-2 text-sm"
                    >
                      <FiDownload />
                      Export
                      <FiChevronDown className="w-3 h-3" />
                    </button>
                    {showExportOptions && (
                      <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                        <button
                          type="button"
                          onClick={exportToCSV}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <FiFileText /> CSV
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Summary Section */}
              {showSummary && (
                <div className="mb-6 p-5 bg-gradient-to-r from-[#02404F]/5 to-[#EB7D23]/5 rounded-xl border border-[#EB7D23]/20">
                  <h4 className="text-[#02404F] font-semibold mb-4 flex items-center gap-2">
                    <FiTrendingUp className="text-[#EB7D23]" />
                    Working Hours Summary
                    {searchQuery && (
                      <span className="text-xs bg-[#EB7D23]/20 text-[#EB7D23] px-2 py-1 rounded-full">
                        Filtered by: {searchQuery}
                      </span>
                    )}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-xs text-gray-500 mb-1">
                        Total Staff
                      </div>
                      <div className="text-2xl font-bold text-[#02404F]">
                        {summary.totalStaff}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-xs text-gray-500 mb-1">
                        Total Hours
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatHours(summary.totalHours)}
                      </div>
                      <div className="text-xs text-gray-400">
                        Reg: {formatHours(summary.totalRegularHours)}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-xs text-gray-500 mb-1">
                        Overtime Hours
                      </div>
                      <div className="text-2xl font-bold text-orange-600">
                        {formatHours(summary.totalOvertimeHours)}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-xs text-gray-500 mb-1">
                        Attendance Rate
                      </div>
                      <div className="text-2xl font-bold text-purple-600">
                        {summary.attendanceRate}%
                      </div>
                      <div className="text-xs text-gray-400">
                        {summary.presentDays}/{summary.totalDays} days
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-xs text-gray-500 mb-1">
                        Avg Hours/Staff
                      </div>
                      <div className="text-2xl font-bold text-[#02404F]">
                        {formatHours(summary.averageHoursPerStaff)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Terminal Summary */}
              {showSummary && terminalSummary.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FiMapPin className="text-[#EB7D23]" />
                    Terminal Summary
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Terminal
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Staff
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Total Hours
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Overtime
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Attendance Rate
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {terminalSummary.map((terminal, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm font-medium text-gray-900">
                              {terminal.terminal}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {terminal.staffCount}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {formatHours(terminal.totalHours)}
                            </td>
                            <td className="px-4 py-2 text-sm text-orange-600">
                              {formatHours(terminal.overtimeHours)}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{
                                      width: `${terminal.attendanceRate}%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="text-xs">
                                  {Math.round(terminal.attendanceRate)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Working Hours Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Terminal
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Position
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Check In
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Check Out
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Hours
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Overtime
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-12 text-center">
                          <div className="flex justify-center">
                            <div className="w-8 h-8 border-2 border-[#EB7D23] border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        </td>
                      </tr>
                    ) : paginatedData.length > 0 ? (
                      paginatedData.map((record, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {record.date}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {record.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {record.terminal}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {record.position}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {record.checkIn || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {record.checkOut || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {formatHours(record.hours)}
                          </td>
                          <td className="px-4 py-3 text-sm text-orange-600">
                            {record.overtimeHours > 0
                              ? `+${formatHours(record.overtimeHours)}`
                              : "-"}
                          </td>
                          <td className="px-4 py-3">
                            {getStatusBadge(record.status, record.isLate)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-4 py-12 text-center text-gray-500"
                        >
                          {searchQuery
                            ? `No results found for "${searchQuery}"`
                            : "Select date range to generate working hours report"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6 pt-4 border-t border-gray-200">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                          currentPage === page
                            ? "bg-[#EB7D23] text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
