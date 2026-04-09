import CustomerLayout from '@/components/layout/customer-layout';
import { useCustomerLogs } from '@/hooks/useCustomerLogs';
import { type BreadcrumbItem } from '@/types';
import { CustomerTransaction } from '@/types/customer';
import { ArrowDownRight, ArrowUpRight, Calendar, Filter, Loader2, Search } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/customer' },
    { title: 'Logs', href: '/customer/logs' },
];

type LogType = 'all' | 'invoice' | 'payment' | 'refund';

const typeLabels: Record<string, string> = {
    all: 'All',
    invoice: 'Invoices',
    payment: 'Payments',
    refund: 'Refunds',
};

const mapDisplayType = (type: string): string => {
    switch (type) {
        case 'invoice':
            return 'Service';
        case 'payment':
            return 'Payment';
        case 'refund':
            return 'Refund';
        default:
            return type;
    }
};

const getDescription = (item: CustomerTransaction): string => {
    return item.notes || `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} #${item.id}`;
};

export default function CustomerLogs() {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<LogType>('all');
    const { logs, loading, error } = useCustomerLogs();

    const filtered = logs
        .filter((log) => {
            const desc = getDescription(log);
            const ref = log.reference_number || '';
            const matchesSearch = desc.toLowerCase().includes(search.toLowerCase()) || ref.toLowerCase().includes(search.toLowerCase());
            const matchesFilter = filter === 'all' || log.type === filter;
            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

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

                {error && <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">{error}</div>}

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-[#d4af37]" />
                    </div>
                ) : (
                    <>
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
                                                    <div
                                                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${
                                                            log.type === 'payment'
                                                                ? 'bg-green-500/10 text-green-500'
                                                                : log.type === 'invoice'
                                                                  ? 'bg-blue-500/10 text-blue-500'
                                                                  : 'bg-[#d4af37]/10 text-[#d4af37]'
                                                        }`}
                                                    >
                                                        {log.type === 'payment' ? (
                                                            <ArrowUpRight className="h-3 w-3" />
                                                        ) : (
                                                            <ArrowDownRight className="h-3 w-3" />
                                                        )}
                                                        {mapDisplayType(log.type)}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm font-medium">{getDescription(log)}</td>
                                                <td className="px-4 py-3 text-sm text-muted-foreground">{log.reference_number || '—'}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        {new Date(log.created_at).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                            log.type === 'payment'
                                                                ? 'bg-green-500/10 text-green-500'
                                                                : log.type === 'refund'
                                                                  ? 'bg-yellow-500/10 text-yellow-500'
                                                                  : 'bg-blue-500/10 text-blue-500'
                                                        }`}
                                                    >
                                                        {log.type === 'payment' ? 'Completed' : log.type === 'invoice' ? 'Pending' : 'Refunded'}
                                                    </span>
                                                </td>
                                                <td
                                                    className={`px-4 py-3 text-right text-sm font-semibold ${log.type === 'payment' ? 'text-green-500' : ''}`}
                                                >
                                                    {log.type === 'payment' ? '-' : ''}₱
                                                    {Math.abs(log.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
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
                    </>
                )}
            </div>
        </CustomerLayout>
    );
}
