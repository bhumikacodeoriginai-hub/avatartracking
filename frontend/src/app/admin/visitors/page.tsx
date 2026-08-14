"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Visitor {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  organization: string | null;
  profile_type: string | null;
  visit_count: number;
  consent_status: string;
  last_visit: string;
  created_at: string;
}

/**
 * Visitors Management Page
 */
export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadVisitors();
  }, [page, typeFilter]);

  async function loadVisitors() {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("per_page", "20");
      if (typeFilter) params.append("profile_type", typeFilter);
      if (search) params.append("search", search);

      const response = await api.get(`/visitors?${params}`);
      setVisitors(response.data);
    } catch (error) {
      console.error("Failed to load visitors:", error);
      // Demo data
      setVisitors([
        { id: "1", name: "Rahul Kumar", email: "rahul@example.com", phone: "+91 98765 43210", organization: "Tech Corp", profile_type: "student", visit_count: 3, consent_status: "granted", last_visit: "2024-01-15T10:30:00Z", created_at: "2024-01-10T08:00:00Z" },
        { id: "2", name: "Priya Sharma", email: "priya@client.com", phone: "+91 98765 43211", organization: "Innovation Labs", profile_type: "client", visit_count: 5, consent_status: "granted", last_visit: "2024-01-15T09:00:00Z", created_at: "2023-12-01T08:00:00Z" },
        { id: "3", name: "Arun Dev", email: "arun@mail.com", phone: "+91 98765 43212", organization: null, profile_type: "job_applicant", visit_count: 1, consent_status: "pending", last_visit: "2024-01-15T11:00:00Z", created_at: "2024-01-15T11:00:00Z" },
        { id: "4", name: "Sneha Rao", email: "sneha@uni.edu", phone: "+91 98765 43213", organization: "State University", profile_type: "intern", visit_count: 2, consent_status: "granted", last_visit: "2024-01-14T14:00:00Z", created_at: "2024-01-12T09:00:00Z" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const profileTypeLabels: Record<string, string> = {
    client: "Client",
    parent: "Parent",
    student: "Student",
    job_applicant: "Job Applicant",
    intern: "Intern",
    vendor: "Vendor",
    partner: "Partner",
    guest: "Guest",
    other: "Other",
  };

  const profileTypeColors: Record<string, string> = {
    client: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    parent: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    student: "bg-green-500/10 text-green-400 border-green-500/30",
    job_applicant: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    intern: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    vendor: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    partner: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    guest: "bg-slate-500/10 text-slate-400 border-slate-500/30",
    other: "bg-slate-500/10 text-slate-400 border-slate-500/30",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Visitors</h1>
          <p className="text-slate-400 mt-1">Manage visitor records and history</p>
        </div>
        <button className="px-4 py-2 bg-avatar-accent text-white rounded-lg text-sm font-medium hover:bg-avatar-accent/80">
          + Add Visitor
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-slate-800 rounded-xl p-4 border border-slate-700/50">
        <input
          type="text"
          placeholder="Search visitors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-avatar-accent/50"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-avatar-accent/50"
        >
          <option value="">All Types</option>
          {Object.entries(profileTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button
          onClick={loadVisitors}
          className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600"
        >
          Search
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-xs font-medium text-slate-400 uppercase px-6 py-4">
                  Visitor
                </th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase px-6 py-4">
                  Type
                </th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase px-6 py-4">
                  Organization
                </th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase px-6 py-4">
                  Visits
                </th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase px-6 py-4">
                  Consent
                </th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase px-6 py-4">
                  Last Visit
                </th>
                <th className="text-left text-xs font-medium text-slate-400 uppercase px-6 py-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((visitor) => (
                <tr
                  key={visitor.id}
                  className="border-b border-slate-700/30 hover:bg-slate-700/20"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {visitor.name || "Unknown"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {visitor.email || visitor.phone || "—"}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {visitor.profile_type && (
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                          profileTypeColors[visitor.profile_type] || profileTypeColors.other
                        }`}
                      >
                        {profileTypeLabels[visitor.profile_type] || visitor.profile_type}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    {visitor.organization || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    {visitor.visit_count}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-xs ${
                        visitor.consent_status === "granted"
                          ? "bg-green-500/10 text-green-400"
                          : visitor.consent_status === "pending"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {visitor.consent_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {new Date(visitor.last_visit).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="text-slate-400 hover:text-avatar-accent text-sm">
                        View
                      </button>
                      <button className="text-slate-400 hover:text-amber-400 text-sm">
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700/50">
          <span className="text-sm text-slate-400">
            Showing {visitors.length} visitors
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-slate-700 text-slate-300 rounded disabled:opacity-50 text-sm"
            >
              Previous
            </button>
            <span className="text-sm text-slate-400">Page {page}</span>
            <button
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 bg-slate-700 text-slate-300 rounded text-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
