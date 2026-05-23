import { RoleAvatar } from '@/components/shared/role-avatar';
import InputError from '@/components/shared/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/context/AuthContext';
import { useCustomerProfile } from '@/hooks/useCustomerProfile';
import { flattenValidationErrors } from '@/lib/validation-errors';
import { ApiError } from '@/services/api';
import { authService } from '@/services/authService';
import { customerService } from '@/services/customerService';
import type { JobOrder, Vehicle } from '@/types/customer';
import { CalendarDays, Car, Eye, EyeOff, FileText, History, Loader2, Mail, MapPin, Phone, SquarePen, X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { AddVehicleModal } from './add-vehicle-modal';
import { type EditField, ProfileEditModal } from './profile-edit-modal';

interface UserProfileContentProps {
    showTitle?: boolean;
    subtitle?: string;
}

export function UserProfileContent({ showTitle = true, subtitle }: UserProfileContentProps) {
    const { user, refreshUser } = useAuth();
    const { success, error } = useToast();

    const isCustomer = user?.role === 'customer';
    const isFrontdesk = user?.role === 'frontdesk';
    const isAdmin = user?.role === 'admin';

    const { customer, loading, refetch } = useCustomerProfile(isCustomer);

    const [personalEditOpen, setPersonalEditOpen] = useState(false);
    const [specialEditOpen, setSpecialEditOpen] = useState(false);
    const [vehicleEditTarget, setVehicleEditTarget] = useState<Vehicle | null>(null);
    const [addVehicleOpen, setAddVehicleOpen] = useState(false);
    const [serviceHistoryVehicle, setServiceHistoryVehicle] = useState<Vehicle | null>(null);
    const [serviceHistoryOrders, setServiceHistoryOrders] = useState<JobOrder[]>([]);
    const [serviceHistoryLoading, setServiceHistoryLoading] = useState(false);
    const [serviceHistoryError, setServiceHistoryError] = useState<string | null>(null);

    const [nonCustomerSection, setNonCustomerSection] = useState<'personal' | 'account' | 'special' | null>(null);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
    const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
    const [passwordFormError, setPasswordFormError] = useState<string | null>(null);
    const [passwordProcessing, setPasswordProcessing] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const roleLabel = isCustomer ? 'Customer' : isFrontdesk ? 'Front Desk' : 'Admin';

    const memberSince = user?.created_at
        ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : '—';

    const normalizeOptionalText = (value: string | undefined): string | null => {
        const normalized = value?.trim();
        return normalized ? normalized : null;
    };

    const handleFrontdeskProfileUpdate = async (partial: {
        name?: string;
        email?: string;
        phone_number?: string | null;
        address?: string | null;
    }) => {
        if (!user) return;

        const currentPhone = typeof user.phone_number === 'string' ? user.phone_number : null;
        const currentAddress = typeof user.address === 'string' ? user.address : null;

        await authService.updateProfile({
            name: partial.name ?? user.name,
            email: partial.email ?? user.email,
            phone_number: Object.prototype.hasOwnProperty.call(partial, 'phone_number') ? partial.phone_number : currentPhone,
            address: Object.prototype.hasOwnProperty.call(partial, 'address') ? partial.address : currentAddress,
        });

        await refreshUser();
    };

    const handleFrontdeskPersonalSave = async (values: Record<string, string>) => {
        try {
            await handleFrontdeskProfileUpdate({
                phone_number: normalizeOptionalText(values.phone),
                address: normalizeOptionalText(values.address),
            });
            success('Personal information updated.');
        } catch (err) {
            error(err instanceof Error ? err.message : 'Failed to update personal information.');
            throw err;
        }
    };

    const handleFrontdeskAccountSave = async (values: Record<string, string>) => {
        try {
            await handleFrontdeskProfileUpdate({
                name: values.name?.trim() ?? '',
                email: values.email?.trim() ?? '',
            });
            success('Account details updated.');
        } catch (err) {
            error(err instanceof Error ? err.message : 'Failed to update account details.');
            throw err;
        }
    };

    // ── Customer: Personal Information save ──────────────────────────────────
    const handlePersonalSave = async (values: Record<string, string>) => {
        if (!customer) return;
        try {
            await customerService.updatePersonalInfo(customer.id, {
                phone_number: values.phone || undefined,
                address: values.address || undefined,
            });
            await refetch();
            success('Personal information updated.');
        } catch (err) {
            error(err instanceof Error ? err.message : 'Failed to update personal information.');
            throw err;
        }
    };

    // ── Customer: Vehicle edit save ──────────────────────────────────────────
    const handleVehicleSave = async (values: Record<string, string>) => {
        if (!vehicleEditTarget) return;
        try {
            await customerService.updateVehicle(vehicleEditTarget.id, {
                make: values.make || undefined,
                model: values.model || undefined,
                year: values.year ? parseInt(values.year, 10) : undefined,
                plate_number: values.plate_number || undefined,
                color: values.color || undefined,
            });
            await refetch();
            success('Vehicle details updated.');
        } catch (err) {
            error(err instanceof Error ? err.message : 'Failed to update vehicle details.');
            throw err;
        }
    };

    // ── Customer: Special Information save ─────────────────────────────────
    const handleSpecialSave = async (values: Record<string, string>) => {
        if (!customer) return;
        try {
            const preferredContact = values.preferred_contact_method?.trim().toLowerCase();
            if (!preferredContact || !['sms', 'call', 'email'].includes(preferredContact)) {
                throw new Error('Preferred contact must be one of: sms, call, or email.');
            }

            await customerService.updateSpecialInfo(customer.id, {
                preferred_contact_method: preferredContact as 'sms' | 'call' | 'email',
                special_notes: values.special_notes?.trim() || null,
            });
            await refetch();
            success('Special information updated.');
        } catch (err) {
            error(err instanceof Error ? err.message : 'Failed to update special information.');
            throw err;
        }
    };

    const handlePasswordUpdate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setPasswordProcessing(true);
        setPasswordErrors({});
        setPasswordFormError(null);

        try {
            await authService.updatePassword({
                current_password: currentPassword,
                password: newPassword,
                password_confirmation: newPasswordConfirmation,
            });

            setCurrentPassword('');
            setNewPassword('');
            setNewPasswordConfirmation('');
            success('Password updated.');
        } catch (err) {
            if (err instanceof ApiError && err.status === 422) {
                const flatErrors = flattenValidationErrors(err.validationErrors);
                if (Object.keys(flatErrors).length > 0) {
                    setPasswordErrors(flatErrors);
                }
            } else {
                const message = err instanceof Error ? err.message : 'Unable to update password.';
                setPasswordFormError(message);
                error(message);
            }
        } finally {
            setPasswordProcessing(false);
        }
    };

    const vehicleEditFields = (v: Vehicle): EditField[] => [
        { label: 'Brand / Make', key: 'make', value: v.make, type: 'text' },
        { label: 'Model', key: 'model', value: v.model, type: 'text' },
        { label: 'Year', key: 'year', value: String(v.year), type: 'text' },
        { label: 'Plate Number', key: 'plate_number', value: v.plate_number, type: 'text' },
        { label: 'Color', key: 'color', value: v.color ?? '', type: 'text' },
    ];

    // ── Hero stats ───────────────────────────────────────────────────────────
    const vehicleCount = customer?.vehicles.length ?? 0;

    const formatShortDate = (value?: string | null): string => {
        if (!value) return '—';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '—';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const matchesVehicle = (order: JobOrder, vehicle: Vehicle): boolean => {
        if (order.vehicle?.id && order.vehicle.id === vehicle.id) return true;
        if (order.vehicle?.plate_number && order.vehicle.plate_number === vehicle.plate_number) return true;
        return false;
    };

    const openServiceHistory = async (vehicle: Vehicle) => {
        if (!customer) return;

        setServiceHistoryVehicle(vehicle);
        setServiceHistoryLoading(true);
        setServiceHistoryError(null);
        setServiceHistoryOrders([]);

        try {
            const response = await customerService.getMyJobOrders();
            const orders = response.data ?? [];
            const filtered = orders.filter((order) => matchesVehicle(order, vehicle));
            filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
            setServiceHistoryOrders(filtered);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to load service history.';
            setServiceHistoryError(message);
            error(message);
        } finally {
            setServiceHistoryLoading(false);
        }
    };

    return (
        <div className="flex h-full min-h-0 flex-1 flex-col gap-4 overflow-hidden p-6">
            {(showTitle || subtitle) && (
                <div className="space-y-1">
                    {showTitle && <h1 className="text-xl font-bold tracking-tight">User Profile</h1>}
                    {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                </div>
            )}

            {/* Hero */}
            <div className="profile-card flex items-center gap-5 rounded-xl p-5">
                <div className="h-20 w-20 shrink-0">
                    {user ? (
                        <RoleAvatar role={user.role} className="h-full w-full" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-[#2a2a2e] text-2xl font-bold text-white">
                            ?
                        </div>
                    )}
                </div>
                <div>
                    <h2 className="text-xl font-bold">{user?.name ?? '—'}</h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">{user?.email ?? '—'}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1.5 text-xs font-medium">
                            <span className="h-2 w-2 rounded-full bg-green-500" />
                            Active {roleLabel}
                        </span>
                        {isCustomer && !loading && (
                            <span className="flex items-center gap-1.5 text-xs font-medium">
                                <span className="h-2 w-2 rounded-full bg-blue-400" />
                                {vehicleCount} {vehicleCount === 1 ? 'Vehicle' : 'Vehicles'}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                {/* Two-column grid */}
                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Left column */}
                    <div className="flex flex-col gap-4">
                        {/* Personal Information */}
                        <div className="profile-card rounded-xl p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="font-semibold">Personal Information</h3>
                                {isCustomer ? (
                                    <button
                                        onClick={() => setPersonalEditOpen(true)}
                                        aria-label="Edit Personal Information"
                                        disabled={loading || !customer}
                                    >
                                        <SquarePen className="h-4 w-4 text-[#d4af37] transition-opacity hover:opacity-70 disabled:opacity-30" />
                                    </button>
                                ) : (
                                    <button onClick={() => setNonCustomerSection('personal')} aria-label="Edit Personal Information">
                                        <SquarePen className="h-4 w-4 text-[#d4af37] transition-opacity hover:opacity-70" />
                                    </button>
                                )}
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    <span className="text-muted-foreground">Phone:</span>
                                    <span className="font-medium">
                                        {isCustomer ? (loading ? '…' : (customer?.phone_number ?? '—')) : (user?.phone_number ?? '—')}
                                    </span>
                                </div>
                                <div className="flex min-w-0 items-center gap-2">
                                    <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    <span className="text-muted-foreground">Email:</span>
                                    <span className="truncate font-medium">{user?.email ?? '—'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    <span className="text-muted-foreground">Address:</span>
                                    <span className="font-medium">
                                        {isCustomer ? (loading ? '…' : (customer?.address ?? '—')) : (user?.address ?? '—')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* My Vehicles — customer only */}
                        {isCustomer && (
                            <div className="profile-card rounded-xl p-5">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="font-semibold">My Vehicles</h3>
                                </div>
                                <div className="space-y-1">
                                    {loading && <p className="text-sm text-muted-foreground">Loading vehicles…</p>}
                                    {!loading && customer?.vehicles.length === 0 && (
                                        <p className="text-sm text-muted-foreground">No vehicles registered yet.</p>
                                    )}
                                    {!loading &&
                                        customer?.vehicles.map((vehicle) => (
                                            <div key={vehicle.id} className="flex items-center justify-between rounded-lg py-2">
                                                <div className="flex items-center gap-3">
                                                    <Car className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {vehicle.make} {vehicle.model}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">{vehicle.plate_number}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setVehicleEditTarget(vehicle)}
                                                        aria-label={`Edit ${vehicle.make} ${vehicle.model}`}
                                                    >
                                                        <SquarePen className="h-3.5 w-3.5 text-[#d4af37] transition-opacity hover:opacity-70" />
                                                    </button>
                                                    <button
                                                        onClick={() => openServiceHistory(vehicle)}
                                                        className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                                                    >
                                                        <History className="h-3 w-3" />
                                                        <span>Service History</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    <button
                                        onClick={() => setAddVehicleOpen(true)}
                                        disabled={!customer}
                                        className="mt-3 w-full rounded-lg bg-[#d4af37] py-2 text-sm font-semibold text-black transition-colors hover:bg-[#e6c24e] disabled:opacity-50"
                                    >
                                        Add Vehicle
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right column */}
                    <div className="flex flex-col gap-4">
                        {/* Account Details */}
                        <div className="profile-card rounded-xl p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="font-semibold">Account Details</h3>
                                {!isCustomer && (
                                    <button onClick={() => setNonCustomerSection('account')} aria-label="Edit Account Details">
                                        <SquarePen className="h-4 w-4 text-[#d4af37] transition-opacity hover:opacity-70" />
                                    </button>
                                )}
                            </div>
                            <div className="space-y-3 text-sm">
                                {isCustomer && (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            <span className="text-muted-foreground">Member Since:</span>
                                            <span className="font-medium">{memberSince}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">Account Status:</span>
                                            <span className="font-medium capitalize">{loading ? '…' : (customer?.account_status ?? '—')}</span>
                                        </div>
                                    </>
                                )}
                                {isFrontdesk && (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">Role:</span>
                                            <span className="font-medium">Front Desk</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">Department:</span>
                                            <span className="font-medium">Operations</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            <span className="text-muted-foreground">Member Since:</span>
                                            <span className="font-medium">{memberSince}</span>
                                        </div>
                                    </>
                                )}
                                {isAdmin && (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">Role:</span>
                                            <span className="font-medium">System Administrator</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">System Access:</span>
                                            <span className="font-medium">Full Access</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            <span className="text-muted-foreground">Member Since:</span>
                                            <span className="font-medium">{memberSince}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Special Information */}
                        {!isFrontdesk && (
                            <div className="profile-card rounded-xl p-5">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="font-semibold">Special Information</h3>
                                    {isCustomer ? (
                                        <button
                                            onClick={() => setSpecialEditOpen(true)}
                                            aria-label="Edit Special Information"
                                            disabled={loading || !customer}
                                        >
                                            <SquarePen className="h-4 w-4 text-[#d4af37] transition-opacity hover:opacity-70 disabled:opacity-30" />
                                        </button>
                                    ) : (
                                        <button onClick={() => setNonCustomerSection('special')} aria-label="Edit Special Information">
                                            <SquarePen className="h-4 w-4 text-[#d4af37] transition-opacity hover:opacity-70" />
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        <span className="text-muted-foreground">Preferred Contact:</span>
                                        <span className="font-medium">
                                            {isCustomer ? (loading ? '…' : (customer?.preferred_contact_method?.toUpperCase() ?? '—')) : 'SMS'}
                                        </span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                        <span className="text-muted-foreground">Notes:</span>
                                        <span className="italic">{isCustomer ? (loading ? '…' : (customer?.special_notes ?? '—')) : 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isCustomer && (
                            <div className="profile-card rounded-xl p-5">
                                <div className="mb-3">
                                    <h3 className="font-semibold">Password</h3>
                                    <p className="text-xs text-muted-foreground">Update your password anytime for this account.</p>
                                </div>
                                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="profile-current-password" className="text-sm text-muted-foreground">
                                            Current password
                                        </Label>
                                        <div className="group flex items-center gap-2 rounded-lg border border-[#2a2a2e] bg-[#0a0b0f] px-3 transition focus-within:border-[#d4af37]/40">
                                            <Input
                                                id="profile-current-password"
                                                type={showCurrentPassword ? 'text' : 'password'}
                                                autoComplete="current-password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="h-10 border-0 bg-transparent px-0 text-sm text-white shadow-none placeholder:text-white/40 focus-visible:ring-0"
                                                required
                                            />
                                            <button
                                                type="button"
                                                tabIndex={-1}
                                                onClick={() => setShowCurrentPassword((value) => !value)}
                                                className="shrink-0 text-white/40 transition hover:text-white/70"
                                                aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                                            >
                                                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        <InputError message={passwordErrors.current_password} className="text-xs text-red-400" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="profile-new-password" className="text-sm text-muted-foreground">
                                            New password
                                        </Label>
                                        <div className="group flex items-center gap-2 rounded-lg border border-[#2a2a2e] bg-[#0a0b0f] px-3 transition focus-within:border-[#d4af37]/40">
                                            <Input
                                                id="profile-new-password"
                                                type={showNewPassword ? 'text' : 'password'}
                                                autoComplete="new-password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="h-10 border-0 bg-transparent px-0 text-sm text-white shadow-none placeholder:text-white/40 focus-visible:ring-0"
                                                required
                                            />
                                            <button
                                                type="button"
                                                tabIndex={-1}
                                                onClick={() => setShowNewPassword((value) => !value)}
                                                className="shrink-0 text-white/40 transition hover:text-white/70"
                                                aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                                            >
                                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        <InputError message={passwordErrors.password} className="text-xs text-red-400" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="profile-confirm-password" className="text-sm text-muted-foreground">
                                            Confirm new password
                                        </Label>
                                        <div className="group flex items-center gap-2 rounded-lg border border-[#2a2a2e] bg-[#0a0b0f] px-3 transition focus-within:border-[#d4af37]/40">
                                            <Input
                                                id="profile-confirm-password"
                                                type={showPasswordConfirmation ? 'text' : 'password'}
                                                autoComplete="new-password"
                                                value={newPasswordConfirmation}
                                                onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                                                className="h-10 border-0 bg-transparent px-0 text-sm text-white shadow-none placeholder:text-white/40 focus-visible:ring-0"
                                                required
                                            />
                                            <button
                                                type="button"
                                                tabIndex={-1}
                                                onClick={() => setShowPasswordConfirmation((value) => !value)}
                                                className="shrink-0 text-white/40 transition hover:text-white/70"
                                                aria-label={showPasswordConfirmation ? 'Hide password confirmation' : 'Show password confirmation'}
                                            >
                                                {showPasswordConfirmation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        <InputError message={passwordErrors.password_confirmation} className="text-xs text-red-400" />
                                    </div>

                                    {passwordFormError && <InputError message={passwordFormError} className="text-xs text-red-400" />}

                                    <Button
                                        type="submit"
                                        className="h-10 w-full rounded-lg bg-[#d4af37] text-sm font-semibold text-black transition hover:bg-[#e6c24e]"
                                        disabled={passwordProcessing}
                                    >
                                        {passwordProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                                        {passwordProcessing ? 'Updating...' : 'Update password'}
                                    </Button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Customer: Personal Information modal */}
            {isCustomer && customer && (
                <ProfileEditModal
                    open={personalEditOpen}
                    onClose={() => setPersonalEditOpen(false)}
                    title="Edit Personal Information"
                    fields={[
                        { label: 'Phone Number', key: 'phone', value: customer.phone_number ?? '', type: 'tel' },
                        { label: 'Address', key: 'address', value: customer.address ?? '', type: 'text' },
                    ]}
                    onSave={handlePersonalSave}
                />
            )}

            {/* Customer: Special Information modal */}
            {isCustomer && customer && (
                <ProfileEditModal
                    open={specialEditOpen}
                    onClose={() => setSpecialEditOpen(false)}
                    title="Edit Special Information"
                    fields={[
                        {
                            label: 'Preferred Contact (sms, call, email)',
                            key: 'preferred_contact_method',
                            value: customer.preferred_contact_method ?? 'sms',
                            type: 'text',
                        },
                        {
                            label: 'Notes',
                            key: 'special_notes',
                            value: customer.special_notes ?? '',
                            type: 'textarea',
                        },
                    ]}
                    onSave={handleSpecialSave}
                />
            )}

            {/* Customer: Vehicle edit modal */}
            {vehicleEditTarget && (
                <ProfileEditModal
                    open={vehicleEditTarget !== null}
                    onClose={() => setVehicleEditTarget(null)}
                    title={`Edit ${vehicleEditTarget.make} ${vehicleEditTarget.model}`}
                    fields={vehicleEditFields(vehicleEditTarget)}
                    onSave={handleVehicleSave}
                />
            )}

            {/* Customer: Add Vehicle modal */}
            {isCustomer && customer && (
                <AddVehicleModal open={addVehicleOpen} onClose={() => setAddVehicleOpen(false)} customerId={customer.id} onSuccess={refetch} />
            )}

            {/* Customer: Vehicle service history modal */}
            {isCustomer && serviceHistoryVehicle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4">
                    <div className="w-full max-w-2xl rounded-xl border border-[#2a2a2e] bg-[#0d0d10] p-5 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold tracking-wide text-[#d4af37] uppercase">Service History</p>
                                <h3 className="text-xl font-bold">
                                    {serviceHistoryVehicle.make} {serviceHistoryVehicle.model}
                                </h3>
                                <p className="text-xs text-muted-foreground">{serviceHistoryVehicle.plate_number}</p>
                            </div>
                            <button
                                onClick={() => setServiceHistoryVehicle(null)}
                                className="rounded-full border border-[#2a2a2e] p-1.5 text-muted-foreground transition-colors hover:border-[#d4af37]/40 hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {serviceHistoryError && (
                            <div className="mb-3 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                                {serviceHistoryError}
                            </div>
                        )}

                        {serviceHistoryLoading ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" /> Loading service history...
                            </div>
                        ) : serviceHistoryOrders.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-[#2a2a2e] p-4 text-center text-sm text-muted-foreground">
                                No service history for this vehicle yet.
                            </div>
                        ) : (
                            <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                                {serviceHistoryOrders.map((order) => {
                                    const statusLabel = order.status_label || order.status;
                                    const orderLabel = order.jo_number || `Job Order #${order.id}`;
                                    const serviceLabel = order.service?.name ?? order.notes ?? 'Service request';
                                    const scheduleLabel = order.arrival_date ? formatShortDate(order.arrival_date) : formatShortDate(order.created_at);

                                    return (
                                        <div key={order.id} className="rounded-lg border border-[#2a2a2e] bg-[#0a0b0f] p-3 text-sm">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="font-semibold text-foreground">{orderLabel}</p>
                                                <span className="text-xs text-muted-foreground">{statusLabel}</span>
                                            </div>
                                            <p className="mt-1 text-xs text-muted-foreground">{serviceLabel}</p>
                                            <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                                                <span>{scheduleLabel}</span>
                                                <span>{order.vehicle?.plate_number ?? 'No plate number'}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Frontdesk: connected modals */}
            {isFrontdesk && nonCustomerSection === 'personal' && (
                <ProfileEditModal
                    open={true}
                    onClose={() => setNonCustomerSection(null)}
                    title="Edit Personal Information"
                    fields={[
                        { label: 'Phone Number', key: 'phone', value: user?.phone_number ?? '', type: 'tel' },
                        { label: 'Address', key: 'address', value: user?.address ?? '', type: 'text' },
                    ]}
                    onSave={handleFrontdeskPersonalSave}
                />
            )}
            {isFrontdesk && nonCustomerSection === 'account' && (
                <ProfileEditModal
                    open={true}
                    onClose={() => setNonCustomerSection(null)}
                    title="Edit Account Details"
                    fields={[
                        { label: 'Name', key: 'name', value: user?.name ?? '', type: 'text' },
                        { label: 'Email', key: 'email', value: user?.email ?? '', type: 'email' },
                    ]}
                    onSave={handleFrontdeskAccountSave}
                />
            )}

            {/* Non-customer placeholders for admin */}
            {!isCustomer && !isFrontdesk && nonCustomerSection === 'personal' && (
                <ProfileEditModal
                    open={true}
                    onClose={() => setNonCustomerSection(null)}
                    title="Edit Personal Information"
                    fields={[
                        { label: 'Phone Number', key: 'phone', value: '', type: 'tel' },
                        { label: 'Address', key: 'address', value: '', type: 'text' },
                    ]}
                    onSave={async () => {}}
                />
            )}
            {!isCustomer && !isFrontdesk && nonCustomerSection === 'account' && (
                <ProfileEditModal
                    open={true}
                    onClose={() => setNonCustomerSection(null)}
                    title="Edit Account Details"
                    fields={[{ label: 'System Access', key: 'access', value: 'Full Access', type: 'text' }]}
                    onSave={async () => {}}
                />
            )}
            {!isCustomer && !isFrontdesk && nonCustomerSection === 'special' && (
                <ProfileEditModal
                    open={true}
                    onClose={() => setNonCustomerSection(null)}
                    title="Edit Special Information"
                    fields={[
                        { label: 'Preferred Contact', key: 'contact', value: 'SMS', type: 'text' },
                        { label: 'Notes', key: 'notes', value: 'N/A', type: 'textarea' },
                    ]}
                    onSave={async () => {}}
                />
            )}
        </div>
    );
}
