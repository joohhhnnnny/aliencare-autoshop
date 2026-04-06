import CustomerLayout from '@/components/layout/customer-layout';
import { type BreadcrumbItem } from '@/types';
import { ArrowDownRight, ArrowUpRight, Calendar, Filter, Search } from 'lucide-react';
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
    { id: 1, type: 'payment', description: 'Payment for Full Detail Wash', amount: -2500, date: '2026-01-10T14:30:00', reference: 'PAY-2026-001', status: 'Completed' },
    { id: 2, type: 'service', description: 'Full Detail Wash - Booked', amount: 2500, date: '2026-01-10T09:00:00', reference: 'SRV-2026-012', status: 'Completed' },
    { id: 3, type: 'purchase', description: 'Synthetic Engine Oil 5W-30 x2', amount: 1300, date: '2026-01-08T16:15:00', reference: 'PUR-2026-005', status: 'Delivered' },
    { id: 4, type: 'payment', description: 'Payment for Engine Oil Purchase', amount: -1300, date: '2026-01-08T16:15:00', reference: 'PAY-2026-002', status: 'Completed' },
    { id: 5, type: 'service', description: 'Oil Change Service - Booked', amount: 1500, date: '2026-01-15T10:00:00', reference: 'SRV-2026-015', status: 'Pending' },
    { id: 6, type: 'service', description: 'Engine Tune-Up - Completed', amount: 3500, date: '2025-12-20T11:00:00', reference: 'SRV-2025-098', status: 'Completed' },
    { id: 7, type: 'payment', description: 'Payment for Engine Tune-Up', amount: -3500, date: '2025-12-20T15:30:00', reference: 'PAY-2025-045', status: 'Completed' },
    { id: 8, type: 'purchase', description: 'Brake Pad Set (Front)', amount: 1800, date: '2026-01-14T13:00:00', reference: 'PUR-2026-008', status: 'Processing' },
];

const typeLabels: Record<string, string> = {
    all: 'All',
    service: 'Services',
    purchase: 'Purchases',
    payment: 'Payments',
};

export default function CustomerLogs() {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<LogType>('all');

    const filtered = sampleLogs
        .filter((log) => {
            const matchesSearch = log.description.toLowerCase().includes(search.toLowerCase()) || log.reference.toLowerCase().includes(search.toLowerCase());
            const matchesFilter = filter === 'all' || log.type === filter;
            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Transaction Logs</h1>
                    <p className="text-muted-foreground">View your complete transaction history.</p>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by description or reference..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex h-10 w-full rounded-lg border border-input bg-background px-9 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        {(Object.keys(typeLabels) as LogType[]).map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilter(type)}
                                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                    filter === type
                                        ? 'bg-[#d4af37] text-black'
                                        : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
                                }`}
                            >
                                {typeLabels[type]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Logs Table */}
                <div className="rounded-xl border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b text-left text-sm text-muted-foreground">
                                    <th className="px-4 py-3 font-medium">Type</th>
                                    <th className="px-4 py-3 font-medium">Description</th>
                                    <th className="px-4 py-3 font-medium">Reference</th>
                                    <th className="px-4 py-3 font-medium">Date</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 text-right font-medium">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((log) => (
                                    <tr key={log.id} className="border-b last:border-0 hover:bg-muted/50">
                                        <td className="px-4 py-3">
                                            <div className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${
                                                log.type === 'payment'
                                                    ? 'bg-green-500/10 text-green-500'
                                                    : log.type === 'service'
                                                    ? 'bg-blue-500/10 text-blue-500'
                                                    : 'bg-[#d4af37]/10 text-[#d4af37]'
                                            }`}>
                                                {log.type === 'payment' ? (
                                                    <ArrowUpRight className="h-3 w-3" />
                                                ) : (
                                                    <ArrowDownRight className="h-3 w-3" />
                                                )}
                                                {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium">{log.description}</td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">{log.reference}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {new Date(log.date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                log.status === 'Completed'
                                                    ? 'bg-green-500/10 text-green-500'
                                                    : log.status === 'Pending'
                                                    ? 'bg-yellow-500/10 text-yellow-500'
                                                    : 'bg-blue-500/10 text-blue-500'
                                            }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className={`px-4 py-3 text-right text-sm font-semibold ${log.amount < 0 ? 'text-green-500' : ''}`}>
                                            {log.amount < 0 ? '-' : ''}₱{Math.abs(log.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {filtered.length === 0 && (
                    <div className="flex items-center justify-center py-12 text-muted-foreground">
                        <p>No transactions found.</p>
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
