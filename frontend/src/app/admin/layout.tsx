"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: "📊" },
  { name: "Live Reception", href: "/admin/reception", icon: "📹" },
  { name: "Visitors", href: "/admin/visitors", icon: "👥" },
  { name: "Employees", href: "/admin/employees", icon: "👔" },
  { name: "Departments", href: "/admin/departments", icon: "🏢" },
  { name: "Courses", href: "/admin/courses", icon: "📚" },
  { name: "Leads", href: "/admin/leads", icon: "📈" },
  { name: "Appointments", href: "/admin/appointments", icon: "📅" },
  { name: "Jobs", href: "/admin/jobs", icon: "💼" },
  { name: "Internships", href: "/admin/internships", icon: "🎓" },
  { name: "Knowledge Base", href: "/admin/knowledge", icon: "🧠" },
  { name: "Analytics", href: "/admin/analytics", icon: "📉" },
  { name: "Notifications", href: "/admin/notifications", icon: "🔔" },
  { name: "Settings", href: "/admin/settings", icon: "⚙️" },
  { name: "Audit Logs", href: "/admin/audit", icon: "📋" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } flex-shrink-0 bg-slate-800 border-r border-slate-700 transition-all duration-300 overflow-hidden`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-slate-700">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-avatar-accent to-cyan-400 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          {sidebarOpen && (
            <span className="ml-3 text-white font-semibold text-sm">
              AI Avatar Admin
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100%-4rem)]">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-avatar-accent/10 text-avatar-accent border border-avatar-accent/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <header className="h-16 bg-slate-800/50 border-b border-slate-700/50 flex items-center justify-between px-6 sticky top-0 z-10 backdrop-blur-md">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-white"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="flex items-center gap-4">
            <button className="relative text-slate-400 hover:text-white">
              <span>🔔</span>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
                <span className="text-slate-300 text-xs">AD</span>
              </div>
              <span className="text-slate-300 text-sm">Admin</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
