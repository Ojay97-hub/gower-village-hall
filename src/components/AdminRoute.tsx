import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function AdminRoute() {
    const { isAdmin, isLoading } = useAuth();

    // Show loading skeleton while session is being restored
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-full max-w-4xl mx-auto p-8 space-y-6 animate-pulse">
                    {/* Skeleton header */}
                    <div className="h-8 bg-gray-200 rounded-lg w-1/3" />
                    {/* Skeleton content blocks */}
                    <div className="space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-full" />
                        <div className="h-4 bg-gray-200 rounded w-5/6" />
                        <div className="h-4 bg-gray-200 rounded w-4/6" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <div className="h-32 bg-gray-200 rounded-xl" />
                        <div className="h-32 bg-gray-200 rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAdmin) {
        return <Navigate to="/admin/login" replace />;
    }

    return <Outlet />;
}
