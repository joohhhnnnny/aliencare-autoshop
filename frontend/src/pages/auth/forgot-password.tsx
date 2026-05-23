import InputError from '@/components/shared/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { flattenValidationErrors } from '@/lib/validation-errors';
import { ApiError } from '@/services/api';
import { authService } from '@/services/authService';
import { ArrowLeft, LoaderCircle, Mail } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword({ status: initialStatus }: { status?: string }) {
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [status, setStatus] = useState(initialStatus || '');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        setFormError(null);
        try {
            const response = await authService.forgotPassword(email.trim());
            setStatus(response.message || 'We have emailed your password reset link.');
        } catch (error) {
            if (error instanceof ApiError && error.status === 422) {
                const flatErrors = flattenValidationErrors(error.validationErrors);
                if (Object.keys(flatErrors).length > 0) {
                    setErrors(flatErrors);
                }
            } else {
                setFormError(error instanceof Error ? error.message : 'Unable to send reset link right now.');
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
                        <h1 className="text-2xl font-semibold tracking-tight text-white">Forgot your password?</h1>
                        <p className="mt-1 text-sm text-white/50">Enter your email and we will send a reset link.</p>
                    </div>
                </div>

                {status && (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                        {status}
                    </div>
                )}

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
                        <div className="group flex items-center gap-3 rounded-xl border border-white/20 bg-white/[0.07] px-3.5 transition focus-within:border-[#d4af37]/60 focus-within:ring-1 focus-within:ring-[#d4af37]/20">
                            <Mail className="h-4 w-4 shrink-0 text-white/50 transition group-focus-within:text-[#d4af37]" />
                            <Input
                                id="email"
                                type="email"
                                required
                                autoComplete="email"
                                autoFocus
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-11 border-0 bg-transparent px-0 text-sm text-white shadow-none placeholder:text-white/40 focus-visible:ring-0"
                            />
                        </div>
                        <InputError message={errors.email} className="text-xs text-red-400" />
                    </div>

                    <Button
                        type="submit"
                        className="h-11 w-full rounded-xl bg-[#d4af37] text-sm font-semibold text-black transition hover:bg-[#e6c24e]"
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        {processing ? 'Sending email...' : 'Email password reset link'}
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
