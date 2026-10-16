"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Loader2,
  CheckSquare,
  Sparkles,
  Inbox,
  FilterX,
  AlertCircle,
  Calendar,
  Clock,
  Layers,
  Trash2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import TaskStats from "@/components/TaskStats";
import SearchFilterBar from "@/components/SearchFilterBar";
import TaskCard from "@/components/TaskCard";
import TaskModal, { TaskItem } from "@/components/TaskModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import RecycleBinModal from "@/components/RecycleBinModal";
import { getGreeting, formatTodayDate } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();

  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    recycleBin: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Time & Greeting State (client-side only to avoid hydration mismatch)
  const [todayString, setTodayString] = useState("");
  const [currentTimeString, setCurrentTimeString] = useState("");
  const [greetingInfo, setGreetingInfo] = useState({
    greeting: "Welcome back",
    icon: "👋",
  });

  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [tagFilter, setTagFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskItem | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<TaskItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Update date, clock, and greeting
  useEffect(() => {
    const updateDateTime = () => {
      setTodayString(formatTodayDate());
      setCurrentTimeString(
        new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }).format(new Date())
      );
      setGreetingInfo(getGreeting(user?.name));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, [user?.name]);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Fetch current user session
  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      } else {
        window.location.href = "/login";
      }
    } catch {
      window.location.href = "/login";
    }
  }, []);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (priorityFilter !== "ALL") params.append("priority", priorityFilter);
      if (tagFilter !== "ALL") params.append("tag", tagFilter);
      if (sortBy) params.append("sort", sortBy);

      const res = await fetch(`/api/tasks?${params.toString()}`);
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load tasks");
      }

      setTasks(data.tasks || []);
      if (data.stats) {
        setStats(data.stats);
      }
      if (Array.isArray(data.allTags)) {
        setAvailableTags(data.allTags);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter, tagFilter, sortBy, router]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 200); // 200ms debounce for search typing

    return () => clearTimeout(timer);
  }, [fetchTasks]);

  // Handle Save (Create or Edit)
  const handleSaveTask = async (data: {
    id?: string;
    title: string;
    description: string;
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
    priority: "LOW" | "MEDIUM" | "HIGH";
    tags: string[];
  }) => {
    const isEditing = Boolean(data.id);
    const url = isEditing ? `/api/tasks/${data.id}` : "/api/tasks";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const resData = await res.json();
    if (!res.ok) {
      throw new Error(resData.error || "Failed to save task");
    }

    showToast(
      isEditing ? "Task updated successfully!" : "Task created successfully!"
    );
    fetchTasks();
  };

  // Handle Quick Status Change
  const handleStatusChange = async (
    taskId: string,
    newStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED"
  ) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );

      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      fetchTasks();
    } catch {
      showToast("Could not update task status", "error");
      fetchTasks();
    }
  };

  // Handle Delete Confirmation (Moves to Recycle Bin)
  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;

    try {
      setDeleteLoading(true);
      const res = await fetch(`/api/tasks/${taskToDelete.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete task");
      }

      showToast(
        `"${taskToDelete.title}" moved to Recycle Bin (you can recover it anytime)`
      );
      setTaskToDelete(null);
      fetchTasks();
    } catch (err: any) {
      showToast(err.message || "Failed to delete task", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setPriorityFilter("ALL");
    setTagFilter("ALL");
    setSortBy("newest");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/80 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        user={user}
        onOpenCreateModal={() => {
          setTaskToEdit(null);
          setIsModalOpen(true);
        }}
        recycleBinCount={stats.recycleBin}
        onOpenRecycleBin={() => setIsRecycleBinOpen(true)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 duration-300 max-w-md">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between gap-3 text-sm font-semibold border ${
              toastMessage.type === "success"
                ? "bg-slate-900 text-white border-slate-800 shadow-slate-950/20 dark:bg-slate-100 dark:text-slate-900 dark:border-white"
                : "bg-rose-600 text-white border-rose-500 shadow-rose-500/20"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toastMessage.type === "success" ? (
                <CheckSquare className="w-4 h-4 text-emerald-400 dark:text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{toastMessage.text}</span>
            </div>

            {stats.recycleBin > 0 && toastMessage.text.includes("Recycle Bin") && (
              <button
                onClick={() => setIsRecycleBinOpen(true)}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 dark:text-indigo-600 dark:hover:text-indigo-700 underline flex-shrink-0"
              >
                View Bin
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Welcome Greeting Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/20 border border-indigo-800/40">
          {/* Subtle background glow circles */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 border border-white/15 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Personal Task Space</span>
              </div>

              {/* Time of day Greeting */}
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight flex items-center gap-2.5">
                  <span>{greetingInfo.greeting}</span>
                  <span className="text-2xl sm:text-3xl">{greetingInfo.icon}</span>
                </h1>

                {/* Today's Date Banner (Right below greetings) */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/15 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 text-white font-medium text-xs sm:text-sm shadow-2xs">
                    <Calendar className="w-4 h-4 text-amber-300 flex-shrink-0" />
                    <span>Today is {todayString || "Loading today's date..."}</span>
                  </div>

                  {currentTimeString && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/20 backdrop-blur-md text-indigo-200 text-xs border border-white/10 font-mono">
                      <Clock className="w-3.5 h-3.5 text-indigo-300 flex-shrink-0" />
                      <span>{currentTimeString}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Helpful context / motivation line */}
              <p className="text-sm text-indigo-200/90 max-w-xl leading-relaxed pt-1">
                {stats.pending > 0
                  ? `You have ${stats.pending} task${stats.pending === 1 ? "" : "s"} waiting in your queue. Keep going!`
                  : stats.total > 0
                  ? "All tasks are completed or in progress! Great job staying on top of your work."
                  : "Welcome to your fresh workspace. Create tasks, organize with #tags, and recover anything from the Recycle Bin."}
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="flex-shrink-0 flex items-center gap-3 flex-wrap">
              {stats.recycleBin > 0 && (
                <button
                  onClick={() => setIsRecycleBinOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/15 transition-all shadow-md"
                >
                  <Trash2 className="w-4 h-4 text-rose-300" />
                  <span>Recycle Bin ({stats.recycleBin})</span>
                </button>
              )}

              <button
                onClick={() => {
                  setTaskToEdit(null);
                  setIsModalOpen(true);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-white to-slate-100 hover:from-slate-100 hover:to-white text-indigo-950 font-bold text-sm shadow-lg shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Create New Task</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Statistics & Progress Bar */}
        <TaskStats
          stats={stats}
          activeFilter={statusFilter}
          onSelectFilter={(newFilter) => setStatusFilter(newFilter)}
        />

        {/* Search, Sort & Filters */}
        <SearchFilterBar
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          tagFilter={tagFilter}
          onTagChange={setTagFilter}
          availableTags={availableTags}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onResetFilters={handleResetFilters}
        />

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2.5 shadow-2xs">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Task Cards List / State */}
        {loading && tasks.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-9 h-9 animate-spin text-indigo-600 mb-3" />
            <p className="text-sm font-medium">Loading your tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
            {search || statusFilter !== "ALL" || priorityFilter !== "ALL" || tagFilter !== "ALL" ? (
              <div className="max-w-md mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-4">
                  <FilterX className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
                  No matching tasks found
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
                  No active tasks matched your current search, tag, or status filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all hover:scale-105"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50 mx-auto flex items-center justify-center mb-4 shadow-sm">
                  <Inbox className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  No tasks created yet
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                  Your workspace is clean and ready. Add tasks with detailed descriptions, #tags, and priorities to start organizing your workflow.
                </p>
                <button
                  onClick={() => {
                    setTaskToEdit(null);
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Create Your First Task</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Tasks Grid */
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>
                  Showing {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
                </span>
              </span>
              {(statusFilter !== "ALL" || priorityFilter !== "ALL" || tagFilter !== "ALL" || search) && (
                <span className="text-indigo-600 dark:text-indigo-400 font-medium normal-case">
                  Filters active
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={(t) => {
                    setTaskToEdit(t);
                    setIsModalOpen(true);
                  }}
                  onDelete={(t) => setTaskToDelete(t)}
                  onStatusChange={handleStatusChange}
                  onSelectTag={(tag) => setTagFilter(tag)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Task Modal (Create & Edit) */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTaskToEdit(null);
        }}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
      />

      {/* Delete Confirmation Modal (Moves to Recycle Bin) */}
      <DeleteConfirmModal
        isOpen={Boolean(taskToDelete)}
        taskTitle={taskToDelete?.title || ""}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setTaskToDelete(null)}
        loading={deleteLoading}
      />

      {/* Recycle Bin Modal */}
      <RecycleBinModal
        isOpen={isRecycleBinOpen}
        onClose={() => setIsRecycleBinOpen(false)}
        onTasksChanged={fetchTasks}
        showToast={showToast}
      />
    </div>
  );
}
