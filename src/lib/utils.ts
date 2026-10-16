import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns Authorization header with stored token if present
 */
export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  if (typeof window !== "undefined") {
    try {
      const token = localStorage.getItem("todo_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    } catch {
      // ignore
    }
  }
  return headers;
}

/**
 * Returns formatted date like "Oct 16, 2026, 2:45 PM"
 */
export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(date);
}

/**
 * Returns complete verbose date like "Friday, October 16, 2026"
 */
export function formatTodayDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * Returns full date with weekday: "Friday, Oct 16, 2026 at 2:30 PM"
 */
export function formatFullDate(dateString: string | Date): string {
  const date = new Date(dateString);
  const datePart = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);

  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);

  return `${datePart} at ${timePart}`;
}

/**
 * Returns relative human readable time like "Just now", "10m ago", "2h ago", "Yesterday"
 */
export function formatRelativeTime(dateString: string | Date): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 172800) return "Yesterday";
  return formatDate(date);
}

/**
 * Dynamic greeting depending on the user's local hour
 */
export function getGreeting(name?: string): { greeting: string; icon: string } {
  const hour = new Date().getHours();
  let greeting = "Good evening";
  let icon = "🌆";

  if (hour >= 5 && hour < 12) {
    greeting = "Good morning";
    icon = "☀️";
  } else if (hour >= 12 && hour < 17) {
    greeting = "Good afternoon";
    icon = "🌤️";
  } else if (hour >= 17 && hour < 22) {
    greeting = "Good evening";
    icon = "🌆";
  } else {
    greeting = "Good night";
    icon = "🌙";
  }

  return {
    greeting: name ? `${greeting}, ${name}!` : `${greeting}!`,
    icon,
  };
}

export const STATUS_MAP: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  PENDING: {
    label: "Pending",
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-300/60 dark:border-amber-700/60",
    dot: "bg-amber-500",
  },
  IN_PROGRESS: {
    label: "In Progress",
    bg: "bg-blue-500/10 dark:bg-blue-500/20",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-300/60 dark:border-blue-700/60",
    dot: "bg-blue-500",
  },
  COMPLETED: {
    label: "Completed",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-300/60 dark:border-emerald-700/60",
    dot: "bg-emerald-500",
  },
};

export const PRIORITY_MAP: Record<
  string,
  { label: string; bg: string; text: string; border: string; accentBorder: string }
> = {
  LOW: {
    label: "Low Priority",
    bg: "bg-slate-500/10 dark:bg-slate-700/30",
    text: "text-slate-600 dark:text-slate-300",
    border: "border-slate-300/60 dark:border-slate-700/60",
    accentBorder: "border-l-slate-400 dark:border-l-slate-600",
  },
  MEDIUM: {
    label: "Medium Priority",
    bg: "bg-orange-500/10 dark:bg-orange-500/20",
    text: "text-orange-700 dark:text-orange-300",
    border: "border-orange-300/60 dark:border-orange-700/60",
    accentBorder: "border-l-amber-500 dark:border-l-amber-500",
  },
  HIGH: {
    label: "High Priority",
    bg: "bg-rose-500/10 dark:bg-rose-500/20",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-300/60 dark:border-rose-700/60",
    accentBorder: "border-l-rose-500 dark:border-l-rose-500",
  },
};
