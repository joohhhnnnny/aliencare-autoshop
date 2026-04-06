import AdminLayout from '@/components/layout/admin-layout';
import { useAuth } from '@/context/AuthContext';
import { type BreadcrumbItem } from '@/types';
import { Shield, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: '/admin' },
];

export default function AdminDashboard() {
    const { user } = useAuth();

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back, {user?.name?.split(' ')[0] ?? 'Admin'}.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Link to="/admin/frontdesk-accounts" className="group rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-[#d4af37]/10 p-2.5">
                                <Users className="h-6 w-6 text-[#d4af37]" />
                            </div>
                            <div>
                                <h3 className="font-semibold group-hover:text-[#d4af37]">Front Desk Accounts</h3>
                                <p className="text-sm text-muted-foreground">Manage front desk staff accounts</p>
                            </div>
                        </div>
                    </Link>

                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-[#d4af37]/10 p-2.5">
                                <Shield className="h-6 w-6 text-[#d4af37]" />
                            </div>
                            <div>
                                <h3 className="font-semibold">System Status</h3>
                                <p className="text-sm text-muted-foreground">All systems operational</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
