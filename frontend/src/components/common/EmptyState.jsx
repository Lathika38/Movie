import React from 'react';
import { Film, Plus } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Film,
  title = "No productions yet",
  description = "Create your first movie to get started with MovieOS.",
  actionLabel,
  onAction
}) => {
  return (
    <div className="cinema-glass border border-dashed border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-12">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/10 to-cyan-500/10 border border-amber-500/20 flex items-center justify-center mb-5 text-amber-400">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-slate-100 mb-2 font-['Outfit']">{title}</h3>
      <p className="text-sm text-slate-400 mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};
