// src/app/admin/terminals/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FiMapPin,
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
import { useData } from "@/context/DataContext";

export default function AdminTerminalsPage() {
  const router = useRouter();
  const { terminals, loadingTerminals, loadTerminals, refreshTerminals } =
    useData();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredTerminals, setFilteredTerminals] = useState<any[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const rowsPerPage = 10;

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.replace("/admin/login");
      return;
    }

    // Only load terminals if not already loaded
    if (terminals.length === 0 && isInitialLoad) {
      loadTerminals();
    }
    setIsInitialLoad(false);
  }, [router, loadTerminals, terminals.length, isInitialLoad]);

  // Filter terminals when search term or terminals data changes
  useEffect(() => {
    let filtered = [...terminals];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name?.toLowerCase().includes(term) ||
          t.id?.toLowerCase().includes(term),
      );
    }
    setFilteredTerminals(filtered);
    setCurrentPage(1);
  }, [terminals, searchTerm]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("rememberedEmail");
    document.cookie =
      "adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.replace("/admin/login");
  };

  const handleRefresh = useCallback(async () => {
    await refreshTerminals();
  }, [refreshTerminals]);

  const totalPages = Math.ceil(filteredTerminals.length / rowsPerPage);
  const paginatedTerminals = filteredTerminals.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  // Show loading only on initial load
  if (loadingTerminals && isInitialLoad) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-[#02404F] text-white p-2 rounded-lg"
      >
        {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      <div className={`${sidebarOpen ? "block" : "hidden"} lg:block`}>
        <Sidebar onLogout={handleLogout} />
      </div>

      <div className="flex-1 h-full overflow-y-auto lg:ml-64">
        <Header title="Terminals" onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FiMapPin className="text-[#EB7D23]" />
              Manage Terminals ({terminals.length} total)
            </h2>
            <div className="flex gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or ID..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EB7D23] w-full sm:w-64"
                />
              </div>
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-600 hover:text-[#02404F] rounded-lg hover:bg-gray-100 transition-colors"
                title="Refresh"
                disabled={loadingTerminals}
              >
                <FiRefreshCw
                  className={loadingTerminals ? "animate-spin" : ""}
                />
              </button>
              <button className="px-4 py-2 bg-[#02404F] hover:bg-[#036b82] text-white rounded-lg flex items-center gap-2 transition-colors">
                <FiPlus />
                <span>Add Terminal</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Latitude
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Longitude
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Radius (m)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedTerminals.length > 0 ? (
                    paginatedTerminals.map((terminal) => (
                      <tr
                        key={terminal.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {terminal.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {terminal.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {terminal.lat.toFixed(6)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {terminal.lng.toFixed(6)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {terminal.radius}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
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
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        {searchTerm
                          ? "No terminals match your search"
                          : "No terminals found"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredTerminals.length}
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
