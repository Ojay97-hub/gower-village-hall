import { useState, useEffect } from "react";
import { Plus, Trash2, Users, Search, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function AdminUsers() {
    const { adminUsersList, fetchAdminUsers, inviteAdminUser, removeAdminUser, user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [isInviting, setIsInviting] = useState(false);
    const [isRemoving, setIsRemoving] = useState<string | null>(null);
    const [inviteError, setInviteError] = useState<string | null>(null);
    const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetchAdminUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredUsers = adminUsersList.filter(u => 
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setInviteError(null);
        setInviteSuccess(null);
        if (!inviteEmail) return;

        setIsInviting(true);
        const { error } = await inviteAdminUser(inviteEmail);
        setIsInviting(false);

        if (error) {
            setInviteError(error.message || 'Failed to invite user.');
        } else {
            setInviteSuccess(`Successfully invited ${inviteEmail}`);
            setInviteEmail("");
        }
    };

    const handleRemove = async (id: string, email: string) => {
        if (window.confirm(`Are you sure you want to revoke admin access for ${email}?`)) {
            setIsRemoving(id);
            const { error } = await removeAdminUser(id);
            setIsRemoving(null);
            if (error) {
                alert(error.message || 'Failed to remove user.');
            }
        }
    };

    return (
        <div className="p-4 sm:p-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-gray-900 mb-2 flex items-center gap-3">
                        <Users className="w-8 h-8 text-primary-600" />
                        Admin Users
                    </h1>
                    <p className="text-gray-500">Manage administrator access to the hall dashboard.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Main List */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Controls */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search administrators..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Users List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100 text-sm font-medium text-gray-500">
                                        <th className="p-4 pl-6 font-medium">Administrator</th>
                                        <th className="p-4 font-medium">Granted On</th>
                                        <th className="p-4 pr-6 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="p-8 text-center text-gray-500">
                                                No users found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map(u => (
                                            <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="p-4 pl-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                                                            {(u.name || u.email).charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900 flex items-center gap-2">
                                                                {u.name || u.email}
                                                                {u.id === user?.id && (
                                                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] uppercase font-bold tracking-wider">
                                                                        You
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {u.name && (
                                                                <div className="text-sm text-gray-500">{u.email}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm text-gray-500">
                                                    {new Date(u.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 pr-6 text-right">
                                                    <button
                                                        onClick={() => handleRemove(u.id, u.email)}
                                                        disabled={u.id === user?.id || isRemoving === u.id}
                                                        className={`p-2 rounded-lg transition-colors ${
                                                            u.id === user?.id
                                                                ? 'text-gray-300 cursor-not-allowed'
                                                                : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                                        }`}
                                                        title={u.id === user?.id ? "Cannot remove yourself" : "Revoke Access"}
                                                    >
                                                        {isRemoving === u.id ? (
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar / Invite Form */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Invite Administrator</h2>
                        <p className="text-sm text-gray-500 mb-6">
                            Send an invitation email to grant a new user administrative access.
                        </p>
                        
                        <form onSubmit={handleInvite} className="space-y-4">
                            {inviteError && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                                    {inviteError}
                                </div>
                            )}
                            {inviteSuccess && (
                                <div className="p-3 bg-emerald-50 text-emerald-700 text-sm rounded-xl border border-emerald-100">
                                    {inviteSuccess}
                                </div>
                            )}
                            
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="admin@example.com"
                                    required
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                />
                            </div>
                            
                            <button
                                type="submit"
                                disabled={isInviting || !inviteEmail}
                                className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-xl hover:bg-primary-700 transition-colors shadow-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isInviting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4" />
                                        Send Invitation
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
}
