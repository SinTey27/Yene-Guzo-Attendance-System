// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiDownload,
  FiRefreshCw,
  FiMapPin,
  FiCalendar,
  FiTrendingUp,
} from "react-icons/fi";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import SearchBox from "@/components/ui/SearchBox";
import Pagination from "@/components/ui/Pagination";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import AttendanceChart from "@/components/charts/AttendanceChart";
import { googleSheetsService } from "@/services/googleSheets.service";
// import { DashboardData, TodaySummary } from "@/types";
import { DashboardData, TodaySummary } from "@/services/googleSheets.service";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [todayPage, setTodayPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const rowsPerPage = 10;

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // ✅ Use googleSheetsService instead of api
      const dashboardData = await googleSheetsService.getDashboardData();
      setData(dashboardData);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("adminToken");
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    router.push("/admin/login");
  };

  const filteredToday =
    data?.todaySummary.filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.position.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  const totalPages = Math.ceil(filteredToday.length / rowsPerPage);
  const paginatedToday = filteredToday.slice(
    (todayPage - 1) * rowsPerPage,
    todayPage * rowsPerPage,
  );

  const getStatusBadge = (status: string, isLate: boolean) => {
    if (isLate) {
      return <Badge variant="warning">Late</Badge>;
    }
    switch (status) {
      case "Present":
        return <Badge variant="success">Present</Badge>;
      case "Absent":
        return <Badge variant="danger">Absent</Badge>;
      default:
        return <Badge variant="info">{status}</Badge>;
    }
  };

  const exportData = () => {
    const csv = [
      ["Status", "Name", "Position", "Check In", "Check Out", "Terminal"],
      ...paginatedToday.map((s) => [
        s.isLate ? "Late" : s.status,
        s.name,
        s.position,
        s.checkIn ? new Date(s.checkIn).toLocaleTimeString() : "-",
        s.checkOut ? new Date(s.checkOut).toLocaleTimeString() : "-",
        s.terminalID,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && !data) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar dashboardBadge={0} onLogout={handleLogout} />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
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
            <Sidebar
              dashboardBadge={data?.stats.presentToday || 0}
              onLogout={handleLogout}
            />
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            dashboardBadge={data?.stats.presentToday || 0}
            onLogout={handleLogout}
          />
        </div>

        <div className="flex-1 lg:ml-64 overflow-y-auto">
          <Header title="Dashboard" onMenuClick={() => setSidebarOpen(true)} />

          <main className="p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={<FiUsers />}
                title="Total Staff"
                value={data?.stats.totalStaff || 0}
                subtitle="Registered employees"
                iconBg="bg-blue-100 text-blue-600"
              />
              <StatCard
                icon={<FiCheckCircle />}
                title="Present Today"
                value={data?.stats.presentToday || 0}
                subtitle={`${data?.stats.attendanceRate || 0}% attendance`}
                iconBg="bg-green-100 text-green-600"
              />
              <StatCard
                icon={<FiXCircle />}
                title="Absent Today"
                value={data?.stats.absentToday || 0}
                subtitle="Not checked in"
                iconBg="bg-red-100 text-red-600"
              />
              <StatCard
                icon={<FiClock />}
                title="Late Today"
                value={data?.stats.lateToday || 0}
                subtitle="After 9:00 AM"
                iconBg="bg-yellow-100 text-yellow-600"
              />
            </div>

            {/* Charts Section - Only Attendance Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-[#EB7D23] rounded-full"></span>
                  Attendance Distribution
                </h3>
                <div className="h-80">
                  <AttendanceChart data={data?.stats} />
                </div>
              </div>
            </div>

            {/* Today's Attendance Table */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FiCalendar className="text-[#EB7D23]" />
                  Today's Attendance
                </h3>
                <div className="flex gap-3 w-full sm:w-auto">
                  <SearchBox
                    value={searchTerm}
                    onChange={(value) => {
                      setSearchTerm(value);
                      setTodayPage(1);
                    }}
                    placeholder="Search by name..."
                    className="flex-1 sm:flex-initial"
                  />
                  <button
                    onClick={loadDashboardData}
                    className="p-2 text-gray-600 hover:text-[#02404F] transition-colors rounded-lg hover:bg-gray-100"
                    disabled={loading}
                  >
                    <FiRefreshCw className={loading ? "animate-spin" : ""} />
                  </button>
                  <button
                    onClick={exportData}
                    className="p-2 text-gray-600 hover:text-[#02404F] transition-colors rounded-lg hover:bg-gray-100"
                  >
                    <FiDownload />
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check In
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check Out
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Terminal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedToday.length > 0 ? (
                      paginatedToday.map((staff, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(staff.status, staff.isLate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                            {staff.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                            {staff.position}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                            {staff.checkIn
                              ? new Date(staff.checkIn).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                            {staff.checkOut
                              ? new Date(staff.checkOut).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )
                              : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                              <FiMapPin className="text-[#EB7D23]" />
                              {staff.terminalID}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          {searchTerm
                            ? "No matching records found"
                            : "No attendance records today"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-6">
                <Pagination
                  currentPage={todayPage}
                  totalPages={totalPages}
                  totalItems={filteredToday.length}
                  pageSize={rowsPerPage}
                  onPageChange={setTodayPage}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
