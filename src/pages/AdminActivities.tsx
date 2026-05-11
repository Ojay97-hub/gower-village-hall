import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Activity, Plus, Trash2, Edit2, AlertTriangle, X, Star, Loader2 } from 'lucide-react';
import { useEvents, type RegularActivity } from '../context/EventContext';
import { RegularActivityForm } from '../components/events/RegularActivityForm';

export function AdminActivities() {
  const { regularActivities, loading, deleteRegularActivity } = useEvents();

  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<RegularActivity | undefined>(undefined);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<RegularActivity | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleCreate() {
    setEditingActivity(undefined);
    setShowForm(true);
    setTimeout(() => {
      document.getElementById('activity-form-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  function handleEdit(activity: RegularActivity) {
    setEditingActivity(activity);
    setShowForm(true);
    setTimeout(() => {
      document.getElementById('activity-form-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  function handleClose() {
    setShowForm(false);
    setEditingActivity(undefined);
  }

  function handleDeleteClick(activity: RegularActivity) {
    setActivityToDelete(activity);
    setDeleteConfirmOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!activityToDelete) return;
    setIsDeleting(true);
    try {
      await deleteRegularActivity(activityToDelete.id);
      setDeleteConfirmOpen(false);
      setActivityToDelete(null);
    } catch (err: any) {
      alert(err?.message || 'Failed to delete activity.');
    } finally {
      setIsDeleting(false);
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
            Add, edit, and remove recurring hall activities. Times determine which booking sessions are blocked on those days.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-sm text-sm font-medium whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add Activity
          </button>
        </div>
      </div>

      {/* Activities table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {regularActivities.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No activities yet</p>
            <p className="text-sm mt-1">Click "Add Activity" to create your first one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-sm font-medium text-gray-500">
                  <th className="p-4 pl-6">Activity</th>
                  <th className="p-4">Schedule</th>
                  <th className="p-4">Start</th>
                  <th className="p-4">End</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {regularActivities.map(activity => (
                  <tr key={activity.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{activity.title}</p>
                        {activity.is_featured && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Star className="w-2.5 h-2.5" />
                            Featured
                          </span>
                        )}
                      </div>
                      {activity.description && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{activity.description}</p>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {activity.schedule ?? <span className="text-gray-300">—</span>}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {activity.start_time
                        ? activity.start_time.substring(0, 5)
                        : <span className="text-amber-500 text-xs">Not set</span>}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {activity.end_time
                        ? activity.end_time.substring(0, 5)
                        : <span className="text-amber-500 text-xs">Not set</span>}
                    </td>
                    <td className="p-4 pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(activity)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(activity)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-gray-400">
        Start and end times control which booking sessions are blocked on days this activity runs. Activities without times block all sessions as a precaution.
      </p>

      {/* Inline form */}
      {showForm && (
        <div id="activity-form-section" className="mt-10 bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <RegularActivityForm
            initialData={editingActivity}
            onSuccess={handleClose}
            onCancel={handleClose}
          />
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirmOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isDeleting && setDeleteConfirmOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-80 mx-auto border border-gray-200">
            <button
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={isDeleting}
              className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-base font-bold text-gray-900 mb-2">Delete Activity?</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Are you sure you want to delete{' '}
                <span className="font-semibold text-gray-900">"{activityToDelete?.title}"</span>?
                This cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors text-sm disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-60"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
