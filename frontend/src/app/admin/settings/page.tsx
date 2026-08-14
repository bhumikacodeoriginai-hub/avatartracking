"use client";

import React, { useState } from "react";

/**
 * System Settings Page - Configure avatar, detection, privacy, and more.
 */
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("avatar");

  const tabs = [
    { id: "avatar", label: "Avatar", icon: "🤖" },
    { id: "detection", label: "Detection", icon: "📷" },
    { id: "privacy", label: "Privacy", icon: "🔒" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "company", label: "Company", icon: "🏢" },
    { id: "languages", label: "Languages", icon: "🌍" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">System Settings</h1>
        <p className="text-slate-400 mt-1">Configure your AI Office Avatar platform</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-800 rounded-xl p-1 border border-slate-700/50 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              activeTab === tab.id
                ? "bg-avatar-accent/10 text-avatar-accent"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-slate-800 rounded-xl border border-slate-700/50 p-6">
        {activeTab === "avatar" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Avatar Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Voice</label>
                <select className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white">
                  <option>Professional Female</option>
                  <option>Professional Male</option>
                  <option>Friendly Female</option>
                  <option>Friendly Male</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Default Language</label>
                <select className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white">
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="kn">Kannada</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Greeting Message</label>
                <textarea
                  defaultValue="Hello! Welcome to our office. How can I help you today?"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white h-20 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Farewell Message</label>
                <textarea
                  defaultValue="Thank you for visiting. Have a great day!"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white h-20 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Idle Timeout (seconds)</label>
                <input
                  type="number"
                  defaultValue={30}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Personality</label>
                <select className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white">
                  <option>Professional & Friendly</option>
                  <option>Formal & Concise</option>
                  <option>Warm & Conversational</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === "detection" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Detection Thresholds</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Person Confidence Threshold
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.5"
                    max="0.95"
                    step="0.05"
                    defaultValue="0.75"
                    className="flex-1"
                  />
                  <span className="text-white text-sm w-12">0.75</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Higher = fewer false detections but may miss real people
                </p>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Stable Detection Duration (seconds)
                </label>
                <input
                  type="number"
                  defaultValue={1.5}
                  step={0.5}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Liveness Confidence Threshold
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.5"
                    max="0.95"
                    step="0.05"
                    defaultValue="0.8"
                    className="flex-1"
                  />
                  <span className="text-white text-sm w-12">0.80</span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  Session Timeout (seconds)
                </label>
                <input
                  type="number"
                  defaultValue={300}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                  <span className="text-sm text-slate-300">Enable liveness detection</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === "privacy" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Privacy & Consent Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div>
                  <p className="text-sm text-white">Require consent for data storage</p>
                  <p className="text-xs text-slate-400">Visitors must consent before personal data is stored</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div>
                  <p className="text-sm text-white">Require consent for biometric enrollment</p>
                  <p className="text-xs text-slate-400">Explicit consent required before face recognition enrollment</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Data Retention Period (days)</label>
                <input
                  type="number"
                  defaultValue={730}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white max-w-xs"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Conversation Log Retention (days)</label>
                <input
                  type="number"
                  defaultValue={90}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white max-w-xs"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Notification Settings</h3>
            <div className="space-y-4">
              {[
                { label: "Dashboard notifications", description: "Show in-app notifications", enabled: true },
                { label: "Email notifications", description: "Send emails for visitor arrivals", enabled: true },
                { label: "Slack integration", description: "Post to Slack channel", enabled: false },
                { label: "Teams integration", description: "Send Teams messages", enabled: false },
                { label: "SMS notifications", description: "Send SMS for urgent matters", enabled: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div>
                    <p className="text-sm text-white">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.description}</p>
                  </div>
                  <input type="checkbox" defaultChecked={item.enabled} className="w-5 h-5 rounded" />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "company" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Company Name</label>
                <input
                  type="text"
                  defaultValue="AI Solutions Pvt Ltd"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Domain</label>
                <input
                  type="text"
                  defaultValue="aisolutions.com"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Address</label>
                <textarea
                  defaultValue="123 Tech Park, Innovation Street"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white h-20 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Contact Email</label>
                <input
                  type="email"
                  defaultValue="info@aisolutions.com"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "languages" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Language Settings</h3>
            <div className="space-y-4">
              {[
                { code: "en", name: "English", enabled: true, primary: true },
                { code: "hi", name: "Hindi (हिंदी)", enabled: true, primary: false },
                { code: "kn", name: "Kannada (ಕನ್ನಡ)", enabled: true, primary: false },
              ].map((lang) => (
                <div key={lang.code} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked={lang.enabled} className="w-4 h-4 rounded" />
                    <div>
                      <p className="text-sm text-white">{lang.name}</p>
                      <p className="text-xs text-slate-400">Code: {lang.code}</p>
                    </div>
                  </div>
                  {lang.primary && (
                    <span className="px-2 py-1 bg-avatar-accent/10 text-avatar-accent text-xs rounded">
                      Primary
                    </span>
                  )}
                </div>
              ))}
              <p className="text-xs text-slate-500">
                The avatar will auto-detect visitor language and respond accordingly.
              </p>
            </div>
          </div>
        )}

        {/* Save button */}
        <div className="mt-8 flex justify-end">
          <button className="px-6 py-2.5 bg-avatar-accent text-white rounded-lg font-medium hover:bg-avatar-accent/80 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
