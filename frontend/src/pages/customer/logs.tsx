import CustomerLayout from '@/components/layout/customer-layout';
import { type BreadcrumbItem } from '@/types';
import { ArrowDownRight, ArrowUpRight, Banknote, Calendar, CheckCircle2, Search, TrendingUp, Wrench } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/customer' },
    { title: 'Logs', href: '/customer/logs' },
];

type LogType = 'all' | 'service' | 'purchase' | 'payment';

interface LogEntry {
    id: number;
    type: 'service' | 'purchase' | 'payment';
    description: string;
    amount: number;
    date: string;
    reference: string;
    status: string;
}

const sampleLogs: LogEntry[] = [
    {
        id: 1,
        type: 'payment',
        description: 'Payment for Full Detail Wash',
        amount: -2500,
        date: '2026-01-10T14:30:00',
        reference: 'PAY-2026-001',
        status: 'Completed',
    },
    {
        id: 2,
        type: 'service',
        description: 'Full Detail Wash — Booked',
        amount: 2500,
        date: '2026-01-10T09:00:00',
        reference: 'SRV-2026-012',
        status: 'Completed',
    },
    {
        id: 3,
        type: 'purchase',
        description: 'Synthetic Engine Oil 5W-30 x2',
        amount: 1300,
        date: '2026-01-08T16:15:00',
        reference: 'PUR-2026-005',
        status: 'Delivered',
    },
    {
        id: 4,
        type: 'payment',
        description: 'Payment for Engine Oil Purchase',
        amount: -1300,
        date: '2026-01-08T16:15:00',
        reference: 'PAY-2026-002',
        status: 'Completed',
    },
    {
        id: 5,
        type: 'service',
        description: 'Oil Change Service — Booked',
        amount: 1500,
        date: '2026-01-15T10:00:00',
        reference: 'SRV-2026-015',
        status: 'Pending',
    },
    {
        id: 6,
        type: 'service',
        description: 'Engine Tune-Up — Completed',
        amount: 3500,
        date: '2025-12-20T11:00:00',
        reference: 'SRV-2025-098',
        status: 'Completed',
    },
    {
        id: 7,
        type: 'payment',
        description: 'Payment for Engine Tune-Up',
        amount: -3500,
        date: '2025-12-20T15:30:00',
        reference: 'PAY-2025-045',
        status: 'Completed',
    },
    {
        id: 8,
        type: 'purchase',
        description: 'Brake Pad Set (Front)',
        amount: 1800,
        date: '2026-01-14T13:00:00',
        reference: 'PUR-2026-008',
        status: 'Processing',
    },
];

const TYPE_FILTERS: { key: LogType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'service', label: 'Services' },
    { key: 'purchase', label: 'Purchases' },
    { key: 'payment', label: 'Payments' },
];

const TYPE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
    payment: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
    service: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    purchase: { bg: 'bg-[#d4af37]/10', text: 'text-[#d4af37]', border: 'border-[#d4af37]/20' },
};

const STATUS_STYLES: Record<string, string> = {
    Completed: 'bg-green-500/10 text-green-400',
    Pending: 'bg-yellow-500/10 text-yellow-400',
    Delivered: 'bg-blue-500/10 text-blue-400',
    Processing: 'bg-purple-500/10 text-purple-400',
};

export default function CustomerLogs() {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<LogType>('all');

    const filtered = sampleLogs
        .filter((log) => {
            const matchesSearch =
                log.description.toLowerCase().includes(search.toLowerCase()) || log.reference.toLowerCase().includes(search.toLowerCase());
            const matchesFilter = filter === 'all' || log.type === filter;
            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalPaidOut = sampleLogs.filter((l) => l.amount < 0).reduce((s, l) => s + Math.abs(l.amount), 0);
    const totalServices = sampleLogs.filter((l) => l.type === 'service').length;
    const totalPurchases = sampleLogs.filter((l) => l.type === 'purchase').length;

    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Page heading */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Transaction Logs</h1>
                    <p className="text-sm text-muted-foreground">Your complete activity history</p>
                </div>

                {/* ── Stat cards ───────────────────────────────────────────── */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="profile-card rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">Total Transactions</p>
                            <TrendingUp className="h-4 w-4 text-[#d4af37]" />
                        </div>
                        <p className="mt-2 text-2xl font-bold">{sampleLogs.length}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {totalServices} services · {totalPurchases} purchases
                        </p>
                    </div>
                    <div className="profile-card rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">Total Paid Out</p>
                            <Banknote className="h-4 w-4 text-green-400" />
                        </div>
                        <p className="mt-2 text-2xl font-bold text-green-400">
                            ₱{totalPaidOut.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {sampleLogs.filter((l) => l.type === 'payment').length} payment transactions
                        </p>
                    </div>
                    <div className="profile-card rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">Completed Services</p>
                            <Wrench className="h-4 w-4 text-blue-400" />
                        </div>
                        <p className="mt-2 text-2xl font-bold text-blue-400">
                            {sampleLogs.filter((l) => l.type === 'service' && l.status === 'Completed').length}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {sampleLogs.filter((l) => l.type === 'service' && l.status === 'Pending').length} pending
                        </p>
                    </div>
                </div>

                {/* ── Search & Type filter ─────────────────────────────────── */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search description or reference…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex h-10 w-full rounded-lg border border-[#2a2a2e] bg-[#0d0d10] pr-4 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/40 focus:outline-none"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {TYPE_FILTERS.map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setFilter(key)}
                                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                                    filter === key
                                        ? 'bg-[#d4af37] text-black shadow-[0_0_12px_rgba(212,175,55,0.35)]'
                                        : 'border border-[#2a2a2e] text-muted-foreground hover:border-[#d4af37]/50 hover:text-foreground'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Log Entries ──────────────────────────────────────────── */}
                <div className="flex flex-col gap-3">
                    {filtered.map((log) => {
                        const ts = TYPE_STYLES[log.type];
                        const isDebit = log.amount < 0;
                        return (
                            <div key={log.id} className="profile-card rounded-xl p-4 transition-all hover:shadow-[0_0_0_1px_rgba(212,175,55,0.25)]">
                                <div className="flex items-center gap-4">
                                    {/* Type icon */}
                                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${ts.bg} ${ts.border}`}>
                                        {isDebit ? (
                                            <ArrowUpRight className={`h-4 w-4 ${ts.text}`} />
                                        ) : (
                                            <ArrowDownRight className={`h-4 w-4 ${ts.text}`} />
                                        )}
                                    </div>

                                    {/* Description + meta */}
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold">{log.description}</p>
                                        <div className="mt-1 flex flex-wrap items-center gap-2">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ts.bg} ${ts.text}`}
                                            >
                                                {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                                            </span>
                                            <span className="font-mono text-xs text-muted-foreground">{log.reference}</span>
                                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                &nbsp;
                                                {new Date(log.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Status + amount */}
                                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[log.status] ?? 'bg-muted text-muted-foreground'}`}
                                        >
                                            {log.status}
                                        </span>
                                        <p className={`text-sm font-bold ${isDebit ? 'text-green-400' : 'text-foreground'}`}>
                                            {isDebit ? '−' : '+'}₱{Math.abs(log.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {filtered.length === 0 && (
                        <div className="flex items-center justify-center py-14 text-muted-foreground">
                            <div className="flex flex-col items-center gap-2">
                                <CheckCircle2 className="h-8 w-8 opacity-20" />
                                <p className="text-sm">No transactions found.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}
