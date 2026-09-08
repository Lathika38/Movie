import React, { useState, useEffect } from 'react';
import { scriptApi } from '../../api/scriptApi';
import { useNotifications } from '../../context/NotificationContext';
import { X, Save, Edit3, Film, Clock, MapPin, Users } from 'lucide-react';

export const EditSceneModal = ({ isOpen, onClose, scene, onSaveSuccess }) => {
  const { showToast } = useNotifications();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    heading: '',
    location: '',
    setting: 'INT',
    timeOfDay: 'DAY',
    characters: '',
    summary: '',
    status: 'UNSHOT'
  });

  useEffect(() => {
    if (scene && isOpen) {
      setFormData({
        heading: scene.heading || '',
        location: scene.location || '',
        setting: scene.setting || 'INT',
        timeOfDay: scene.timeOfDay || 'DAY',
        characters: scene.characters ? scene.characters.join(', ') : '',
        summary: scene.summary || scene.description || '',
        status: scene.status || 'UNSHOT'
      });
    }
  }, [scene, isOpen]);

  if (!isOpen || !scene) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updates = {
        heading: formData.heading,
        location: formData.location,
        setting: formData.setting,
        timeOfDay: formData.timeOfDay,
        characters: formData.characters ? formData.characters.split(',').map(c => c.trim()).filter(Boolean) : [],
        summary: formData.summary,
        status: formData.status
      };

      await scriptApi.updateScene(scene.id, updates);
      showToast(`🎬 Scene #${scene.sceneNumber} breakdown updated!`, 'success');
      onSaveSuccess?.();
      onClose();
    } catch (err) {
      alert(`Failed to update scene: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl cinema-glass rounded-3xl border border-slate-700 shadow-2xl p-6 sm:p-8 space-y-6 z-10 animate-in zoom-in-95 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 font-['Outfit']">
                Edit Scene #{scene.sceneNumber}
              </h3>
              <p className="text-xs text-slate-400">Modify screenplay breakdown heading, location & cast</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-300">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Scene Slugline / Heading *</label>
            <input
              type="text"
              required
              value={formData.heading}
              onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
              placeholder="e.g. INT. COMMAND CENTER - NIGHT"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Location Name</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Command Center"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Setting Type</label>
              <select
                value={formData.setting}
                onChange={(e) => setFormData({ ...formData, setting: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
              >
                <option value="INT">INT (Interior)</option>
                <option value="EXT">EXT (Exterior)</option>
                <option value="INT/EXT">INT/EXT (Hybrid)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Time of Day</label>
              <select
                value={formData.timeOfDay}
                onChange={(e) => setFormData({ ...formData, timeOfDay: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
              >
                <option value="DAY">DAY</option>
                <option value="NIGHT">NIGHT</option>
                <option value="DAWN">DAWN</option>
                <option value="DUSK">DUSK</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Characters & Roles (Comma-separated)</label>
            <input
              type="text"
              value={formData.characters}
              onChange={(e) => setFormData({ ...formData, characters: e.target.value })}
              placeholder="e.g. Commander Vance, Elena Rostova, Marcus Vane"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Scene Synopsis & Dramatic Action</label>
            <textarea
              rows={3}
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="Describe dramatic beats, staging notes, and emotional subtext..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Production Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none font-semibold"
            >
              <option value="UNSHOT">UNSHOT (Pre-Production)</option>
              <option value="IN_REHEARSAL">IN REHEARSAL</option>
              <option value="COMPLETED">COMPLETED (Shot & Wrapped)</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Scene Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
