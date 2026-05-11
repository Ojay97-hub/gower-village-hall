import { useState, useEffect } from "react";
import { Plus, Trash2, Users, Search, Loader2, AlertTriangle, X, Pencil, ShieldCheck, ShieldPlus, ShieldMinus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ADMIN_ROLES, ROLE_COLORS } from "../lib/adminRoles";

// ─── Role badge ──────────────────────────────────────────────────────────────

function RoleBadge({ roleId }: { roleId: string }) {
    const role = ADMIN_ROLES.find(r => r.id === roleId);
    if (!role) return null;
    const colors = ROLE_COLORS[role.color] ?? ROLE_COLORS['blue'];
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${colors.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
            {role.label}
        </span>
    );
}

// ─── Edit Roles Modal ─────────────────────────────────────────────────────────

function EditRolesModal({
    target,
    isLockedMasterAdminTarget,
    isSaving,
    onSave,
    onCancel,
}: {
    target: { id: string; email: string; name: string; roles: string[]; isMasterAdmin: boolean };
    isLockedMasterAdminTarget: boolean;
    isSaving: boolean;
    onSave: (payload: { roles: string[]; isMasterAdmin: boolean }) => void;
    onCancel: () => void;
}) {
    const [selected, setSelected] = useState<string[]>(target.roles);
    const [isMasterAdminSelected, setIsMasterAdminSelected] = useState(target.isMasterAdmin);

    const toggle = (roleId: string) => {
        setSelected(prev =>
            prev.includes(roleId) ? prev.filter(r => r !== roleId) : [...prev, roleId]
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={!isSaving ? onCancel : undefined}
            />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-4">
                <button
                    onClick={onCancel}
                    disabled={isSaving}
                    className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
                >
                    <X className="w-5 h-5" />
                </button>

                <div>
                    <h2 className="text-base font-bold text-gray-900">Edit Roles</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{target.name || target.email}</p>
                </div>

                {isLockedMasterAdminTarget && (
                    <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-100 rounded-xl text-sm text-purple-700">
                        <ShieldCheck className="w-5 h-5 shrink-0" />
                        This user is listed as a protected Master Admin and always has full access regardless of role assignments.
                    </div>
                )}

                <div className="space-y-2">
                    <label
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                            isMasterAdminSelected
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        } ${isLockedMasterAdminTarget ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                    >
                        <input
                            type="checkbox"
                            checked={isMasterAdminSelected}
                            disabled={isLockedMasterAdminTarget}
                            onChange={() => setIsMasterAdminSelected(prev => !prev)}
                            className="mt-0.5 rounded"
                        />
                        <div>
                            <div className="font-medium text-sm">Master Admin</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                                Full access to all management areas, the complete admin session menu, and user administration.
                            </div>
                        </div>
                    </label>

                    {ADMIN_ROLES.map(role => {
                        const checked = selected.includes(role.id);
                        const colors = ROLE_COLORS[role.color] ?? ROLE_COLORS['blue'];
                        return (
                            <label
                                key={role.id}
                                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                                    checked
                                        ? `${colors.badge} border-current`
                                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggle(role.id)}
                                    className="mt-0.5 rounded"
                                />
                                <div>
                                    <div className="font-medium text-sm">{role.label}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">{role.description}</div>
                                </div>
                            </label>
                        );
                    })}
                </div>

                <div className="flex gap-3 justify-end mt-2">
                    <button
                        onClick={onCancel}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-40"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave({ roles: selected, isMasterAdmin: isMasterAdminSelected })}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors disabled:opacity-60"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save Roles'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Confirm Remove Modal ────────────────────────────────────────────────────

function ConfirmRemoveModal({
    email,
    isRemoving,
    onConfirm,
    onCancel,
}: {
    email: string;
    isRemoving: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={!isRemoving ? onCancel : undefined}
            />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-4">
                <button
                    onClick={onCancel}
                    disabled={isRemoving}
                    className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-gray-900">Revoke admin access</h2>
                        <p className="text-sm text-gray-500">This action cannot be undone.</p>
                    </div>
                </div>

                <p className="text-sm text-gray-600">
                    Are you sure you want to remove admin access for{" "}
                    <span className="font-semibold text-gray-900">{email}</span>?
                    They will be signed out and unable to access the dashboard.
                </p>

                <div className="flex gap-3 justify-end mt-2">
                    <button
                        onClick={onCancel}
                        disabled={isRemoving}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-40"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isRemoving}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-60"
                    >
                        {isRemoving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Removing...
                            </>
                        ) : (
                            'Revoke Access'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Generic Confirm Action Modal ────────────────────────────────────────────

function ConfirmActionModal({
    title,
    icon,
    iconBg,
    message,
    confirmLabel,
    confirmClass,
    isLoading,
    loadingLabel,
    onConfirm,
    onCancel,
}: {
    title: string;
    icon: React.ReactNode;
    iconBg: string;
    message: React.ReactNode;
    confirmLabel: string;
    confirmClass: string;
    isLoading: boolean;
    loadingLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={!isLoading ? onCancel : undefined}
            />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-4">
                <button
                    onClick={onCancel}
                    disabled={isLoading}
                    className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3">
                    <div className={`shrink-0 w-10 h-10 rounded-full ${iconBg} flex items-center justify-center`}>
                        {icon}
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-gray-900">{title}</h2>
                    </div>
                </div>

                <p className="text-sm text-gray-600">{message}</p>

                <div className="flex gap-3 justify-end mt-2">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-40"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors disabled:opacity-60 ${confirmClass}`}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {loadingLabel}
                            </>
                        ) : (
                            confirmLabel
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function AdminUsers() {
    const {
        adminUsersList,
        fetchAdminUsers,
        inviteAdminUser,
        removeAdminUser,
        updateAdminUserRoles,
        promoteMasterAdmin,
        demoteMasterAdmin,
        isMasterAdminEmail,
        user,
    } = useAuth();

    const [searchQuery, setSearchQuery] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [isInviting, setIsInviting] = useState(false);
    const [inviteError, setInviteError] = useState<string | null>(null);
    const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

    const [confirmRemove, setConfirmRemove] = useState<{ id: string; email: string } | null>(null);
    const [isRemoving, setIsRemoving] = useState(false);

    const [editRoles, setEditRoles] = useState<{ id: string; email: string; name: string; roles: string[]; isMasterAdmin: boolean } | null>(null);
    const [isSavingRoles, setIsSavingRoles] = useState(false);

    const [confirmPromote, setConfirmPromote] = useState<{ id: string; email: string; name: string } | null>(null);
    const [isPromoting, setIsPromoting] = useState(false);
    const [confirmDemote, setConfirmDemote] = useState<{ id: string; email: string; name: string } | null>(null);
    const [isDemoting, setIsDemoting] = useState(false);

    useEffect(() => {
        fetchAdminUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredUsers = adminUsersList.filter(u =>
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleConfirmPromote = async () => {
        if (!confirmPromote) return;
        setIsPromoting(true);
        const { error } = await promoteMasterAdmin(confirmPromote.id);
        setIsPromoting(false);
        if (error) alert(error.message || 'Failed to promote user.');
        setConfirmPromote(null);
    };

    const handleConfirmDemote = async () => {
        if (!confirmDemote) return;
        setIsDemoting(true);
        const { error } = await demoteMasterAdmin(confirmDemote.id);
        setIsDemoting(false);
        if (error) alert(error.message || 'Failed to demote user.');
        setConfirmDemote(null);
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setInviteError(null);
        setInviteSuccess(null);
        if (!inviteEmail) return;

        setIsInviting(true);
        const { error, existingUser } = await inviteAdminUser(inviteEmail);
        setIsInviting(false);

        if (error) {
            setInviteError(error.message || 'Failed to invite user.');
        } else if (existingUser) {
            setInviteSuccess(`${inviteEmail} already has an account and has been granted admin access. They can log in directly.`);
            setInviteEmail("");
        } else {
            setInviteSuccess(`Invitation email sent to ${inviteEmail}. They'll receive a link to set up their password.`);
            setInviteEmail("");
        }
    };

    const handleConfirmRemove = async () => {
        if (!confirmRemove) return;
        setIsRemoving(true);
        const { error } = await removeAdminUser(confirmRemove.id);
        setIsRemoving(false);
        if (error) alert(error.message || 'Failed to remove user.');
        setConfirmRemove(null);
    };

    const handleSaveRoles = async ({ roles, isMasterAdmin }: { roles: string[]; isMasterAdmin: boolean }) => {
        if (!editRoles) return;
        setIsSavingRoles(true);
        const { error: rolesError } = await updateAdminUserRoles(editRoles.id, roles);
        if (rolesError) {
            setIsSavingRoles(false);
            alert(rolesError.message || 'Failed to update roles.');
            return;
        }

        let privilegeError: Error | null = null;
        if (!isMasterAdminEmail(editRoles.email) && editRoles.isMasterAdmin !== isMasterAdmin) {
            const result = isMasterAdmin
                ? await promoteMasterAdmin(editRoles.id)
                : await demoteMasterAdmin(editRoles.id);
            privilegeError = result.error;
        }

        setIsSavingRoles(false);
        if (privilegeError) {
            alert(privilegeError.message || 'Failed to update admin access.');
            return;
        }
        setEditRoles(null);
    };

    return (
        <>
            {confirmRemove && (
                <ConfirmRemoveModal
                    email={confirmRemove.email}
                    isRemoving={isRemoving}
                    onConfirm={handleConfirmRemove}
                    onCancel={() => !isRemoving && setConfirmRemove(null)}
                />
            )}
            {editRoles && (
                <EditRolesModal
                    target={editRoles}
                    isLockedMasterAdminTarget={isMasterAdminEmail(editRoles.email)}
                    isSaving={isSavingRoles}
                    onSave={handleSaveRoles}
                    onCancel={() => !isSavingRoles && setEditRoles(null)}
                />
            )}
            {confirmPromote && (
                <ConfirmActionModal
                    title="Promote to Master Admin"
                    icon={<ShieldPlus className="w-5 h-5 text-purple-600" />}
                    iconBg="bg-purple-100"
                    message={
                        <>
                            Grant <span className="font-semibold text-gray-900">{confirmPromote.name || confirmPromote.email}</span> full Master Admin access? They will be able to manage all administrators and sections.
                        </>
                    }
                    confirmLabel="Promote"
                    confirmClass="bg-purple-600 hover:bg-purple-700"
                    isLoading={isPromoting}
                    loadingLabel="Promoting..."
                    onConfirm={handleConfirmPromote}
                    onCancel={() => !isPromoting && setConfirmPromote(null)}
                />
            )}
            {confirmDemote && (
                <ConfirmActionModal
                    title="Remove Master Admin"
                    icon={<ShieldMinus className="w-5 h-5 text-amber-600" />}
                    iconBg="bg-amber-100"
                    message={
                        <>
                            Remove Master Admin access from <span className="font-semibold text-gray-900">{confirmDemote.name || confirmDemote.email}</span>? They will revert to a regular administrator with their existing roles.
                        </>
                    }
                    confirmLabel="Remove Master Admin"
                    confirmClass="bg-amber-600 hover:bg-amber-700"
                    isLoading={isDemoting}
                    loadingLabel="Removing..."
                    onConfirm={handleConfirmDemote}
                    onCancel={() => !isDemoting && setConfirmDemote(null)}
                />
            )}

            <div className="p-4 sm:p-8 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold font-serif text-gray-900 mb-2 flex items-center gap-3">
                            <Users className="w-8 h-8 text-primary-600" />
                            Admin Users
                        </h1>
                        <p className="text-gray-500">Manage administrator access and permissions.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main List */}
                    <div className="lg:col-span-2 space-y-6">
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

                        {/* Master Admins Table */}
                        {(() => {
                            const masterAdmins = filteredUsers.filter(u => u.is_master_admin || isMasterAdminEmail(u.email));
                            if (masterAdmins.length === 0) return null;
                            return (
                                <div>
                                    <div className="flex items-center gap-2 mb-2 px-1">
                                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                                        <h2 className="text-sm font-semibold text-purple-700 uppercase tracking-wider">Master Admins</h2>
                                    </div>
                                    <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-purple-50/60 border-b border-purple-100 text-sm font-medium text-purple-500">
                                                        <th className="p-4 pl-6 font-medium">Administrator</th>
                                                        <th className="p-4 font-medium">Granted On</th>
                                                        <th className="p-4 pr-6 font-medium text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-purple-50">
                                                    {masterAdmins.map(u => {
                                                        const isHardcoded = isMasterAdminEmail(u.email);
                                                        return (
                                                            <tr key={u.id} className="hover:bg-purple-50/40 transition-colors">
                                                                <td className="p-4 pl-6">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">
                                                                            {(u.name || u.email).charAt(0).toUpperCase()}
                                                                        </div>
                                                                        <div>
                                                                            <div className="font-medium text-gray-900 flex items-center gap-2 flex-wrap">
                                                                                {u.name || u.email}
                                                                                {u.id === user?.id && (
                                                                                    <span className="px-2 py-0.5 bg-purple-100 text-purple-600 rounded text-[10px] uppercase font-bold tracking-wider">
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
                                                                <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                                                                    {new Date(u.created_at).toLocaleDateString()}
                                                                </td>
                                                                <td className="p-4 pr-6 text-right">
                                                                    <div className="flex items-center justify-end gap-1">
                                                                        {!isHardcoded && u.id !== user?.id && (
                                                                            <button
                                                                                onClick={() => setConfirmDemote({ id: u.id, email: u.email, name: u.name })}
                                                                                className="p-2 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                                                                title="Remove Master Admin"
                                                                            >
                                                                                <ShieldMinus className="w-4 h-4" />
                                                                            </button>
                                                                        )}
                                                                        <button
                                                                            onClick={() => setConfirmRemove({ id: u.id, email: u.email })}
                                                                            disabled={u.id === user?.id}
                                                                            className={`p-2 rounded-lg transition-colors ${
                                                                                u.id === user?.id
                                                                                    ? 'text-gray-300 cursor-not-allowed'
                                                                                    : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                                                            }`}
                                                                            title={u.id === user?.id ? "Cannot remove yourself" : "Revoke Access"}
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Regular Admins Table */}
                        {(() => {
                            const regularAdmins = filteredUsers.filter(u => !u.is_master_admin && !isMasterAdminEmail(u.email));
                            return (
                                <div>
                                    <div className="flex items-center gap-2 mb-2 px-1">
                                        <Users className="w-4 h-4 text-gray-500" />
                                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Administrators</h2>
                                    </div>
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-gray-50/50 border-b border-gray-100 text-sm font-medium text-gray-500">
                                                        <th className="p-4 pl-6 font-medium">Administrator</th>
                                                        <th className="p-4 font-medium">Roles</th>
                                                        <th className="p-4 font-medium">Granted On</th>
                                                        <th className="p-4 pr-6 font-medium text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {regularAdmins.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={4} className="p-8 text-center text-gray-400 text-sm">
                                                                {searchQuery ? 'No matching administrators found.' : 'No administrators yet.'}
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        regularAdmins.map(u => (
                                                            <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                                                <td className="p-4 pl-6">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold shrink-0">
                                                                            {(u.name || u.email).charAt(0).toUpperCase()}
                                                                        </div>
                                                                        <div>
                                                                            <div className="font-medium text-gray-900 flex items-center gap-2 flex-wrap">
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
                                                                <td className="p-4">
                                                                    {u.roles.length > 0 ? (
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {u.roles.map(r => (
                                                                                <RoleBadge key={r} roleId={r} />
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-xs text-gray-400 italic">No roles assigned</span>
                                                                    )}
                                                                </td>
                                                                <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                                                                    {new Date(u.created_at).toLocaleDateString()}
                                                                </td>
                                                                <td className="p-4 pr-6 text-right">
                                                                    <div className="flex items-center justify-end gap-1">
                                                                        <button
                                                                            onClick={() => setConfirmPromote({ id: u.id, email: u.email, name: u.name })}
                                                                            className="p-2 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                                                                            title="Promote to Master Admin"
                                                                        >
                                                                            <ShieldPlus className="w-4 h-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setEditRoles({ id: u.id, email: u.email, name: u.name, roles: u.roles, isMasterAdmin: u.is_master_admin || isMasterAdminEmail(u.email) })}
                                                                            className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                                                                            title="Edit Roles"
                                                                        >
                                                                            <Pencil className="w-4 h-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setConfirmRemove({ id: u.id, email: u.email })}
                                                                            disabled={u.id === user?.id}
                                                                            className={`p-2 rounded-lg transition-colors ${
                                                                                u.id === user?.id
                                                                                    ? 'text-gray-300 cursor-not-allowed'
                                                                                    : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                                                            }`}
                                                                            title={u.id === user?.id ? "Cannot remove yourself" : "Revoke Access"}
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Invite Form */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-1">Invite Administrator</h2>
                            <p className="text-sm text-gray-500 mb-5">
                                Send an invitation email to grant a new user administrative access. Assign their roles after they join.
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

                        {/* Roles Reference */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-sm font-bold text-gray-900 mb-3">Available Roles</h2>
                            <div className="space-y-3">
                                {ADMIN_ROLES.map(role => {
                                    const colors = ROLE_COLORS[role.color] ?? ROLE_COLORS['blue'];
                                    return (
                                        <div key={role.id} className="flex items-start gap-2">
                                            <span className={`mt-1 inline-block w-2 h-2 rounded-full shrink-0 ${colors.dot}`} />
                                            <div>
                                                <div className="text-sm font-medium text-gray-800">{role.label}</div>
                                                <div className="text-xs text-gray-500">{role.description}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex items-start gap-2">
                                    <span className="mt-1 inline-block w-2 h-2 rounded-full shrink-0 bg-purple-500" />
                                    <div>
                                        <div className="text-sm font-medium text-gray-800">Master Admin</div>
                                        <div className="text-xs text-gray-500">
                                            Full access to all management areas, including user administration and the complete admin session menu.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}
