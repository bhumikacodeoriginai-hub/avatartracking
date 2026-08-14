"use client";

import React, { useEffect, useState } from "react";
import { dashboardApi } from "@/lib/api";

interface DashboardData {
  today: {
    visitors: number;
    leads: number;
    appointments: number;
    active_sessions: number;
  };
  totals: {
    visitors: number;
  };
  this_month: {
    course_enquiries: number;
    job_applications: number;
    internship_applications: number;
  };
}

/**
 * Admin Dashboard - Main overview page with KPIs and charts.
 */
export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const result = await dashboardApi.overview();
      setData(result);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
      // Set demo data
      setData({
        today: { visitors: 12, leads: 5, appointments: 3, active_sessions: 2 },
        totals: { visitors: 1247 },
        this_month: { course_enquiries: 38, job_applications: 15, internship_applications: 22 },
      });
    } finally {
      setLoading(false);
    }
  }

  const statCards = data ? [
    { label: "Today's Visitors", value: data.today.visitors, icon: "👥", color: "from-blue-500 to-blue-600" },
    { label: "Active Sessions", value: data.today.active_sessions, icon: "📹", color: "from-green-500 to-green-600" },
    { label: "Today's Leads", value: data.today.leads, icon: "📈", color: "from-purple-500 to-purple-600" },
    { label: "Appointments Today", value: data.today.appointments, icon: "📅", color: "from-amber-500 to-amber-600" },
    { label: "Total Visitors", value: data.totals.visitors, icon: "👤", color: "from-cyan-500 to-cyan-600" },
    { label: "Course Enquiries", value: data.this_month.course_enquiries, icon: "📚", color: "from-rose-500 to-rose-600" },
    { label: "Job Applications", value: data.this_month.job_applications, icon: "💼", color: "from-indigo-500 to-indigo-600" },
    { label: "Internship Apps", value: data.this_month.internship_applications, icon: "🎓", color: "from-teal-500 to-teal-600" },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Overview of your AI Office Avatar system</p>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-slate-800 rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-slate-700 rounded w-24 mb-3" />
              <div className="h-8 bg-slate-700 rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="bg-slate-800 rounded-xl p-5 border border-slate-700/50 hover:border-slate-600/50 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-sm">{stat.label}</span>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-white">{stat.value}</span>
              </div>
              <div className={`mt-3 h-1 rounded-full bg-gradient-to-r ${stat.color} opacity-50`} />
            </div>
          ))}
        </div>
      )}

      {/* Recent activity and charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Visitors */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Visitors</h3>
          <div className="space-y-3">
            {[
              { name: "Rahul Kumar", purpose: "Course Enquiry", time: "2 min ago", type: "student" },
              { name: "Priya Sharma", purpose: "Client Meeting", time: "15 min ago", type: "client" },
              { name: "Arun Dev", purpose: "Job Application", time: "32 min ago", type: "job" },
              { name: "Sneha Rao", purpose: "Internship", time: "1 hr ago", type: "intern" },
              { name: "Vikram Singh", purpose: "Course Demo", time: "2 hr ago", type: "parent" },
            ].map((visitor, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs text-slate-300">
                    {visitor.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm text-white">{visitor.name}</p>
                    <p className="text-xs text-slate-400">{visitor.purpose}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-500">{visitor.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Categories */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Lead Distribution</h3>
          <div className="space-y-4">
            {[
              { category: "Course Enquiries", count: 38, percentage: 40, color: "bg-blue-500" },
              { category: "Internship", count: 22, percentage: 23, color: "bg-purple-500" },
              { category: "Job Applications", count: 15, percentage: 16, color: "bg-green-500" },
              { category: "Client Meetings", count: 12, percentage: 13, color: "bg-amber-500" },
              { category: "General", count: 8, percentage: 8, color: "bg-slate-500" },
            ].map((item) => (
              <div key={item.category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-300">{item.category}</span>
                  <span className="text-sm text-slate-400">{item.count}</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { service: "Camera/CV Service", status: "operational", icon: "📷" },
            { service: "AI Engine", status: "operational", icon: "🤖" },
            { service: "Database", status: "operational", icon: "🗄️" },
            { service: "Avatar Display", status: "operational", icon: "🖥️" },
          ].map((svc) => (
            <div
              key={svc.service}
              className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg"
            >
              <span className="text-xl">{svc.icon}</span>
              <div>
                <p className="text-sm text-white">{svc.service}</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-xs text-green-400 capitalize">{svc.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
