"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  Trash2,
  RotateCcw,
  AlertTriangle,
  Loader2,
  Inbox,
  Clock,
  Tag as TagIcon,
  CheckCircle,
} from "lucide-react";
import { formatFullDate, formatRelativeTime, PRIORITY_MAP, cn } from "@/lib/utils";
import { TaskItem } from "./TaskModal";

interface RecycleBinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTasksChanged: () => void;
  showToast: (text: string, type?: "success" | "error") => void;
}

export default function RecycleBinModal({
  isOpen,
  onClose,
  onTasksChanged,
  showToast,
}: RecycleBinModalProps) {
  const [deletedTasks, setDeletedTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [emptyBinLoading, setEmptyBinLoading] = useState(false);
  const [taskToPermDelete, setTaskToPermDelete] = useState<TaskItem | null>(null);
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);

  const fetchDeletedTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tasks/recycle-bin");
      if (res.ok) {
        const data = await res.json();
        setDeletedTasks(data.tasks || []);
      }
    } catch (err) {
      console.error("Failed to load recycle bin:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchDeletedTasks();
      setShowEmptyConfirm(false);
      setTaskToPermDelete(null);
    }
  }, [isOpen, fetchDeletedTasks]);

  // Handle Restore
  const handleRestore = async (task: TaskItem) => {
    try {
      setActionLoadingId(task.id);
      const res = await fetch(`/api/tasks/${task.id}/restore`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to restore task");

      showToast(`Restored "${task.title}" back to active tasks!`);
      setDeletedTasks((prev) => prev.filter((t) => t.id !== task.id));
      onTasksChanged();
    } catch {
      showToast("Could not restore task", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Permanent Delete Single
  const handlePermanentDelete = async (task: TaskItem) => {
    try {
      setActionLoadingId(task.id);
      const res = await fetch(`/api/tasks/${task.id}?permanent=true`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete permanently");

      showToast(`Permanently deleted "${task.title}"`);
      setDeletedTasks((prev) => prev.filter((t) => t.id !== task.id));
      setTaskToPermDelete(null);
      onTasksChanged();
    } catch {
      showToast("Could not permanently delete task", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Empty Entire Bin
  const handleEmptyBin = async () => {
    try {
      setEmptyBinLoading(true);
      const res = await fetch("/api/tasks/recycle-bin", {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to empty recycle bin");

      showToast("Recycle bin emptied successfully");
      setDeletedTasks([]);
      setShowEmptyConfirm(false);
      onTasksChanged();
    } catch {
      showToast("Could not empty recycle bin", "error");
    } finally {
      setEmptyBinLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200/50 dark:border-rose-900/50">
              <Trash2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Recycle Bin
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {deletedTasks.length} {deletedTasks.length === 1 ? "task" : "tasks"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Recover mistakenly deleted tasks or permanently delete them
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {deletedTasks.length > 0 && !showEmptyConfirm && (
              <button
                onClick={() => setShowEmptyConfirm(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
              >
                Empty Bin
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Empty Bin Confirmation Bar */}
        {showEmptyConfirm && (
          <div className="px-6 py-3.5 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900 flex items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-rose-800 dark:text-rose-200">
              Permanently delete all {deletedTasks.length} tasks in the recycle bin?
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEmptyConfirm(false)}
                className="px-2.5 py-1 text-slate-600 dark:text-slate-300 font-semibold hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={handleEmptyBin}
                disabled={emptyBinLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs transition-colors"
              >
                {emptyBinLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                <span>Empty All</span>
              </button>
            </div>
          </div>
        )}

        {/* Body / List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />
              <p className="text-sm">Loading deleted tasks...</p>
            </div>
          ) : deletedTasks.length === 0 ? (
            <div className="py-12 text-center max-w-sm mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <Inbox className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                Recycle Bin is Empty
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                When you delete tasks, they will move here first so you can easily restore them if deleted by accident.
              </p>
            </div>
          ) : (
            deletedTasks.map((task) => {
              const priorityInfo = PRIORITY_MAP[task.priority] || PRIORITY_MAP.MEDIUM;
              const isActionLoading = actionLoadingId === task.id;

              return (
                <div
                  key={task.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 break-words">
                          {task.title}
                        </h5>
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                            priorityInfo.bg,
                            priorityInfo.text,
                            priorityInfo.border
                          )}
                        >
                          {priorityInfo.label}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {/* Tags */}
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          {task.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50"
                            >
                              <TagIcon className="w-2.5 h-2.5" />
                              <span>{tag}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* Restore Button */}
                      <button
                        onClick={() => handleRestore(task)}
                        disabled={isActionLoading}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs font-bold transition-all hover:scale-102 active:scale-98 shadow-2xs"
                        title="Restore this task back to active list"
                      >
                        {isActionLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="w-3.5 h-3.5" />
                        )}
                        <span>Recover</span>
                      </button>

                      {/* Permanent Delete */}
                      <button
                        onClick={() => handlePermanentDelete(task)}
                        disabled={isActionLoading}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        title="Permanently Delete Forever"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                    <Clock className="w-3 h-3" />
                    <span>
                      Deleted{" "}
                      {task.deletedAt
                        ? formatRelativeTime(task.deletedAt)
                        : "recently"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs text-slate-500">
          <span>Items in Recycle Bin remain until you empty them.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
