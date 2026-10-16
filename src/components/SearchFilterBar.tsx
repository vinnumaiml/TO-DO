"use client";

import { Search, X, SlidersHorizontal, ArrowUpDown, RotateCcw, Tag as TagIcon } from "lucide-react";

interface SearchFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  priorityFilter: string;
  onPriorityChange: (priority: string) => void;
  tagFilter: string;
  onTagChange: (tag: string) => void;
  availableTags: string[];
  sortBy: string;
  onSortChange: (sort: string) => void;
  onResetFilters: () => void;
}

export default function SearchFilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  tagFilter,
  onTagChange,
  availableTags,
  sortBy,
  onSortChange,
  onResetFilters,
}: SearchFilterBarProps) {
  const isFiltered =
    search !== "" ||
    statusFilter !== "ALL" ||
    priorityFilter !== "ALL" ||
    tagFilter !== "ALL" ||
    sortBy !== "newest";

  const statusOptions = [
    { value: "ALL", label: "All Tasks" },
    { value: "PENDING", label: "Pending" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "COMPLETED", label: "Completed" },
  ];

  return (
    <div className="bg-white dark:bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks by title, description or #tags..."
            className="w-full pl-10 pr-9 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters Row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tag Filter */}
          {availableTags.length > 0 && (
            <div className="relative min-w-[130px]">
              <select
                value={tagFilter}
                onChange={(e) => onTagChange(e.target.value)}
                className="w-full appearance-none pl-8 pr-8 py-2.5 text-xs sm:text-sm font-medium rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer shadow-2xs"
              >
                <option value="ALL">All Tags</option>
                {availableTags.map((t) => (
                  <option key={t} value={t}>
                    #{t}
                  </option>
                ))}
              </select>
              <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-indigo-500 pointer-events-none" />
              <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          )}

          {/* Priority Filter */}
          <div className="relative min-w-[130px]">
            <select
              value={priorityFilter}
              onChange={(e) => onPriorityChange(e.target.value)}
              className="w-full appearance-none pl-3.5 pr-8 py-2.5 text-xs sm:text-sm font-medium rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer shadow-2xs"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
            <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Sort By Dropdown */}
          <div className="relative min-w-[130px]">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full appearance-none pl-3.5 pr-8 py-2.5 text-xs sm:text-sm font-medium rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer shadow-2xs"
            >
              <option value="newest">Newest Created</option>
              <option value="oldest">Oldest Created</option>
              <option value="priority">By Priority</option>
              <option value="updated">Recently Updated</option>
            </select>
            <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Status Segmented Buttons & Active Tag Chip */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 flex-wrap gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onStatusChange(opt.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                statusFilter === opt.value
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 scale-102"
                  : "bg-slate-100/90 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {tagFilter !== "ALL" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
              <TagIcon className="w-3 h-3 text-indigo-500" />
              <span>#{tagFilter}</span>
              <button
                onClick={() => onTagChange("ALL")}
                className="hover:text-rose-500 ml-1"
                title="Remove tag filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline ml-1 whitespace-nowrap"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
