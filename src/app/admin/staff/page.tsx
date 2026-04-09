"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FiUsers,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiRefreshCw,
  FiMenu,
  FiX,
  FiSearch,
} from "react-icons/fi";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Pagination from "@/components/ui/Pagination";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Badge from "@/components/ui/Badge";
import { useData } from "@/context/DataContext";

export default function AdminStaffPage() {
  const router = useRouter();
  const { staff, loadingStaff, loadStaff, refreshStaff } = useData();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredStaff, setFilteredStaff] = useState<any[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const rowsPerPage = 10;

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.replace("/admin/login");
      return;
    }

    if (staff.length === 0 && isInitialLoad) {
      loadStaff();
    }
    setIsInitialLoad(false);
  }, [router, loadStaff, staff.length, isInitialLoad]);

  // Filter staff when search term or staff data changes
  useEffect(() => {
    let filtered = [...staff];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name?.toLowerCase().includes(term) ||
          s.email?.toLowerCase().includes(term) ||
          s.position?.toLowerCase().includes(term),
      );
    }
    setFilteredStaff(filtered);
    setCurrentPage(1);
  }, [staff, searchTerm]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("rememberedEmail");
    document.cookie =
      "adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.replace("/admin/login");
  };

  const handleRefresh = useCallback(async () => {
    await refreshStaff();
  }, [refreshStaff]);

  const getStatusBadge = (status: string) => {
    if (status === "Active") {
      return <Badge variant="success">Active</Badge>;
    }
    return <Badge variant="danger">Inactive</Badge>;
  };

  const totalPages = Math.ceil(filteredStaff.length / rowsPerPage);
  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  // Show loading only on initial load
  if (loadingStaff && isInitialLoad) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-[#02404F] text-white p-2 rounded-lg shadow-lg"
      >
        {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? "block" : "hidden"} lg:block`}>
        <Sidebar onLogout={handleLogout} />
      </div>

      {/* Main Content */}
      <div className="flex-1 h-full overflow-y-auto lg:ml-64">
        <Header
          title="Staff Management"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="p-4 md:p-6">
          {/* Header with actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FiUsers className="text-[#EB7D23]" />
              Manage Staff ({staff.length} total)
            </h2>
            <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EB7D23] w-full sm:w-56 md:w-64 text-sm"
                />
              </div>
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-600 hover:text-[#02404F] rounded-lg hover:bg-gray-100 transition-colors"
                title="Refresh"
                disabled={loadingStaff}
              >
                <FiRefreshCw className={loadingStaff ? "animate-spin" : ""} />
              </button>
              <button className="px-3 md:px-4 py-2 bg-[#02404F] hover:bg-[#036b82] text-white rounded-lg flex items-center gap-2 transition-colors text-sm md:text-base">
                <FiPlus />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Staff Table - Responsive */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <div className="min-w-[700px] md:min-w-full px-4 md:px-0">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Terminal
                      </th>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedStaff.length > 0 ? (
                      paginatedStaff.map((member) => (
                        <tr
                          key={member.email}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {member.name}
                          </td>
                          <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm text-gray-600">
                            {member.email}
                          </td>
                          <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm text-gray-600">
                            {member.position}
                          </td>
                          <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm text-gray-600">
                            {member.terminalID}
                          </td>
                          <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap">
                            {getStatusBadge(member.status)}
                          </td>
                          <td className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-sm">
                            <div className="flex gap-2">
                              <button
                                className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                                title="Edit"
                              >
                                <FiEdit2 size={18} />
                              </button>
                              <button
                                className="p-1 text-red-600 hover:text-red-800 transition-colors"
                                title="Delete"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-3 md:px-6 py-8 md:py-12 text-center text-gray-500 text-sm"
                        >
                          {searchTerm
                            ? "No staff members match your search"
                            : "No staff members found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-3 md:p-4 border-t border-gray-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredStaff.length}
                  pageSize={rowsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
