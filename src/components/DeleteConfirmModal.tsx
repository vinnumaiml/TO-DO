"use client";

import { Trash2, Loader2, RotateCcw } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  taskTitle: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  taskTitle,
  onConfirm,
  onCancel,
  loading,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 text-center animate-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center mb-4 border border-rose-200/50 dark:border-rose-900/50">
          <Trash2 className="w-6 h-6 stroke-[2.2]" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Move to Recycle Bin?
        </h3>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            &ldquo;{taskTitle}&rdquo;
          </span>
          ? It will be safely moved to your Recycle Bin where you can restore it anytime.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2.5 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/25 transition-all hover:scale-102 active:scale-98"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Move to Recycle Bin</span>
          </button>
        </div>
      </div>
    </div>
  );
}
