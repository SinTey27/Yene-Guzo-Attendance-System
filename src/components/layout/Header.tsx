// src/components/layout/Header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiMenu, FiLogOut } from "react-icons/fi";

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 text-gray-600 hover:text-[#02404F]"
            >
              <FiMenu size={24} />
            </button>
            <h1 className="text-xl lg:text-2xl font-bold text-[#02404F]">
              {title}
            </h1>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                pathname === "/admin/dashboard"
                  ? "text-[#EB7D23] font-medium"
                  : "text-gray-600 hover:text-[#EB7D23]"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/staff"
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                pathname === "/admin/staff"
                  ? "text-[#EB7D23] font-medium"
                  : "text-gray-600 hover:text-[#EB7D23]"
              }`}
            >
              Staff
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
