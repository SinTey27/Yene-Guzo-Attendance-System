"use client";

import { useState } from "react";
import {
  FiSettings,
  FiBell,
  FiShield,
  FiDatabase,
  FiSave,
  FiUser,
} from "react-icons/fi";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState({
    defaultRadius: 50,
    workingHours: 8,
    maxDays: 30,
    notifications: true,
    twoFactor: false,
    autoBackup: true,
  });

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    router.push("/");
  };

  const handleSave = () => {
    // Save settings to backend/localStorage
    localStorage.setItem("appSettings", JSON.stringify(settings));
    alert("Settings saved successfully!");
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
        <Header title="Settings" onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FiSettings className="text-[#EB7D23]" />
              System Configuration
            </h2>

            <div className="space-y-6">
              {/* General Settings */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FiUser className="text-[#02404F]" />
                  General Settings
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Radius (meters)
                    </label>
                    <input
                      type="number"
                      value={settings.defaultRadius}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          defaultRadius: parseInt(e.target.value),
                        })
                      }
                      min="10"
                      max="500"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02404F] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Default geofence radius for new terminals
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Working Hours Per Day
                    </label>
                    <input
                      type="number"
                      value={settings.workingHours}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          workingHours: parseInt(e.target.value),
                        })
                      }
                      min="1"
                      max="24"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02404F] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Standard working hours for overtime calculation
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Days to Show
                    </label>
                    <input
                      type="number"
                      value={settings.maxDays}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          maxDays: parseInt(e.target.value),
                        })
                      }
                      min="7"
                      max="365"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02404F] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum days of attendance history to display
                    </p>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className="bg-[#02404F] text-white px-6 py-3 rounded-lg hover:bg-[#036b82] transition-all flex items-center gap-2"
                >
                  <FiSave />
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
