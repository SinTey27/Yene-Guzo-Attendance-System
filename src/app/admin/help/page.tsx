"use client";

import { useState } from "react";
import {
  FiHelpCircle,
  FiMail,
  FiPhone,
  FiClock,
  FiBook,
  FiVideo,
  FiMessageSquare,
} from "react-icons/fi";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useRouter } from "next/navigation";

export default function HelpPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    router.push("/");
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
          title="Help & Support"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-block p-4 bg-[#02404F]/10 rounded-full mb-4">
                <FiHelpCircle className="w-12 h-12 text-[#02404F]" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                How can we help you?
              </h2>
              <p className="text-gray-600">
                Get support and learn how to use the attendance system
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Contact Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#EB7D23]/10 text-[#EB7D23] flex items-center justify-center">
                    <FiMail className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Email Support</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Get help via email within 24 hours
                </p>
                <a
                  href="mailto:support@kifiya.com"
                  className="text-[#02404F] hover:text-[#EB7D23] font-medium"
                >
                  Info@kifiya.com →
                </a>
              </div>

              {/* Phone Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#EB7D23]/10 text-[#EB7D23] flex items-center justify-center">
                    <FiPhone className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Phone Support</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Speak directly with our support team
                </p>
                <a
                  href="tel:+251123456789"
                  className="text-[#02404F] hover:text-[#EB7D23] font-medium"
                >
                  +251 933 123 433 →
                </a>
              </div>

              {/* Hours Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#EB7D23]/10 text-[#EB7D23] flex items-center justify-center">
                    <FiClock className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Support Hours</h3>
                </div>
                <p className="text-gray-600 mb-4">24/7 Support Available</p>
                <p className="text-sm text-gray-500">
                  We're always here to help
                </p>
              </div>

              {/* Live Chat Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#EB7D23]/10 text-[#EB7D23] flex items-center justify-center">
                    <FiMessageSquare className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Live Chat</h3>
                </div>
                <p className="text-gray-600 mb-4">Chat with our support team</p>
                <button className="text-[#02404F] hover:text-[#EB7D23] font-medium">
                  Start Chat →
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
