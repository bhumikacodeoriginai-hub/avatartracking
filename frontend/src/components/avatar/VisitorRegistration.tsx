"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { visitorApi } from "@/lib/api";

interface VisitorRegistrationProps {
  onClose: () => void;
  sessionId: string | null;
}

/**
 * VisitorRegistration - Touchscreen registration form.
 * Used when visitors prefer to type rather than speak.
 */
export function VisitorRegistration({ onClose, sessionId }: VisitorRegistrationProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    purpose: "",
    profile_type: "",
    employee_to_meet: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await visitorApi.create({
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        organization: formData.organization || undefined,
        profile_type: formData.profile_type || undefined,
      });
      setStep(4); // Success step
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const purposeOptions = [
    { value: "client", label: "Client Meeting" },
    { value: "parent", label: "Parent/Guardian" },
    { value: "student", label: "Student Enquiry" },
    { value: "job_applicant", label: "Job Application" },
    { value: "intern", label: "Internship" },
    { value: "vendor", label: "Vendor/Partner" },
    { value: "guest", label: "General Visit" },
    { value: "other", label: "Other" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-8"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-lg bg-slate-800 rounded-3xl border border-slate-700/50 p-8 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">Visitor Registration</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-colors ${
                s <= step ? "bg-avatar-accent" : "bg-slate-700"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-avatar-accent"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="Enter phone number"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-avatar-accent"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Enter email address"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-avatar-accent"
              />
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!formData.name.trim()}
              className="w-full py-3 bg-avatar-accent hover:bg-avatar-accent/80 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-medium transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* Step 2: Purpose */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-slate-300 mb-4">What brings you here today?</p>
            <div className="grid grid-cols-2 gap-3">
              {purposeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    handleChange("profile_type", option.value);
                    setStep(3);
                  }}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    formData.profile_type === option.value
                      ? "bg-avatar-accent/20 border-avatar-accent text-white"
                      : "bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(1)}
              className="w-full py-2 text-slate-400 hover:text-white text-sm"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Step 3: Additional Details */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Organization</label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => handleChange("organization", e.target.value)}
                placeholder="Your organization (optional)"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-avatar-accent"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Who are you meeting?</label>
              <input
                type="text"
                value={formData.employee_to_meet}
                onChange={(e) => handleChange("employee_to_meet", e.target.value)}
                placeholder="Name of person (optional)"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-avatar-accent"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 bg-slate-700 text-slate-300 rounded-xl"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-avatar-accent hover:bg-avatar-accent/80 text-white rounded-xl font-medium disabled:opacity-50"
              >
                {isSubmitting ? "Registering..." : "Complete Registration"}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="text-center space-y-4 py-8">
            <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
              <span className="text-3xl">✓</span>
            </div>
            <h3 className="text-xl text-white font-medium">
              Welcome, {formData.name}!
            </h3>
            <p className="text-slate-400">
              You&apos;ve been registered. Our team has been notified.
            </p>
            <button
              onClick={onClose}
              className="px-8 py-3 bg-avatar-accent text-white rounded-xl font-medium"
            >
              Done
            </button>
          </div>
        )}

        {/* Privacy notice */}
        <p className="text-slate-600 text-xs text-center mt-6">
          Your data is collected with your consent and processed according to our privacy policy.
        </p>
      </motion.div>
    </motion.div>
  );
}
