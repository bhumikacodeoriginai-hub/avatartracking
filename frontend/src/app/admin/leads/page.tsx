"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Lead {
  id: string;
  category: string;
  name: string | null;
  requirement: string | null;
  interest_level: string;
  status: string;
  priority: string;
  source: string;
  created_at: string;
}

/**
 * Leads Management Page
 */
export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    loadLeads();
  }, [statusFilter, categoryFilter]);

  async function loadLeads() {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (categoryFilter) params.append("category", categoryFilter);

      const response = await api.get(`/leads?${params}`);
      setLeads(response.data);
    } catch (error) {
      // Demo data
      setLeads([
        { id: "1", category: "course", name: "Rahul Kumar", requirement: "Python beginner course", interest_level: "high", status: "new", priority: "normal", source: "avatar", created_at: "2024-01-15T10:30:00Z" },
        { id: "2", category: "job", name: "Arun Dev", requirement: "Python Developer position", interest_level: "high", status: "contacted", priority: "high", source: "avatar", created_at: "2024-01-15T11:00:00Z" },
        { id: "3", category: "internship", name: "Sneha Rao", requirement: "Cloud/AWS internship", interest_level: "medium", status: "new", priority: "normal", source: "avatar", created_at: "2024-01-14T14:00:00Z" },
        { id: "4", category: "course", name: "Vikram S", requirement: "DevOps advanced course", interest_level: "medium", status: "qualified", priority: "normal", source: "avatar", created_at: "2024-01-14T09:00:00Z" },
        { id: "5", category: "client", name: "Priya Corp", requirement: "Corporate training package", interest_level: "high", status: "contacted", priority: "high", source: "avatar", created_at: "2024-01-13T15:00:00Z" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const statusColors: Record<string, string> = {
    new: "bg-blue-500/10 text-blue-400",
    contacted: "bg-amber-500/10 text-amber-400",
    qualified: "bg-purple-500/10 text-purple-400",
    converted: "bg-green-500/10 text-green-400",
    lost: "bg-red-500/10 text-red-400",
    archived: "bg-slate-500/10 text-slate-400",
  };

  const priorityColors: Record<string, string> = {
    low: "text-slate-400",
    normal: "text-slate-300",
    high: "text-amber-400",
    urgent: "text-red-400",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="text-slate-400 mt-1">Manage leads generated from visitor interactions</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-600">
            Export
          </button>
          <button className="px-4 py-2 bg-avatar-accent text-white rounded-lg text-sm font-medium hover:bg-avatar-accent/80">
            + Create Lead
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: "New", count: 12, color: "border-blue-500" },
          { label: "Contacted", count: 8, color: "border-amber-500" },
          { label: "Qualified", count: 5, color: "border-purple-500" },
          { label: "Converted", count: 15, color: "border-green-500" },
          { label: "Lost", count: 3, color: "border-red-500" },
        ].map((stat) => (
          <div key={stat.label} className={`bg-slate-800 rounded-lg p-4 border-l-2 ${stat.color}`}>
            <p className="text-slate-400 text-xs">{stat.label}</p>
            <p className="text-xl font-bold text-white mt-1">{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="">All Categories</option>
          <option value="course">Course</option>
          <option value="job">Job</option>
          <option value="internship">Internship</option>
          <option value="client">Client</option>
          <option value="parent">Parent</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="converted">Converted</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      {/* Leads table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700/50 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left text-xs font-medium text-slate-400 uppercase px-6 py-4">Lead</th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase px-6 py-4">Category</th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase px-6 py-4">Requirement</th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase px-6 py-4">Status</th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase px-6 py-4">Priority</th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase px-6 py-4">Date</th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                <td className="px-6 py-4">
                  <p className="text-sm text-white font-medium">{lead.name || "—"}</p>
                  <p className="text-xs text-slate-400">Source: {lead.source}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-300 capitalize">{lead.category}</span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-slate-300 max-w-xs truncate">
                    {lead.requirement || "—"}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[lead.status]}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-sm font-medium capitalize ${priorityColors[lead.priority]}`}>
                    {lead.priority}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">
                  {new Date(lead.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="text-avatar-accent hover:text-avatar-accent/80 text-sm">
                      View
                    </button>
                    <button className="text-slate-400 hover:text-white text-sm">
                      Assign
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
