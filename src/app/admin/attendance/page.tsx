"use client";

import { useState, useEffect } from "react";
import {
  FiClock,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiCalendar,
  FiMapPin,
  FiUser,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import SearchBox from "@/components/ui/SearchBox";
import Pagination from "@/components/ui/Pagination";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Badge from "@/components/ui/Badge";
import { api } from "@/utils/api";
import { useRouter } from "next/navigation";

interface AttendanceRecord {
  id: string;
  timestamp: string;
  name: string;
  email: string;
  position: string;
  terminal: string;
  action: "checkin" | "checkout";
  status: "On Time" | "Late" | "Early";
  location: string;
  ipAddress: string;
}

export default function AttendancePage() {
  const router = useRouter();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "checkin" | "checkout">(
    "all",
  );
  const [dateRange, setDateRange] = useState<"today" | "week" | "month">(
    "today",
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const rowsPerPage = 15;

  useEffect(() => {
    loadAttendance();
  }, [page, searchTerm, filterType, dateRange]);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      // await new Promise((resolve) => setTimeout(resolve, 800));

      const mockRecords: AttendanceRecord[] = Array.from(
        { length: 50 },
        (_, i) => ({
          id: `rec_${i + 1}`,
          timestamp: new Date(
            Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          name: [
            "John Doe",
            "Jane Smith",
            "Mike Johnson",
            "Sarah Williams",
            "David Brown",
          ][Math.floor(Math.random() * 5)],
          email: `user${i + 1}@kifiya.com`,
          position: ["Developer", "Manager", "Designer", "HR", "Admin"][
            Math.floor(Math.random() * 5)
          ],
          terminal: ["Main Office", "Branch Office", "Remote Site"][
            Math.floor(Math.random() * 3)
          ],
          action: Math.random() > 0.5 ? "checkin" : "checkout",
          status: ["On Time", "Late", "Early"][
            Math.floor(Math.random() * 3)
          ] as any,
          location: `${(9.02 + Math.random() * 0.1).toFixed(4)}, ${(38.74 + Math.random() * 0.1).toFixed(4)}`,
          ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        }),
      );

      // Apply filters
      let filtered = mockRecords;

      if (searchTerm) {
        filtered = filtered.filter(
          (r) =>
            r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.position.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      }

      if (filterType !== "all") {
        filtered = filtered.filter((r) => r.action === filterType);
      }

      if (dateRange === "today") {
        const today = new Date().toDateString();
        filtered = filtered.filter(
          (r) => new Date(r.timestamp).toDateString() === today,
        );
      } else if (dateRange === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = filtered.filter((r) => new Date(r.timestamp) >= weekAgo);
      }

      // Sort by timestamp (newest first)
      filtered.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

      setRecords(filtered);
      setTotalItems(filtered.length);
    } catch (error) {
      console.error("Error loading attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("adminUser");
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    router.push("/login");
  };

  const paginatedRecords = records.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );

  const exportToCSV = () => {
    const csv = [
      [
        "Date",
        "Time",
        "Name",
        "Email",
        "Position",
        "Terminal",
        "Action",
        "Status",
        "Location",
        "IP Address",
      ],
      ...paginatedRecords.map((r) => [
        new Date(r.timestamp).toLocaleDateString(),
        new Date(r.timestamp).toLocaleTimeString(),
        r.name,
        r.email,
        r.position,
        r.terminal,
        r.action,
        r.status,
        r.location,
        r.ipAddress,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-records-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const getActionBadge = (action: string) => {
    return action === "checkin" ? (
      <Badge variant="success">Check In</Badge>
    ) : (
      <Badge variant="warning">Check Out</Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "On Time":
        return <Badge variant="success">On Time</Badge>;
      case "Late":
        return <Badge variant="warning">Late</Badge>;
      case "Early":
        return <Badge variant="info">Early</Badge>;
      default:
        return <Badge variant="info">{status}</Badge>;
    }
  };

  const summary = {
    total: records.length,
    checkins: records.filter((r) => r.action === "checkin").length,
    checkouts: records.filter((r) => r.action === "checkout").length,
    onTime: records.filter((r) => r.status === "On Time").length,
    late: records.filter((r) => r.status === "Late").length,
  };

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
          title="Attendance Records"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Total Records</p>
              <p className="text-2xl font-bold text-gray-800">
                {summary.total}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Check-ins</p>
              <p className="text-2xl font-bold text-green-600">
                {summary.checkins}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Check-outs</p>
              <p className="text-2xl font-bold text-orange-600">
                {summary.checkouts}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">On Time</p>
              <p className="text-2xl font-bold text-green-600">
                {summary.onTime}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Late</p>
              <p className="text-2xl font-bold text-red-600">{summary.late}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex items-center gap-3">
                <FiFilter className="text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  Filters:
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => setDateRange("today")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      dateRange === "today"
                        ? "bg-[#02404F] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setDateRange("week")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      dateRange === "week"
                        ? "bg-[#02404F] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    This Week
                  </button>
                  <button
                    onClick={() => setDateRange("month")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      dateRange === "month"
                        ? "bg-[#02404F] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    This Month
                  </button>
                </div>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 border-0 focus:ring-2 focus:ring-[#02404F]"
                >
                  <option value="all">All Actions</option>
                  <option value="checkin">Check-ins Only</option>
                  <option value="checkout">Check-outs Only</option>
                </select>
              </div>

              <div className="flex gap-3 w-full lg:w-auto">
                <SearchBox
                  value={searchTerm}
                  onChange={(value) => {
                    setSearchTerm(value);
                    setPage(1);
                  }}
                  placeholder="Search by name, email..."
                  className="flex-1 lg:w-64"
                />
                <button
                  onClick={loadAttendance}
                  className="p-2 text-gray-600 hover:text-[#02404F] transition-colors rounded-lg hover:bg-gray-100"
                  disabled={loading}
                >
                  <FiRefreshCw className={loading ? "animate-spin" : ""} />
                </button>
                <button
                  onClick={exportToCSV}
                  className="bg-[#02404F] text-white px-4 py-2 rounded-lg hover:bg-[#036b82] transition-all flex items-center gap-2"
                >
                  <FiDownload />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Terminal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <LoadingSpinner size="lg" />
                      </td>
                    </tr>
                  ) : paginatedRecords.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        No attendance records found
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <FiCalendar className="text-[#EB7D23] w-4 h-4" />
                            <span className="text-sm text-gray-900">
                              {new Date(record.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 ml-6">
                            {new Date(record.timestamp).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <FiUser className="text-gray-400 w-4 h-4" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {record.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {record.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {record.position}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <FiMapPin className="text-[#EB7D23] w-4 h-4" />
                            {record.terminal}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getActionBadge(record.action)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(record.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-xs text-gray-500 font-mono">
                            {record.location}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination
                currentPage={page}
                totalPages={Math.ceil(totalItems / rowsPerPage)}
                totalItems={totalItems}
                pageSize={rowsPerPage}
                onPageChange={setPage}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
