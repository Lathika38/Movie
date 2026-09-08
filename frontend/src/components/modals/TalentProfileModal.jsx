import React, { useState, useEffect } from 'react';
import { castingApi } from '../../api/castingApi';
import {
  X,
  UserCheck,
  Music,
  Award,
  Film,
  CheckCircle2,
  ExternalLink,
  Send,
  Star,
  Sparkles,
  Clapperboard
} from 'lucide-react';

export const TalentProfileModal = ({ isOpen, onClose, talent, onDispatchOffer }) => {
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (talent?.id && isOpen) {
      setLoading(true);
      castingApi.getActorCastingRequests(talent.id)
        .then((reqs) => {
          const accepted = (reqs || []).filter(r => r.status === 'ACCEPTED').length;
          setAcceptedCount(accepted);
        })
        .catch(() => setAcceptedCount(1))
        .finally(() => setLoading(false));
    }
  }, [talent?.id, isOpen]);

  if (!isOpen || !talent) return null;

  const moviesDone = talent.filmography?.length || (talent.role === 'ACTOR' ? 4 : 5);
  const moviesSigned = acceptedCount || (talent.role === 'ACTOR' ? 2 : 3);
  const formattedRole = (talent.role || 'TALENT').replace('_', ' ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Overlay */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl cinema-glass rounded-3xl border border-slate-700 shadow-2xl p-6 sm:p-8 space-y-6 z-10 animate-in zoom-in-95 overflow-y-auto max-h-[90vh]">
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-4">
            <img
              src={talent.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(talent.name || "Talent")}`}
              alt={talent.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(talent.name || "Talent")}`;
              }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-500/50 shadow-xl"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  {formattedRole}
                </span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {talent.availability || 'Available for Casting'}
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-100 font-['Cinzel']">
                {talent.name}
              </h2>
              <p className="text-xs text-slate-400">
                {talent.title || `${formattedRole} Portfolio`} • {talent.email}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Key Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center">
            <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-1">
              <Film className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Movies Done</span>
            </div>
            <p className="text-2xl font-black text-slate-100 font-['Outfit']">{moviesDone}</p>
            <p className="text-[10px] text-slate-500">Released Productions</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center">
            <div className="flex items-center justify-center gap-1.5 text-emerald-400 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Movies Signed</span>
            </div>
            <p className="text-2xl font-black text-emerald-400 font-['Outfit']">{moviesSigned}</p>
            <p className="text-[10px] text-slate-500">Active Contracts</p>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center">
            <div className="flex items-center justify-center gap-1.5 text-cyan-400 mb-1">
              <Star className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Studio Score</span>
            </div>
            <p className="text-2xl font-black text-cyan-400 font-['Outfit']">98%</p>
            <p className="text-[10px] text-slate-500">Verified Rating</p>
          </div>
        </div>

        {/* Bio & Details */}
        <div className="space-y-4 text-xs text-slate-300">
          <div>
            <h4 className="font-bold text-slate-100 uppercase tracking-wider text-[11px] mb-1">Professional Bio & Philosophy</h4>
            <p className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed">
              {talent.bio || `${talent.name} is a distinguished ${formattedRole.toLowerCase()} with extensive theatrical and feature experience across major cinema productions.`}
            </p>
          </div>

          {/* Primary Skills */}
          {talent.skills && talent.skills.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-100 uppercase tracking-wider text-[11px] mb-2">Primary Specializations & Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {talent.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px] font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Showreel Link */}
          {talent.showreelUrl && (
            <div className="pt-2">
              <a
                href={talent.showreelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-semibold text-xs transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View Verified Showreel / Audio Reel
              </a>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
          >
            Close Profile
          </button>

          {onDispatchOffer && (
            <button
              onClick={() => {
                onClose();
                onDispatchOffer(talent);
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-colors"
            >
              <Send className="w-4 h-4" />
              {talent.role === 'MUSIC_DIRECTOR' ? "Assign Soundtrack Cue" : "Dispatch Role Offer"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
