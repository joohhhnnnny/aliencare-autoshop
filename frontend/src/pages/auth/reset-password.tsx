import InputError from '@/components/shared/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { flattenValidationErrors } from '@/lib/validation-errors';
import { ApiError } from '@/services/api';
import { authService } from '@/services/authService';
import { ArrowLeft, Eye, EyeOff, LoaderCircle, Mail } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';

export default function ResetPassword() {
    const { token } = useParams<{ token: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const emailFromQuery = searchParams.get('email') || '';

    const [email] = useState(emailFromQuery);
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        setFormError(null);
        try {
            await authService.resetPassword({
                token: token || '',
                email,
                password,
                password_confirmation: passwordConfirmation,
            });
            navigate('/login');
        } catch (error) {
            if (error instanceof ApiError && error.status === 422) {
                const flatErrors = flattenValidationErrors(error.validationErrors);
                if (Object.keys(flatErrors).length > 0) {
                    setErrors(flatErrors);
                }
            } else {
                setFormError(error instanceof Error ? error.message : 'Unable to reset password right now.');
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="relative flex min-h-dvh items-center justify-center bg-[#050505] px-4 py-8">
            <Link
                to="/"
                className="absolute top-5 left-5 inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/[0.07] px-3 py-2 text-sm text-white/70 transition hover:border-white/30 hover:text-white"
            >
                <ArrowLeft className="h-4 w-4" />
                Back
            </Link>

            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center gap-3">
                    <img src="/images/iconlogo.svg" alt="AlienCare Autoshop" className="h-14 w-14" />
                    <div className="text-center">
                        <h1 className="text-2xl font-semibold tracking-tight text-white">Reset password</h1>
                        <p className="mt-1 text-sm text-white/50">Create a new password for your account.</p>
                    </div>
                </div>

                {formError && (
                    <InputError
                        message={formError}
                        className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                    />
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-white/90">
                            Email
                        </Label>
                        <div className="group flex items-center gap-3 rounded-xl border border-white/20 bg-white/[0.07] px-3.5">
                            <Mail className="h-4 w-4 shrink-0 text-white/40" />
                            <Input
                                id="email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                readOnly
                                className="h-11 border-0 bg-transparent px-0 text-sm text-white/70 shadow-none placeholder:text-white/40 focus-visible:ring-0"
                            />
                        </div>
                        <InputError message={errors.email} className="text-xs text-red-400" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium text-white/90">
                            New password
                        </Label>
                        <div className="group flex items-center gap-3 rounded-xl border border-white/20 bg-white/[0.07] px-3.5 transition focus-within:border-[#d4af37]/60 focus-within:ring-1 focus-within:ring-[#d4af37]/20">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                autoFocus
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-11 border-0 bg-transparent px-0 text-sm text-white shadow-none placeholder:text-white/40 focus-visible:ring-0"
                            />
                            <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => setShowPassword((value) => !value)}
                                className="shrink-0 text-white/40 transition hover:text-white/70"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <InputError message={errors.password} className="text-xs text-red-400" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation" className="text-sm font-medium text-white/90">
                            Confirm new password
                        </Label>
                        <div className="group flex items-center gap-3 rounded-xl border border-white/20 bg-white/[0.07] px-3.5 transition focus-within:border-[#d4af37]/60 focus-within:ring-1 focus-within:ring-[#d4af37]/20">
                            <Input
                                id="password_confirmation"
                                type={showPasswordConfirmation ? 'text' : 'password'}
                                autoComplete="new-password"
                                placeholder="Confirm password"
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                className="h-11 border-0 bg-transparent px-0 text-sm text-white shadow-none placeholder:text-white/40 focus-visible:ring-0"
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
                        <InputError message={errors.password_confirmation} className="text-xs text-red-400" />
                    </div>

                    <Button
                        type="submit"
                        className="h-11 w-full rounded-xl bg-[#d4af37] text-sm font-semibold text-black transition hover:bg-[#e6c24e]"
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {processing ? 'Resetting...' : 'Reset password'}
                    </Button>
                </form>

                <p className="text-center text-sm text-white/55">
                    Remembered your password?{' '}
                    <Link to="/login" className="font-medium text-white/80 transition hover:text-[#d4af37]">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
