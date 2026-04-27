import { useState } from "react";
import { Plus, Edit2, Trash2, Search, ExternalLink, Image as ImageIcon, Coffee } from "lucide-react";
import { Link } from "react-router-dom";
import { useCoffeeMorning, CoffeeMorningUpdate } from "../context/CoffeeMorningContext";
import { CoffeeMorningUpdateForm } from "../components/CoffeeMorningUpdateForm";

export function AdminCoffeeMorning() {
    const { updates, loading, error, createUpdate, updateUpdate, deleteUpdate, uploadHeroImage } = useCoffeeMorning();
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<"All" | "Published" | "Draft">("All");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingUpdate, setEditingUpdate] = useState<CoffeeMorningUpdate | undefined>(undefined);

    const filtered = updates.filter(u => {
        const matchesSearch =
            u.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.fundraising_for ?? "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
            filterStatus === "All" ? true :
            filterStatus === "Published" ? u.published : !u.published;
        return matchesSearch && matchesStatus;
    });

    const handleOpenForm = (u?: CoffeeMorningUpdate) => {
        setEditingUpdate(u);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingUpdate(undefined);
    };

    const handleSubmitForm = async (
        values: Omit<CoffeeMorningUpdate, "id" | "created_at" | "updated_at" | "created_by" | "updated_by">,
        newImageFile: File | null
    ) => {
        let imageUrl = values.hero_image_url;
        if (newImageFile) {
            imageUrl = await uploadHeroImage(newImageFile);
        }

        const dataToSave = { ...values, hero_image_url: imageUrl };

        if (editingUpdate) {
            await updateUpdate(editingUpdate.id, dataToSave);
        } else {
            await createUpdate(dataToSave);
        }

        handleCloseForm();
    };

    const handleDelete = async (u: CoffeeMorningUpdate) => {
        if (window.confirm(`Are you sure you want to delete "${u.title}"? This cannot be undone.`)) {
            await deleteUpdate(u.id, u.hero_image_url);
        }
    };

    if (loading && updates.length === 0) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 max-w-4xl mx-auto mt-10 bg-red-50 text-red-600 rounded-2xl border border-red-200">
                <h2 className="text-xl font-bold mb-2">Error Loading Updates</h2>
                <p>{error.message}</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-gray-900 mb-2">Coffee Morning Updates</h1>
                    <p className="text-gray-500">Share what each coffee morning is raising money for and how it went.</p>
                </div>
                <button
                    onClick={() => handleOpenForm()}
                    className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors shadow-sm font-medium"
                >
                    <Plus className="w-5 h-5" />
                    New Update
                </button>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search updates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    />
                </div>
                <div className="flex items-center gap-2">
                    {(["All", "Published", "Draft"] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filterStatus === status ? "bg-primary-100 text-primary-800" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Coffee className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No updates found</h3>
                    <p className="text-gray-500">Try adjusting your filters, or create your first update.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100 text-sm font-medium text-gray-500">
                                    <th className="p-4 pl-6 font-medium">Update</th>
                                    <th className="p-4 font-medium w-1/5">Fundraising</th>
                                    <th className="p-4 font-medium w-1/5">Date / Status</th>
                                    <th className="p-4 pr-6 font-medium text-right w-1/6">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="p-4 pl-6">
                                            <div className="flex items-start gap-4">
                                                <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-200">
                                                    {u.hero_image_url ? (
                                                        <img src={u.hero_image_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon className="w-5 h-5 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 mb-0.5 line-clamp-1">{u.title}</p>
                                                    <p className="text-xs text-gray-500 font-mono">/{u.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm">
                                            {u.fundraising_for ? (
                                                <div>
                                                    <p className="font-medium text-gray-900">{u.fundraising_for}</p>
                                                    {u.amount_raised != null && (
                                                        <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                                                            £{Number(u.amount_raised).toFixed(2)} raised
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">
                                            <div>{u.event_date ? new Date(u.event_date).toLocaleDateString('en-GB') : '—'}</div>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <span className={`w-2 h-2 rounded-full ${u.published ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                <span className="text-xs font-medium text-gray-600">
                                                    {u.published ? 'Published' : 'Draft'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 pr-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    to={`/hall/coffee-morning/${u.slug}`}
                                                    target="_blank"
                                                    title="View Update"
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleOpenForm(u)}
                                                    title="Edit Update"
                                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(u)}
                                                    title="Delete Update"
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                </div>
            )}

            {isFormOpen && (
                <CoffeeMorningUpdateForm
                    update={editingUpdate}
                    onSubmit={handleSubmitForm}
                    onClose={handleCloseForm}
                />
            )}
        </div>
    );
}
