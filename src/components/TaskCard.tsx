"use client";

import { useState } from "react";
import {
  CheckCircle,
  Circle,
  Edit3,
  Trash2,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Tag as TagIcon,
  CheckCircle2,
} from "lucide-react";
import {
  STATUS_MAP,
  PRIORITY_MAP,
  formatFullDate,
  formatRelativeTime,
  cn,
} from "@/lib/utils";
import { TaskItem } from "./TaskModal";

interface TaskCardProps {
  task: TaskItem;
  onEdit: (task: TaskItem) => void;
  onDelete: (task: TaskItem) => void;
  onStatusChange: (
    taskId: string,
    newStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED"
  ) => void;
  onSelectTag?: (tag: string) => void;
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  onSelectTag,
}: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isCompleted = task.status === "COMPLETED";
  const isInProgress = task.status === "IN_PROGRESS";

  const statusInfo = STATUS_MAP[task.status] || STATUS_MAP.PENDING;
  const priorityInfo = PRIORITY_MAP[task.priority] || PRIORITY_MAP.MEDIUM;

  const nextStatusCycle: Record<string, "PENDING" | "IN_PROGRESS" | "COMPLETED"> = {
    PENDING: "IN_PROGRESS",
    IN_PROGRESS: "COMPLETED",
    COMPLETED: "PENDING",
  };

  const cycleStatus = () => {
    onStatusChange(task.id, nextStatusCycle[task.status]);
  };

  const isLongDescription = (task.description?.length || 0) > 180;

  // Check if edited after creation (difference > 1 minute)
  const isEdited =
    new Date(task.updatedAt).getTime() - new Date(task.createdAt).getTime() > 60000;

  // Task Progress Calculation
  const progressPercent = isCompleted ? 100 : isInProgress ? 50 : 0;
  const progressColor = isCompleted
    ? "bg-emerald-500"
    : isInProgress
    ? "bg-blue-500"
    : "bg-amber-400";

  return (
    <div
      className={cn(
        "group relative bg-white dark:bg-slate-900 border border-l-4 rounded-2xl p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between",
        priorityInfo.accentBorder,
        isCompleted
          ? "border-slate-200 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/50 opacity-90 shadow-none"
          : "border-slate-200/90 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700"
      )}
    >
      <div className="space-y-3">
        {/* Header Row: Complete Checkbox, Title and Badges */}
        <div className="flex items-start gap-3">
          {/* Quick Checkbox Button */}
          <button
            onClick={() =>
              onStatusChange(task.id, isCompleted ? "PENDING" : "COMPLETED")
            }
            className="mt-0.5 text-slate-300 hover:text-emerald-500 transition-transform active:scale-90 focus:outline-none flex-shrink-0"
            title={isCompleted ? "Mark as Pending" : "Mark as Completed"}
          >
            {isCompleted ? (
              <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950/60" />
            ) : (
              <Circle className="w-5 h-5 hover:stroke-emerald-500 transition-colors" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-1.5">
              <h4
                className={cn(
                  "text-base sm:text-lg font-bold leading-tight break-words pr-2 flex-1",
                  isCompleted
                    ? "line-through text-slate-400 dark:text-slate-500 font-medium"
                    : "text-slate-900 dark:text-white"
                )}
              >
                {task.title}
              </h4>

              {/* Status & Priority Badges */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Status Badge (Clickable to cycle) */}
                <button
                  onClick={cycleStatus}
                  title="Click to cycle status (Pending -> In Progress -> Completed)"
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all hover:scale-105 active:scale-95 shadow-2xs",
                    statusInfo.bg,
                    statusInfo.text,
                    statusInfo.border
                  )}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full", statusInfo.dot)} />
                  {statusInfo.label}
                </button>

                {/* Priority Badge */}
                <span
                  className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border shadow-2xs",
                    priorityInfo.bg,
                    priorityInfo.text,
                    priorityInfo.border
                  )}
                >
                  {priorityInfo.label}
                </span>
              </div>
            </div>

            {/* Tags Pills */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap my-2">
                {task.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => onSelectTag?.(tag)}
                    title={`Filter tasks by #${tag}`}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors shadow-2xs"
                  >
                    <TagIcon className="w-2.5 h-2.5 text-indigo-500" />
                    <span>#{tag}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Description Block */}
            {task.description && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/70 text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
                {isLongDescription && !isExpanded ? (
                  <>
                    {task.description.slice(0, 180)}...
                    <button
                      onClick={() => setIsExpanded(true)}
                      className="inline-flex items-center ml-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Read more <ChevronDown className="w-3 h-3 ml-0.5" />
                    </button>
                  </>
                ) : (
                  <>
                    {task.description}
                    {isLongDescription && (
                      <button
                        onClick={() => setIsExpanded(false)}
                        className="inline-flex items-center ml-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Show less <ChevronUp className="w-3 h-3 ml-0.5" />
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Task Progress Bar */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <span>Task Progress</span>
              <span className="text-slate-600 dark:text-slate-300">
                ({progressPercent}%)
              </span>
            </span>
            <span
              className={cn(
                "font-bold",
                isCompleted
                  ? "text-emerald-600 dark:text-emerald-400"
                  : isInProgress
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-amber-500"
              )}
            >
              {isCompleted ? "Completed" : isInProgress ? "In Progress" : "Pending"}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={cn("h-full transition-all duration-300 rounded-full", progressColor)}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer: Created Date & Action Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Prominent Created Date Tag */}
        <div className="flex items-center flex-wrap gap-2 text-slate-500 dark:text-slate-400">
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50 font-medium"
            title={`Created on ${formatFullDate(task.createdAt)}`}
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
            <span>Created {formatFullDate(task.createdAt)}</span>
          </div>

          {isEdited && (
            <span
              className="inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500"
              title={`Last edited on ${formatFullDate(task.updatedAt)}`}
            >
              <Clock className="w-3 h-3" />
              <span>Edited {formatRelativeTime(task.updatedAt)}</span>
            </span>
          )}
        </div>

        {/* Actions: Edit & Move to Recycle Bin */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={() => onEdit(task)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-all hover:scale-105 active:scale-95"
            title="Edit task description, tags, title, status, or priority"
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
            <span>Edit</span>
          </button>

          <button
            onClick={() => onDelete(task)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 font-semibold transition-all hover:scale-105 active:scale-95"
            title="Move to Recycle Bin (can be recovered later)"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
