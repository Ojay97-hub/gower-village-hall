import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, UserRoundCog, ChevronDown, ChevronUp, Shield, BookOpen, Users, CalendarDays, UsersRound, Coffee, Landmark, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AdminToolbar() {
    const { isAdmin, isMasterAdmin, hasRole, userEmail, switchUser, adminLogout } = useAuth();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (isAdmin) {
            setMounted(true);
        }
    }, [isAdmin]);

    if (!isAdmin) return null;

    const adminActions = [
        isMasterAdmin ? {
            key: 'users',
            label: 'Manage Users',
            title: 'Manage Users',
            to: '/admin/users',
            icon: Users,
            className: 'bg-purple-50 border border-purple-100 hover:bg-purple-100 text-purple-700',
        } : null,
        hasRole('blog') ? {
            key: 'blog',
            label: 'Manage Blog',
            title: 'Manage Blog',
            to: '/admin/blog',
            icon: BookOpen,
            className: 'bg-primary-600 border border-primary-700 hover:bg-primary-700 text-white',
        } : null,
        hasRole('blog') ? {
            key: 'events',
            label: 'Manage Events',
            title: 'Manage Events',
            to: '/hall/events',
            icon: Calendar,
            className: 'bg-primary-600 border border-primary-700 hover:bg-primary-700 text-white',
        } : null,
        hasRole('bookings') ? {
            key: 'bookings',
            label: 'Manage Bookings',
            title: 'Manage Bookings',
            to: '/admin/bookings',
            icon: CalendarDays,
            className: 'bg-primary-600 border border-primary-700 hover:bg-primary-700 text-white',
        } : null,
        hasRole('committee') ? {
            key: 'committee',
            label: 'Manage Committee',
            title: 'Manage Committee',
            to: '/admin/committee',
            icon: UsersRound,
            className: 'bg-primary-600 border border-primary-700 hover:bg-primary-700 text-white',
        } : null,
        hasRole('coffee_mornings') ? {
            key: 'coffee-morning',
            label: 'Manage Coffee Morning',
            title: 'Manage Coffee Morning',
            to: '/admin/coffee-morning',
            icon: Coffee,
            className: 'bg-primary-600 border border-primary-700 hover:bg-primary-700 text-white',
        } : null,
        hasRole('churches') ? {
            key: 'churches',
            label: 'Manage Churches',
            title: 'Manage Churches',
            to: '/churches',
            icon: Landmark,
            className: 'bg-primary-600 border border-primary-700 hover:bg-primary-700 text-white',
        } : null,
    ].filter(Boolean);

    return (
        <div
            className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ease-out ${mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
                }`}
        >
            <div className="bg-white/80 backdrop-blur-md text-gray-800 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-primary-200 overflow-hidden w-64">
                {/* Header / Toggle Bar */}
                <button
                    onClick={() => setCollapsed((prev) => !prev)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-primary-50/50 transition-colors cursor-pointer"
                >
                    <div className="flex items-center gap-2">
                        <div className="bg-primary-100 p-1.5 rounded-full flex items-center justify-center">
                            <Shield className="h-3.5 w-3.5 text-primary-600" />
                        </div>
                        <span className="text-sm font-bold text-gray-800 tracking-wide">
                            Admin Session
                        </span>
                    </div>
                    {collapsed ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                </button>

                {/* Expandable Content */}
                <div
                    className="transition-all duration-300 ease-in-out overflow-hidden"
                    style={{
                        maxHeight: collapsed ? '0px' : '400px',
                        opacity: collapsed ? 0 : 1,
                    }}
                >
                    <div className="overflow-y-auto max-h-[360px] px-4 pb-4 pt-1 space-y-4">
                        {/* User Email */}
                        {userEmail && (
                            <div className="flex items-center justify-center border-t border-primary-100 pt-3">
                                <p
                                    className="text-xs font-medium text-gray-500 truncate bg-primary-50 px-3 py-1 rounded-full border border-primary-100/50"
                                    title={userEmail}
                                >
                                    {userEmail}
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2">
                            {adminActions.map((action) => {
                                const Icon = action.icon;

                                return (
                                    <button
                                        key={action.key}
                                        onClick={() => navigate(action.to)}
                                        className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer shadow-sm ${action.className}`}
                                        title={action.title}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {action.label}
                                    </button>
                                );
                            })}
                            <button
                                onClick={switchUser}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-xl bg-white border border-primary-200 hover:bg-primary-50 hover:border-primary-300 text-gray-700 transition-all cursor-pointer shadow-sm"
                                title="Switch User"
                            >
                                <UserRoundCog className="h-4 w-4 text-primary-600" />
                                Switch User
                            </button>
                            <button
                                onClick={adminLogout}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-xl bg-red-50 border border-red-100 hover:bg-red-100 text-red-600 transition-all cursor-pointer shadow-sm"
                                title="Logout from Admin"
                            >
                                <LogOut className="h-4 w-4" />
                                End Session
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
