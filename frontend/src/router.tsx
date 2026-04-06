import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';
import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

function getRoleHome(role: UserRole): string {
    switch (role) {
        case 'admin':
            return '/admin';
        case 'customer':
            return '/customer';
        default:
            return '/dashboard';
    }
}

export function ProtectedRoute({ children, allowedRoles }: { children: ReactNode; allowedRoles?: UserRole[] }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to={getRoleHome(user.role)} replace />;
    }

    return <>{children}</>;
}

export function GuestRoute({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (user) {
        return <Navigate to={getRoleHome(user.role)} replace />;
    }

    return <>{children}</>;
}
