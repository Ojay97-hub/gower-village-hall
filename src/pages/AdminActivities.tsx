import { useState } from 'react';
import { Activity, Clock, Loader2, Check, X, Pencil } from 'lucide-react';
import { useEvents, type RegularActivity } from '../context/EventContext';

interface EditState {
  schedule: string;
  start_time: string;
  end_time: string;
}

function formatTime(t: string | null) {
  if (!t) return '—';
  return t.substring(0, 5);
}

function timeInputValue(t: string | null) {
  if (!t) return '';
  return t.substring(0, 5);
}

export function AdminActivities() {
  const { regularActivities, loading, updateRegularActivity } = useEvents();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({ schedule: '', start_time: '', end_time: '' });
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function startEdit(activity: RegularActivity) {
    setEditingId(activity.id);
    setEditState({
      schedule: activity.schedule ?? '',
      start_time: timeInputValue(activity.start_time),
      end_time: timeInputValue(activity.end_time),
    });
    setError(null);
    setSavedId(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setError(null);
  }

  async function saveEdit(id: string) {
    setSavingId(id);
    setError(null);
    try {
      await updateRegularActivity(id, {
        schedule: editState.schedule || null,
        start_time: editState.start_time ? `${editState.start_time}:00` : null,
        end_time: editState.end_time ? `${editState.end_time}:00` : null,
      });
      setEditingId(null);
      setSavedId(id);
      setTimeout(() => setSavedId(null), 2000);
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSavingId(null);
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-serif text-gray-900 mb-2">Regular Activities</h1>
          <p className="text-gray-500">
            Edit the schedule and times for recurring hall activities. Times determine which booking sessions are blocked on those days.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-100 rounded-xl px-4 py-2 shadow-sm whitespace-nowrap">
          <Activity className="w-4 h-4 text-primary-500" />
          {regularActivities.length} {regularActivities.length === 1 ? 'activity' : 'activities'}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-sm font-medium text-gray-500">
                <th className="p-4 pl-6">Activity</th>
                <th className="p-4">Schedule</th>
                <th className="p-4">Start Time</th>
                <th className="p-4">End Time</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {regularActivities.map(activity => {
                const isEditing = editingId === activity.id;
                const isSaving = savingId === activity.id;
                const justSaved = savedId === activity.id;

                return (
                  <tr key={activity.id} className={`transition-colors ${isEditing ? 'bg-primary-50/40' : 'hover:bg-gray-50/50'}`}>
                    {/* Activity name */}
                    <td className="p-4 pl-6">
                      <p className="font-semibold text-gray-900">{activity.title}</p>
                      {activity.description && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{activity.description}</p>
                      )}
                    </td>

                    {/* Schedule */}
                    <td className="p-4 min-w-[200px]">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editState.schedule}
                          onChange={e => setEditState(prev => ({ ...prev, schedule: e.target.value }))}
                          placeholder="e.g. First Saturday each month"
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
                        />
                      ) : (
                        <span className="text-sm text-gray-700">{activity.schedule ?? <span className="text-gray-300">—</span>}</span>
                      )}
                    </td>

                    {/* Start time */}
                    <td className="p-4 min-w-[130px]">
                      {isEditing ? (
                        <input
                          type="time"
                          value={editState.start_time}
                          onChange={e => setEditState(prev => ({ ...prev, start_time: e.target.value }))}
                          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
                        />
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 text-sm ${activity.start_time ? 'text-gray-700' : 'text-amber-500'}`}>
                          <Clock className="w-3.5 h-3.5" />
                          {activity.start_time ? formatTime(activity.start_time) : 'Not set'}
                        </span>
                      )}
                    </td>

                    {/* End time */}
                    <td className="p-4 min-w-[130px]">
                      {isEditing ? (
                        <input
                          type="time"
                          value={editState.end_time}
                          onChange={e => setEditState(prev => ({ ...prev, end_time: e.target.value }))}
                          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
                        />
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 text-sm ${activity.end_time ? 'text-gray-700' : 'text-amber-500'}`}>
                          <Clock className="w-3.5 h-3.5" />
                          {activity.end_time ? formatTime(activity.end_time) : 'Not set'}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 pr-6 text-right whitespace-nowrap">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => saveEdit(activity.id)}
                            disabled={isSaving}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
                          >
                            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={isSaving}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(activity)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ml-auto ${
                            justSaved
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                          }`}
                        >
                          {justSaved ? (
                            <><Check className="w-3.5 h-3.5" /> Saved</>
                          ) : (
                            <><Pencil className="w-3.5 h-3.5" /> Edit</>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        Start and end times control which booking sessions are blocked on days this activity runs. Activities without times block all sessions as a precaution.
      </p>
    </div>
  );
}
