// src/app/admin/layout.tsx
import type { Metadata } from "next";
import { DataProvider } from "@/context/DataContext";

export const metadata: Metadata = {
  title: "yene-guzo attendance",
  description: "Administrative panel for Yene-Guzo Attendance System",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DataProvider>{children}</DataProvider>;
}
