import CustomerLayout from '@/components/layout/customer-layout';
import { useAuth } from '@/context/AuthContext';
import { type BreadcrumbItem } from '@/types';
import { Camera, Car, Mail, Phone, Shield, User } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/customer' },
    { title: 'Profile', href: '/customer/profile' },
];

export default function CustomerProfile() {
    const { user } = useAuth();

    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Account Profile</h1>
                    <p className="text-muted-foreground">Manage your personal information and account settings.</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="rounded-xl border bg-card p-6 shadow-sm">
                            <div className="flex flex-col items-center text-center">
                                <div className="relative">
                                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#d4af37]/20">
                                        <User className="h-12 w-12 text-[#d4af37]" />
                                    </div>
                                    <button className="absolute right-0 bottom-0 rounded-full border bg-background p-1.5 shadow-sm hover:bg-accent">
                                        <Camera className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                                <h2 className="mt-4 text-lg font-semibold">{user?.name ?? 'Customer'}</h2>
                                <p className="text-sm text-muted-foreground">{user?.email}</p>
                                <span className="mt-2 inline-flex items-center rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-500">
                                    <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500" />
                                    Active
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-col gap-6 lg:col-span-2">
                        {/* Personal Information */}
                        <div className="rounded-xl border bg-card p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold">Personal Information</h2>
                                <button className="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent">
                                    Edit
                                </button>
                            </div>
                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <User className="h-4 w-4" /> Full Name
                                    </label>
                                    <p className="font-medium">{user?.name ?? '—'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="h-4 w-4" /> Email Address
                                    </label>
                                    <p className="font-medium">{user?.email ?? '—'}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Phone className="h-4 w-4" /> Phone Number
                                    </label>
                                    <p className="font-medium">09175550101</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Shield className="h-4 w-4" /> License Number
                                    </label>
                                    <p className="font-medium">N01-23-4567890</p>
                                </div>
                            </div>
                        </div>

                        {/* Account Details */}
                        <div className="rounded-xl border bg-card p-6 shadow-sm">
                            <h2 className="text-lg font-semibold">Account Details</h2>
                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-sm text-muted-foreground">Account Status</label>
                                    <p>
                                        <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-500">
                                            Approved
                                        </span>
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm text-muted-foreground">Member Since</label>
                                    <p className="font-medium">
                                        {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Vehicles */}
                        <div className="rounded-xl border bg-card p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold">My Vehicles</h2>
                                <button className="rounded-lg bg-[#d4af37] px-3 py-1.5 text-sm font-semibold text-black transition-colors hover:bg-[#e6c24e]">
                                    Add Vehicle
                                </button>
                            </div>
                            <div className="mt-4 space-y-3">
                                <div className="flex items-center gap-4 rounded-lg border p-4">
                                    <div className="rounded-lg bg-[#d4af37]/10 p-2.5">
                                        <Car className="h-5 w-5 text-[#d4af37]" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">Toyota Vios 2022</p>
                                        <p className="text-sm text-muted-foreground">Silver &bull; ACR 2026</p>
                                    </div>
                                    <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-500">
                                        Approved
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
