import { useEffect, useState } from 'react';
import { alertService } from '@/services/alertService';
import { BarChart3, Loader2 } from 'lucide-react';

interface DailyTrend {
    date: string;
    alert_type: string;
    count: number;
}

const URGENCY_COLORS: Record<string, string> = {
    low_stock: '#f97316',
    out_of_stock: '#ef4444',
    expiry: '#eab308',
    reorder: '#3b82f6',
};

export function AlertTrendsChart() {
    const [trends, setTrends] = useState<DailyTrend[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                setLoading(true);
                const res = await alertService.getAlertTrends();
                if (!cancelled && res.success) {
                    setTrends(res.data ?? []);
                }
            } catch {
                // Ignore errors; chart just stays empty
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (trends.length === 0) {
        return (
            <div className="py-6 text-center text-sm text-muted-foreground">
                <BarChart3 className="mx-auto mb-2 h-8 w-8 opacity-40" />
                No alert data available yet.
            </div>
        );
    }

    // Group by date
    const dateMap: Record<string, Record<string, number>> = {};
    const allTypes = new Set<string>();
    trends.forEach((t) => {
        if (!dateMap[t.date]) dateMap[t.date] = {};
        dateMap[t.date][t.alert_type] = (dateMap[t.date][t.alert_type] || 0) + t.count;
        allTypes.add(t.alert_type);
    });

    const dates = Object.keys(dateMap).sort();
    const maxCount = Math.max(1, ...trends.map((t) => t.count));

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Alert Volume (30 days)</h3>
            </div>
            <div className="flex items-end gap-[2px]" style={{ height: 120 }}>
                {dates.map((date) => {
                    const dayData = dateMap[date];
                    const total = Object.values(dayData).reduce((s, c) => s + c, 0);
                    const heightPct = Math.max(4, (total / maxCount) * 100);
                    return (
                        <div
                            key={date}
                            className="group relative flex-1 min-w-[3px]"
                            style={{ height: '100%' }}
                        >
                            <div className="absolute bottom-0 left-0 right-0 flex flex-col justify-end" style={{ height: '100%' }}>
                                {Array.from(allTypes).map((type) => {
                                    const typeCount = dayData[type] || 0;
                                    const typeHeight = total > 0 ? (typeCount / total) * heightPct : 0;
                                    if (typeHeight === 0) return null;
                                    return (
                                        <div
                                            key={type}
                                            style={{
                                                height: `${typeHeight}%`,
                                                backgroundColor: URGENCY_COLORS[type] || '#6b7280',
                                            }}
                                            className="rounded-t-sm transition-all hover:opacity-80"
                                        />
                                    );
                                })}
                            </div>
                            <div className="invisible absolute -top-10 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-popover px-2 py-1 text-xs text-popover-foreground shadow group-hover:visible">
                                {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                : {total} alert{total !== 1 ? 's' : ''}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="flex flex-wrap gap-3 pt-1">
                {Array.from(allTypes).map((type) => (
                    <div key={type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: URGENCY_COLORS[type] || '#6b7280' }} />
                        {type.replace('_', ' ')}
                    </div>
                ))}
            </div>
        </div>
    );
}
