import CustomerLayout from '@/components/layout/customer-layout';
import { type BreadcrumbItem } from '@/types';
import { Calendar, CreditCard, Receipt } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/customer' },
    { title: 'Billing & Payment', href: '/customer/billing' },
];

type TabType = 'pending' | 'paid';

interface BillingItem {
    id: number;
    description: string;
    type: 'service' | 'product';
    amount: number;
    date: string;
    status: 'pending' | 'paid';
    reference?: string;
}

const sampleBillings: BillingItem[] = [
    { id: 1, description: 'Oil Change Service', type: 'service', amount: 1500, date: '2026-01-15', status: 'pending' },
    { id: 2, description: 'Brake Pad Set (Front)', type: 'product', amount: 1800, date: '2026-01-14', status: 'pending' },
    { id: 3, description: 'Full Detail Wash', type: 'service', amount: 2500, date: '2026-01-10', status: 'paid', reference: 'PAY-2026-001' },
    { id: 4, description: 'Synthetic Engine Oil 5W-30 x2', type: 'product', amount: 1300, date: '2026-01-08', status: 'paid', reference: 'PAY-2026-002' },
    { id: 5, description: 'Engine Tune-Up', type: 'service', amount: 3500, date: '2025-12-20', status: 'paid', reference: 'PAY-2025-045' },
];

export default function BillingPayment() {
    const [activeTab, setActiveTab] = useState<TabType>('pending');

    const pendingItems = sampleBillings.filter((b) => b.status === 'pending');
    const paidItems = sampleBillings.filter((b) => b.status === 'paid');
    const outstandingBalance = pendingItems.reduce((sum, b) => sum + b.amount, 0);

    const displayItems = activeTab === 'pending' ? pendingItems : paidItems;

    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Billing & Payment</h1>
                    <p className="text-muted-foreground">Manage your payments and billing history.</p>
                </div>

                {/* Outstanding Balance */}
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Outstanding Balance</p>
                            <p className="mt-1 text-3xl font-bold text-[#d4af37]">₱{outstandingBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{pendingItems.length} pending payment{pendingItems.length !== 1 ? 's' : ''}</p>
                        </div>
                        {pendingItems.length > 0 && (
                            <button className="rounded-lg bg-[#d4af37] px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-[#e6c24e]">
                                Pay All
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 rounded-lg border bg-muted p-1">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === 'pending' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Pending ({pendingItems.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('paid')}
                        className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === 'paid' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Paid ({paidItems.length})
                    </button>
                </div>

                {/* Billing Items */}
                <div className="space-y-3">
                    {displayItems.map((item) => (
                        <div key={item.id} className="rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
                            <div className="flex items-center gap-4">
                                <div className={`rounded-lg p-2.5 ${item.type === 'service' ? 'bg-blue-500/10' : 'bg-[#d4af37]/10'}`}>
                                    {item.type === 'service' ? (
                                        <Receipt className={`h-5 w-5 ${item.type === 'service' ? 'text-blue-500' : 'text-[#d4af37]'}`} />
                                    ) : (
                                        <CreditCard className="h-5 w-5 text-[#d4af37]" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium">{item.description}</p>
                                    <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                        <span className="capitalize rounded-md bg-muted px-2 py-0.5 text-xs">{item.type}</span>
                                        {item.reference && <span className="text-xs">Ref: {item.reference}</span>}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold">₱{item.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                                    {item.status === 'pending' ? (
                                        <button className="mt-1 rounded-lg bg-[#d4af37] px-4 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-[#e6c24e]">
                                            Pay Now
                                        </button>
                                    ) : (
                                        <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-500">
                                            Paid
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {displayItems.length === 0 && (
                    <div className="flex items-center justify-center py-12 text-muted-foreground">
                        <p>No {activeTab} payments found.</p>
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
