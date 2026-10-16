"use client";

import { CheckCircle2, Clock, ListTodo, PlayCircle, TrendingUp, Sparkles, Trophy } from "lucide-react";

interface StatsProps {
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    recycleBin?: number;
  };
  activeFilter: string;
  onSelectFilter: (status: string) => void;
}

export default function TaskStats({
  stats,
  activeFilter,
  onSelectFilter,
}: StatsProps) {
  const completionRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const statCards = [
    {
      id: "ALL",
      label: "Total Tasks",
      sublabel: "All active items",
      count: stats.total,
      icon: ListTodo,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-950/50",
      border: "border-indigo-100 dark:border-indigo-900/50",
      activeRing: "ring-2 ring-indigo-500 shadow-indigo-500/10",
      gradient: "from-indigo-500/5 to-transparent",
    },
    {
      id: "PENDING",
      label: "Pending",
      sublabel: "Needs action (0%)",
      count: stats.pending,
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/50",
      border: "border-amber-100 dark:border-amber-900/50",
      activeRing: "ring-2 ring-amber-500 shadow-amber-500/10",
      gradient: "from-amber-500/5 to-transparent",
    },
    {
      id: "IN_PROGRESS",
      label: "In Progress",
      sublabel: "Underway (50%)",
      count: stats.inProgress,
      icon: PlayCircle,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/50",
      border: "border-blue-100 dark:border-blue-900/50",
      activeRing: "ring-2 ring-blue-500 shadow-blue-500/10",
      gradient: "from-blue-500/5 to-transparent",
    },
    {
      id: "COMPLETED",
      label: "Completed",
      sublabel: "Finished (100%)",
      count: stats.completed,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/50",
      border: "border-emerald-100 dark:border-emerald-900/50",
      activeRing: "ring-2 ring-emerald-500 shadow-emerald-500/10",
      gradient: "from-emerald-500/5 to-transparent",
    },
  ];

  return (
    <div className="space-y-4">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const isActive = activeFilter === card.id;

          return (
            <button
              key={card.id}
              onClick={() => onSelectFilter(card.id)}
              className={`group relative overflow-hidden p-4 sm:p-5 rounded-2xl border bg-white dark:bg-slate-900/90 text-left transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
                card.border
              } ${
                isActive
                  ? `${card.activeRing} shadow-md`
                  : "hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              {/* Background gradient hint */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.gradient} pointer-events-none opacity-80`}
              />

              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
                    {card.label}
                  </span>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:block">
                    {card.sublabel}
                  </p>
                </div>
                <div
                  className={`p-2.5 rounded-xl ${card.bg} ${card.color} transition-transform group-hover:scale-110`}
                >
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>

              <div className="relative z-10 mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {card.count}
                </span>
                {card.id === "COMPLETED" && stats.total > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/50">
                    <TrendingUp className="w-3 h-3" />
                    {completionRate}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Prominent Task Completion Progress Bar */}
      {stats.total > 0 && (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-white via-indigo-50/20 to-white dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 rounded-2xl border border-indigo-100/80 dark:border-indigo-950 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
                {completionRate === 100 ? (
                  <Trophy className="w-4 h-4 text-amber-500" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Overall Task Progress
                </span>
                <span className="ml-2 text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                  {completionRate}% Completed
                </span>
              </div>
            </div>

            {/* Breakdown pills */}
            <div className="flex items-center gap-2.5 text-xs font-medium">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{stats.completed} Completed</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>{stats.inProgress} In Progress</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>{stats.pending} Pending</span>
              </span>
            </div>
          </div>

          {/* Progress Bar Track */}
          <div className="relative w-full bg-slate-200/80 dark:bg-slate-800 rounded-full h-3 overflow-hidden flex shadow-inner">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
              style={{
                width: `${(stats.completed / stats.total) * 100}%`,
              }}
              title={`Completed: ${stats.completed}`}
            />
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
              style={{
                width: `${(stats.inProgress / stats.total) * 100}%`,
              }}
              title={`In Progress: ${stats.inProgress}`}
            />
            <div
              className="bg-gradient-to-r from-amber-400 to-amber-300 transition-all duration-500"
              style={{
                width: `${(stats.pending / stats.total) * 100}%`,
              }}
              title={`Pending: ${stats.pending}`}
            />
          </div>

          {/* Dynamic encouragement message */}
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>
              {completionRate === 100
                ? "🎉 Amazing! All your tasks are completed."
                : completionRate >= 75
                ? "🚀 Almost there! Only a few tasks left to complete."
                : completionRate >= 50
                ? "💪 Halfway through! Great momentum."
                : stats.inProgress > 0
                ? "⚡ You're making progress on your active tasks."
                : "📝 Start by checking off your first task!"}
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {stats.completed} of {stats.total} tasks finished
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
