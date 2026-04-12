/**
 * Hook for customer billing data
 * Fetches transactions from the backend and splits into pending/paid
 */

import { customerService } from '@/services/customerService';
import { CustomerTransaction } from '@/types/customer';
import { useCallback, useEffect, useState } from 'react';

export function useCustomerBilling() {
    const [transactions, setTransactions] = useState<CustomerTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBilling = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await customerService.getMyTransactions({ per_page: 100 });
            const data = response?.data?.data ?? [];
            setTransactions(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch billing data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBilling();
    }, [fetchBilling]);

    const pendingItems = transactions.filter((t) => t.type === 'invoice');
    const paidItems = transactions.filter((t) => t.type === 'payment');
    const outstandingBalance = pendingItems.reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
        transactions,
        pendingItems,
        paidItems,
        outstandingBalance,
        loading,
        error,
        refresh: fetchBilling,
    };
}
