"use client";

import { useState, useEffect } from "react";
import {
  FiBarChart2,
  FiCalendar,
  FiDownload,
  FiSearch,
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiClock,
} from "react-icons/fi";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useRouter } from "next/navigation";

interface AttendanceRecord {
  date: string;
  name: string;
  position: string;
  checkIn: string | null;
  checkOut: string | null;
  hours: number;
  status: "Present" | "Absent" | "Late";
  isLate: boolean;
}

interface ReportSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  totalHours: number;
}

export default function ReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState<AttendanceRecord[]>([]);
  const [filteredData, setFilteredData] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<ReportSummary>({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    totalHours: 0,
  });
  const [showSummary, setShowSummary] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Mock attendance data
  const mockAttendanceData: AttendanceRecord[] = [
    {
      date: "2024-03-25",
      name: "Abebe Kebede",
      position: "Software Engineer",
      checkIn: "08:45",
      checkOut: "17:30",
      hours: 8.75,
      status: "Present",
      isLate: false,
    },
    {
      date: "2024-03-25",
      name: "Sara Hailu",
      position: "Product Manager",
      checkIn: "09:00",
      checkOut: "17:45",
      hours: 8.75,
      status: "Present",
      isLate: false,
    },
    {
      date: "2024-03-25",
      name: "Tekle Berhan",
      position: "UX Designer",
      checkIn: "09:30",
      checkOut: "18:00",
      hours: 8.5,
      status: "Late",
      isLate: true,
    },
    {
      date: "2024-03-24",
      name: "Abebe Kebede",
      position: "Software Engineer",
      checkIn: "08:30",
      checkOut: "17:15",
      hours: 8.75,
      status: "Present",
      isLate: false,
    },
    {
      date: "2024-03-24",
      name: "Sara Hailu",
      position: "Product Manager",
      checkIn: "08:50",
      checkOut: "17:30",
      hours: 8.67,
      status: "Present",
      isLate: false,
    },
    {
      date: "2024-03-24",
      name: "Tekle Berhan",
      position: "UX Designer",
      checkIn: null,
      checkOut: null,
      hours: 0,
      status: "Absent",
      isLate: false,
    },
    {
      date: "2024-03-23",
      name: "Abebe Kebede",
      position: "Software Engineer",
      checkIn: "08:40",
      checkOut: "17:20",
      hours: 8.67,
      status: "Present",
      isLate: false,
    },
    {
      date: "2024-03-23",
      name: "Sara Hailu",
      position: "Product Manager",
      checkIn: "09:15",
      checkOut: "18:00",
      hours: 8.75,
      status: "Late",
      isLate: true,
    },
    {
      date: "2024-03-23",
      name: "Tekle Berhan",
      position: "UX Designer",
      checkIn: "09:45",
      checkOut: "17:30",
      hours: 7.75,
      status: "Late",
      isLate: true,
    },
    {
      date: "2024-03-22",
      name: "Meron Tesfaye",
      position: "Marketing Specialist",
      checkIn: "08:55",
      checkOut: "17:15",
      hours: 8.33,
      status: "Present",
      isLate: false,
    },
    {
      date: "2024-03-22",
      name: "Dawit Mekonnen",
      position: "DevOps Engineer",
      checkIn: "08:30",
      checkOut: "18:30",
      hours: 10.0,
      status: "Present",
      isLate: false,
    },
    {
      date: "2024-03-21",
      name: "Meron Tesfaye",
      position: "Marketing Specialist",
      checkIn: null,
      checkOut: null,
      hours: 0,
      status: "Absent",
      isLate: false,
    },
  ];

  useEffect(() => {
    // Check if admin is logged in
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

    // Set mock data
    setReportData(mockAttendanceData);
  }, [router]);

  useEffect(() => {
    if (startDate && endDate && reportData.length > 0) {
      generateReport();
    }
  }, [startDate, endDate, reportData]);

  const generateReport = () => {
    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      // Filter data by date range
      const filtered = reportData.filter((record) => {
        return record.date >= startDate && record.date <= endDate;
      });

      setFilteredData(filtered);

      // Calculate summary
      const total = filtered.length;
      const present = filtered.filter((r) => r.status === "Present").length;
      const absent = filtered.filter((r) => r.status === "Absent").length;
      const late = filtered.filter((r) => r.isLate).length;
      const totalHours = filtered.reduce((sum, r) => sum + r.hours, 0);

      setSummary({
        total,
        present,
        absent,
        late,
        totalHours: parseFloat(totalHours.toFixed(1)),
      });

      setShowSummary(true);
      setCurrentPage(1);
      setLoading(false);
    }, 500);
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
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const exportToCSV = () => {
    if (filteredData.length === 0) {
      alert("No data to export. Please generate a report first.");
      return;
    }

    const headers = [
      "Date",
      "Name",
      "Position",
      "Check In",
      "Check Out",
      "Working Hours",
      "Status",
    ];
    const rows = filteredData.map((record) => [
      record.date,
      record.name,
      record.position,
      record.checkIn || "-",
      record.checkOut || "-",
      formatHours(record.hours),
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
      `attendance-report-${new Date().toISOString().split("T")[0]}.csv`,
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
          title="Reports & Analytics"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <FiBarChart2 className="text-[#EB7D23]" />
              Reports
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FiCalendar className="text-[#EB7D23]" />
                Generate Report
              </h3>
            </div>

            <div className="p-6">
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EB7D23] focus:border-transparent"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EB7D23] focus:border-transparent"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={generateReport}
                    disabled={loading}
                    className="px-4 py-2 bg-[#EB7D23] text-white rounded-lg hover:bg-[#f08c3a] transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiSearch />
                    )}
                    Generate
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all flex items-center gap-2"
                  >
                    <FiDownload />
                    Export CSV
                  </button>
                </div>
              </div>

              {/* Report Summary */}
              {showSummary && (
                <div className="mb-6 p-5 bg-gray-50 rounded-xl">
                  <h4 className="text-[#02404F] font-semibold mb-4">
                    Report Summary
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">
                        Total Records
                      </div>
                      <div className="text-2xl font-bold text-[#02404F]">
                        {summary.total}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">
                        Present Days
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {summary.present}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">
                        Absent Days
                      </div>
                      <div className="text-2xl font-bold text-red-600">
                        {summary.absent}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">
                        Late Days
                      </div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {summary.late}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">
                        Total Hours
                      </div>
                      <div className="text-2xl font-bold text-[#02404F]">
                        {summary.totalHours}h
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Table */}
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
                        Position
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Check In
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Check Out
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Working Hours
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center">
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
                          <td className="px-4 py-3">
                            {getStatusBadge(record.status, record.isLate)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-12 text-center text-gray-500"
                        >
                          Select date range to generate report
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
