"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Calendar,
  Shield,
  KeyRound,
  LogOut,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Check,
  Loader2,
  Lock,
  ListTodo,
  CheckSquare,
  Sparkles,
  AlertCircle,
  Palette,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";
import { formatFullDate, getAuthHeaders } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";
import ThemeToggle from "@/components/ThemeToggle";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface StatsSummary {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  recycleBin: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Edit Name State
  const [name, setName] = useState("");
  const [updatingName, setUpdatingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const fetchProfileAndStats = useCallback(async () => {
    try {
      setLoading(true);
      const [meRes, tasksRes] = await Promise.all([
        fetch("/api/auth/me", { headers: getAuthHeaders() }),
        fetch("/api/tasks", { headers: getAuthHeaders() }),
      ]);

      if (meRes.status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("todo_token");
          localStorage.removeItem("todo_user");
        }
        router.push("/login");
        return;
      }

      const meData = await meRes.json();
      if (meData.user) {
        setUser(meData.user);
        setName(meData.user.name);
      }

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        if (tasksData.stats) {
          setStats(tasksData.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load user profile:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfileAndStats();
  }, [fetchProfileAndStats]);

  // Sign out handler
  const handleSignOut = async () => {
    try {
      setLoggingOut(true);
      if (typeof window !== "undefined") {
        localStorage.removeItem("todo_token");
        localStorage.removeItem("todo_user");
      }
      await fetch("/api/auth/logout", { method: "POST", headers: getAuthHeaders() });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
      setLoggingOut(false);
    }
  };

  // Copy User ID
  const handleCopyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // Update Name
  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setUpdatingName(true);
      setNameSuccess(false);

      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update name");

      setUser((prev) => (prev ? { ...prev, name: data.user.name } : null));
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to update name");
    } finally {
      setUpdatingName(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    try {
      setUpdatingPassword(true);

      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");

      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err: any) {
      setPasswordError(err.message || "Failed to change password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/80 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Tasks Workspace</span>
          </Link>

          <div className="flex items-center gap-2.5">
            {/* Theme Selector */}
            <ThemeToggle showLabel={true} />

            {/* Prominent Sign Out Button */}
            <button
              onClick={handleSignOut}
              disabled={loggingOut}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 font-bold text-xs sm:text-sm transition-all hover:scale-102"
            >
              {loggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Banner Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/20 border border-indigo-800/40">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center text-2xl font-black uppercase shadow-lg shadow-indigo-500/30 border-2 border-white/20">
                {user?.name ? user.name.charAt(0) : "U"}
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold text-indigo-200 border border-white/15">
                  <Shield className="w-3 h-3 text-emerald-400" />
                  <span>Authenticated Account</span>
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight">
                  {user?.name}
                </h1>
                <p className="text-xs sm:text-sm text-indigo-200">{user?.email}</p>
              </div>
            </div>

            {/* Quick Sign Out from banner */}
            <div className="flex-shrink-0">
              <button
                onClick={handleSignOut}
                disabled={loggingOut}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-rose-600 hover:border-rose-500 text-white font-bold text-xs sm:text-sm border border-white/15 transition-all shadow-md"
              >
                {loggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                <span>Sign Out Account</span>
              </button>
            </div>
          </div>
        </div>

        {/* Account Details & Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sign In Credentials & Info */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Sign In Details
              </h3>
            </div>

            <div className="space-y-3.5 text-sm">
              {/* Full Name */}
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Full Name
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {user?.name}
                </span>
              </div>

              {/* Email */}
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Registered Email
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {user?.email}
                </span>
              </div>

              {/* Account ID with copy button */}
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  User Account ID
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400 truncate max-w-[220px]">
                    {user?.id}
                  </span>
                  <button
                    onClick={handleCopyId}
                    className="p-1 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Copy User ID"
                  >
                    {copiedId ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Created Date */}
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Member Since
                </span>
                <div className="flex items-center gap-1.5 mt-0.5 text-slate-700 dark:text-slate-300">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span>
                    {user?.createdAt ? formatFullDate(user.createdAt) : "Recently"}
                  </span>
                </div>
              </div>

              {/* Security info */}
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Security Status
                </span>
                <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200/50 dark:border-emerald-800/50">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Bcrypt Encrypted & Active JWT Session</span>
                </div>
              </div>
            </div>
          </div>

          {/* Workspace Activity Stats */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <ListTodo className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Workspace Activity
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  Total Active Tasks
                </span>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {stats?.total || 0}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Completed Tasks
                </span>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {stats?.completed || 0}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  In Progress
                </span>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {stats?.inProgress || 0}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40">
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  Pending Queue
                </span>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {stats?.pending || 0}
                </div>
              </div>
            </div>

            {/* Recycle Bin counter link */}
            <div className="pt-2">
              <Link
                href="/"
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors"
              >
                <span>Items in Recycle Bin</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold">
                  {stats?.recycleBin || 0}
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Update Profile Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Change Name */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                Update Display Name
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Change how your name appears on your workspace
              </p>
            </div>

            {nameSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                Name updated successfully!
              </div>
            )}

            <form onSubmit={handleUpdateName} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={updatingName}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
              >
                {updatingName && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Name</span>
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                Change Password
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Update your account password
              </p>
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                Password updated successfully!
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  New Password (min. 6 chars)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={updatingPassword}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
              >
                {updatingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Update Password</span>
              </button>
            </form>
          </div>
        </div>

        {/* Appearance & Theme Selection Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  Appearance & Theme Selection
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Choose how TODO looks to you across all your devices
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Active mode:</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 capitalize">
                {theme === "system" ? `System (${resolvedTheme})` : theme}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
            {/* Light Option */}
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden ${
                theme === "light"
                  ? "border-amber-400 bg-amber-50/40 ring-2 ring-amber-400/50 shadow-sm"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
                  <Sun className="w-5 h-5" />
                </div>
                {theme === "light" && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    <Check className="w-3 h-3" /> Selected
                  </span>
                )}
              </div>
              <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                Light Mode
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Crisp, bright look with clean contrasts.
              </p>
            </button>

            {/* Dark Option */}
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden ${
                theme === "dark"
                  ? "border-indigo-500 bg-indigo-950/40 ring-2 ring-indigo-500/50 shadow-sm"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-900/60 text-indigo-400 flex items-center justify-center shadow-xs">
                  <Moon className="w-5 h-5" />
                </div>
                {theme === "dark" && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-800">
                    <Check className="w-3 h-3" /> Selected
                  </span>
                )}
              </div>
              <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                Dark Mode
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Sleek midnight look easy on the eyes.
              </p>
            </button>

            {/* System Option */}
            <button
              type="button"
              onClick={() => setTheme("system")}
              className={`p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden ${
                theme === "system"
                  ? "border-blue-500 bg-blue-50/40 dark:bg-blue-950/40 ring-2 ring-blue-500/50 shadow-sm"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shadow-xs">
                  <Laptop className="w-5 h-5" />
                </div>
                {theme === "system" && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                    <Check className="w-3 h-3" /> Selected
                  </span>
                )}
              </div>
              <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                System Default
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Automatically match your device preference.
              </p>
            </button>
          </div>
        </div>

        {/* Clear Sign Out Section at the bottom */}
        <div className="p-6 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">
              Sign Out of TODO
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Securely end your session on this browser. You can sign back in anytime with your credentials.
            </p>
          </div>

          <button
            onClick={handleSignOut}
            disabled={loggingOut}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-600/20 transition-all hover:scale-102 flex-shrink-0"
          >
            {loggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            <span>Sign Out Now</span>
          </button>
        </div>
      </main>
    </div>
  );
}
