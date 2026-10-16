"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckSquare, LogOut, Plus, Trash2, User, Loader2 } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

interface NavbarProps {
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  onOpenCreateModal: () => void;
  recycleBinCount?: number;
  onOpenRecycleBin?: () => void;
}

export default function Navbar({
  user,
  onOpenCreateModal,
  recycleBinCount = 0,
  onOpenRecycleBin,
}: NavbarProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      if (typeof window !== "undefined") {
        localStorage.removeItem("todo_token");
        localStorage.removeItem("todo_user");
      }
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 transition-transform group-hover:scale-105">
            <CheckSquare className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-indigo-200 dark:to-slate-200 bg-clip-text text-transparent">
                TODO
              </span>
              <span className="hidden sm:inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/60">
                PRO
              </span>
            </div>
            <p className="hidden sm:block text-[10px] font-medium text-slate-400 dark:text-slate-500 leading-none">
              Smart Task Management
            </p>
          </div>
        </Link>

        {/* Right side actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Selection Toggle */}
          <ThemeToggle />
          {/* Recycle Bin Button */}
          {onOpenRecycleBin && (
            <button
              onClick={onOpenRecycleBin}
              title="Open Recycle Bin to recover deleted tasks"
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold transition-all hover:scale-102"
            >
              <Trash2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="hidden md:inline">Recycle Bin</span>
              {recycleBinCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold leading-none animate-pulse shadow-xs">
                  {recycleBinCount}
                </span>
              )}
            </button>
          )}

          {/* New Task Button */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Task</span>
          </button>

          {/* User Sign In Details Pill & Sign Out Option */}
          {user && (
            <div className="flex items-center gap-2 pl-1 sm:pl-2 sm:border-l border-slate-200 dark:border-slate-800">
              {/* Clickable Sign In Details Pill */}
              <Link
                href="/profile"
                title="View Sign In Details & Account Profile"
                className="flex items-center gap-2.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200/70 dark:border-slate-700/70 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all hover:scale-102 shadow-2xs group"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center text-xs font-bold uppercase shadow-2xs group-hover:shadow-indigo-500/30">
                  {user.name ? user.name.charAt(0) : "U"}
                </div>
                <div className="hidden md:block text-left text-xs leading-tight">
                  <div className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate max-w-[120px]">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                    Sign In Details
                  </div>
                </div>
              </Link>

              {/* Prominent Sign Out Button */}
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                title="Sign out of your account"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50 text-xs sm:text-sm font-bold transition-all hover:scale-102"
              >
                {loggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
