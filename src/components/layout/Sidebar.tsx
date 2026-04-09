// src/components/layout/Sidebar.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiUsers,
  FiMapPin,
  FiClock,
  FiBarChart2,
  FiSettings,
  FiHelpCircle,
  FiLogOut,
} from "react-icons/fi";

interface MenuItem {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
}

const mainMenuItems: MenuItem[] = [
  { href: "/admin/dashboard", icon: FiHome, label: "Dashboard" },
  { href: "/admin/staff", icon: FiUsers, label: "Staff Management" },
  { href: "/admin/working-hours", icon: FiClock, label: "Working Hours" },
  { href: "/admin/terminals", icon: FiMapPin, label: "Terminals" },
  { href: "/admin/attendance", icon: FiClock, label: "Attendance Records" },
  { href: "/admin/reports", icon: FiBarChart2, label: "Reports" },
];

const footerMenuItems: MenuItem[] = [
  { href: "/admin/settings", icon: FiSettings, label: "Settings" },
  { href: "/admin/help", icon: FiHelpCircle, label: "Help" },
];

interface SidebarProps {
  dashboardBadge?: number;
  onLogout?: () => void;
}

export default function Sidebar({
  dashboardBadge = 0,
  onLogout,
}: SidebarProps) {
  const pathname = usePathname();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      window.location.href = "/admin/login";
    }
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-[#02404F] to-[#036b82] h-screen fixed left-0 top-0 text-white overflow-y-auto z-50 flex flex-col">
      <div className="p-6 border-b border-white/10">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/logo.png"
              alt="Yene Guzo"
              width={120}
              height={60}
              className="object-contain"
              priority
              onError={(e) => {
                e.currentTarget.src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='60' viewBox='0 0 120 60'%3E%3Crect width='120' height='60' fill='%23EB7D23'/%3E%3Ctext x='60' y='35' text-anchor='middle' fill='white' font-size='14'%3EYG%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
          <h3 className="text-xl font-bold text-white">Admin Dashboard</h3>
          <p className="text-sm text-white/70 mt-1">Attendance Management</p>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="mb-4">
          <p className="px-4 text-xs font-semibold text-white/50 uppercase tracking-wider">
            MAIN
          </p>
        </div>
        {mainMenuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all ${
                isActive
                  ? "bg-white/20 border-l-4 border-[#EB7D23]"
                  : "hover:bg-white/10"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm flex-1">{item.label}</span>
              {item.href === "/admin/dashboard" && dashboardBadge > 0 && (
                <span className="bg-[#EB7D23] text-white text-xs px-2 py-1 rounded-full">
                  {dashboardBadge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        {footerMenuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all ${
                isActive
                  ? "bg-white/20 border-l-4 border-[#EB7D23]"
                  : "hover:bg-white/10"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mt-2 text-white/80 hover:bg-white/10 hover:text-white transition-all group"
        >
          <FiLogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}
