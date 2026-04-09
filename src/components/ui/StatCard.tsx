// src/components/ui/StatCard.tsx
import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  title: string;
  value: number;
  subtitle: string;
  iconBg: string;
}

export default function StatCard({
  icon,
  title,
  value,
  subtitle,
  iconBg,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        </div>
        <div
          className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
