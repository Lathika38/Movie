import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMovie } from '../../context/MovieContext';
import { useNotifications } from '../../context/NotificationContext';
import { notificationApi } from '../../api/notificationApi';
import { X, Megaphone, Send, Sparkles } from 'lucide-react';

export const CreateAnnouncementModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { activeMovie } = useMovie();
  const { showToast } = useNotifications();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState('ALL');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !activeMovie) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setLoading(true);

    try {
      const recipientCount = await notificationApi.broadcastAnnouncement({
        movieId: activeMovie.id,
        senderId: user?.id || 'USR-ANON',
        senderName: user?.name || 'Production Lead',
        senderRole: user?.role || 'DIRECTOR',
        targetRole: targetRole,
        title: title,
        message: message
      });

      showToast(`📢 Announcement dispatched to ${recipientCount} crew member(s)!`, 'success');
      setTitle('');
      setMessage('');
      onClose();
    } catch (err) {
      alert(`Error broadcasting announcement: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="cinema-glass rounded-3xl border border-amber-500/30 max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-['Outfit']">Dispatch Crew Announcement</h2>
              <p className="text-xs text-slate-400">Broadcast official instructions to production crew & cast</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Recipients</label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Entire Production Crew & Cast (All Roles)</option>
              <option value="ACTOR">Cast & Actors / Actresses Only</option>
              <option value="MUSIC_DIRECTOR">Music Department & Composers Only</option>
              <option value="PRODUCER">Executive Producers & Line Managers</option>
              <option value="DIRECTOR">Directorial & Camera Team</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Announcement Headline *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Tomorrow Scene 18 Call Sheet & Weather Alert"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Instruction Details *</label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide detailed instructions, wardrobe notes, call times, location directions, or score brief adjustments..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {loading ? "Broadcasting..." : "Dispatch Announcement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
