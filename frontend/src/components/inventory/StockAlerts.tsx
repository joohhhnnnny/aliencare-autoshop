import { AlertTriangle, CheckCircle, Clock, Download, Filter, Package, RefreshCw, Search, Settings, Shield, TrendingUp, X } from 'lucide-react';
import { AlertTrendsChart } from './AlertTrendsChart';
import { useEffect, useMemo, useState } from 'react';
import { useToast } from '../ui/toast';
import { useAlertContext } from '../../contexts/AlertContext';
import { getApiErrorMessage } from '../../lib/api-error-message';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';

type UrgencyFilter = 'all' | 'critical' | 'high' | 'medium' | 'low';
type TypeFilter = 'all' | 'low_stock' | 'out_of_stock' | 'expiry' | 'reorder';

export function StockAlerts() {
    const { alerts, statistics, loading, error, acknowledgeAlert, bulkAcknowledgeAlerts, generateLowStockAlerts, generateExpiryAlerts, cleanupAlerts, refresh } =
        useAlertContext();

    const [bulkSelected, setBulkSelected] = useState<number[]>([]);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>('all');
    const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
    const [acknowledgeNote, setAcknowledgeNote] = useState<string>('');
    const [acknowledgeWithNoteId, setAcknowledgeWithNoteId] = useState<number | null>(null);

    const { success, error: toastError } = useToast();

    const handleAcknowledgeAlert = async (alertId: number, notes?: string) => {
        try {
            setActionMessage(null);
            setActionLoading(`acknowledge-${alertId}`);
            await acknowledgeAlert(alertId, notes || undefined);
            setAcknowledgeWithNoteId(null);
            setAcknowledgeNote('');
            setActionMessage({
                type: 'success',
                message: 'Alert acknowledged successfully.',
            });
            success('Alert acknowledged successfully.');
        } catch (err) {
            setActionMessage({
                type: 'error',
                message: getApiErrorMessage(err, 'Failed to acknowledge alert.'),
            });
            toastError(getApiErrorMessage(err, 'Failed to acknowledge alert.'));
        } finally {
            setActionLoading(null);
        }
    };

    const handleBulkAcknowledge = async () => {
        if (bulkSelected.length === 0) {
            setActionMessage({
                type: 'error',
                message: 'Please select alerts to acknowledge.',
            });
            return;
        }

        try {
            setActionMessage(null);
            setActionLoading('bulk-acknowledge');
            const selectedCount = bulkSelected.length;
            await bulkAcknowledgeAlerts(bulkSelected);
            setBulkSelected([]);
            setActionMessage({
                type: 'success',
                message: `Acknowledged ${selectedCount} alert${selectedCount === 1 ? '' : 's'}.`,
            });
            success(`Acknowledged ${selectedCount} alert${selectedCount === 1 ? '' : 's'}.`);
        } catch (err) {
            setActionMessage({
                type: 'error',
                message: getApiErrorMessage(err, 'Failed to acknowledge selected alerts.'),
            });
            toastError(getApiErrorMessage(err, 'Failed to acknowledge selected alerts.'));
        } finally {
            setActionLoading(null);
        }
    };

    const handleGenerateAlerts = async () => {
        try {
            setActionMessage(null);
            setActionLoading('generate');
            const result = await generateLowStockAlerts();
            setActionMessage({
                type: 'success',
                message: `Generated ${result.alerts_created} new alert${result.alerts_created === 1 ? '' : 's'} and refreshed ${result.total_alerts} total tracked alert${result.total_alerts === 1 ? '' : 's'}.`,
            });
            success(`Generated ${result.alerts_created} new alert${result.alerts_created === 1 ? '' : 's'} and refreshed ${result.total_alerts} total tracked alert${result.total_alerts === 1 ? '' : 's'}.`);
        } catch (err) {
            setActionMessage({
                type: 'error',
                message: getApiErrorMessage(err, 'Failed to generate alerts.'),
            });
            toastError(getApiErrorMessage(err, 'Failed to generate alerts.'));
        } finally {
            setActionLoading(null);
        }
    };

    const handleGenerateExpiryAlerts = async () => {
        try {
            setActionMessage(null);
            setActionLoading('generate-expiry');
            const result = await generateExpiryAlerts();
            setActionMessage({
                type: 'success',
                message: `Generated ${result.alerts_created} expiry alert${result.alerts_created === 1 ? '' : 's'} and refreshed ${result.total_alerts} total tracked alert${result.total_alerts === 1 ? '' : 's'}.`,
            });
            success(`Generated ${result.alerts_created} expiry alert${result.alerts_created === 1 ? '' : 's'}.`);
        } catch (err) {
            setActionMessage({
                type: 'error',
                message: getApiErrorMessage(err, 'Failed to generate expiry alerts.'),
            });
            toastError(getApiErrorMessage(err, 'Failed to generate expiry alerts.'));
        } finally {
            setActionLoading(null);
        }
    };

    const exportAlertsCSV = () => {
        const headers = ['ID', 'Item', 'Category', 'Type', 'Urgency', 'Stock', 'Threshold', 'Created', 'Acknowledged'];
        const rows = alerts.map((a) => [
            a.id,
            `"${a.item_name}"`,
            `"${a.category || ''}"`,
            a.alert_type,
            a.urgency,
            a.current_stock,
            a.reorder_level,
            new Date(a.created_at).toLocaleDateString(),
            a.acknowledged ? 'Yes' : 'No',
        ]);
        const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const aEl = document.createElement('a');
        aEl.href = url;
        aEl.download = `alerts-export-${new Date().toISOString().split('T')[0]}.csv`;
        aEl.click();
        URL.revokeObjectURL(url);
        success('Alerts exported as CSV.');
    };

    const handleCleanup = async () => {
        try {
            setActionMessage(null);
            setActionLoading('cleanup');
            const result = await cleanupAlerts(30);
            setActionMessage({
                type: 'success',
                message: `Cleaned up ${result.deleted_count} old acknowledged alert${result.deleted_count === 1 ? '' : 's'}.`,
            });
            success(`Cleaned up ${result.deleted_count} old acknowledged alert${result.deleted_count === 1 ? '' : 's'}.`);
        } catch (err) {
            setActionMessage({
                type: 'error',
                message: getApiErrorMessage(err, 'Failed to clean up alerts.'),
            });
            toastError(getApiErrorMessage(err, 'Failed to clean up alerts.'));
        } finally {
            setActionLoading(null);
        }
    };

    const toggleBulkSelect = (alertId: number) => {
        setBulkSelected((prev) => (prev.includes(alertId) ? prev.filter((id) => id !== alertId) : [...prev, alertId]));
    };

    const selectAllUnacknowledged = () => {
        const unacknowledgedIds = alerts.filter((alert) => !alert.acknowledged).map((alert) => alert.id);
        setBulkSelected(unacknowledgedIds);
    };

    const getUrgencyIcon = (urgency: string) => {
        switch (urgency) {
            case 'critical':
                return <AlertTriangle className="h-4 w-4 text-destructive" />;
            case 'high':
                return <AlertTriangle className="h-4 w-4 text-primary" />;
            case 'medium':
                return <Clock className="h-4 w-4 text-primary/80" />;
            default:
                return <Package className="h-4 w-4 text-primary/60" />;
        }
    };

    const getUrgencyBadge = (urgency: string) => {
        switch (urgency) {
            case 'critical':
                return <Badge variant="destructive">Critical</Badge>;
            case 'high':
                return <Badge className="bg-primary text-primary-foreground">High</Badge>;
            case 'medium':
                return <Badge className="bg-primary/80 text-primary-foreground">Medium</Badge>;
            default:
                return <Badge variant="secondary">Low</Badge>;
        }
    };

    const filteredAlerts = useMemo(() => {
        return alerts.filter((alert) => {
            if (searchQuery && !alert.item_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            if (urgencyFilter !== 'all' && alert.urgency !== urgencyFilter) return false;
            if (typeFilter !== 'all' && alert.alert_type !== typeFilter) return false;
            return true;
        });
    }, [alerts, searchQuery, urgencyFilter, typeFilter]);

    const hasActiveFilters = searchQuery !== '' || urgencyFilter !== 'all' || typeFilter !== 'all';

    const clearFilters = () => {
        setSearchQuery('');
        setUrgencyFilter('all');
        setTypeFilter('all');
    };

    const unacknowledgedAlerts = filteredAlerts.filter((alert) => !alert.acknowledged);
    const acknowledgedAlerts = filteredAlerts.filter((alert) => alert.acknowledged);

    // Listen for new critical alert notifications
    useEffect(() => {
        const handler = (e: Event) => {
            const { count } = (e as CustomEvent).detail;
            if (count > 0) {
                success(`${count} new critical alert${count > 1 ? 's' : ''} detected! Check the alerts list.`);
            }
        };
        window.addEventListener('new-critical-alerts', handler);
        return () => window.removeEventListener('new-critical-alerts', handler);
    }, [success]);

    if (error) {
        return (
            <div className="space-y-6">
                <div className="py-8 text-center">
                    <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-destructive" />
                    <h3 className="mb-2 text-lg font-semibold text-foreground">Error Loading Alerts</h3>
                    <p className="mb-4 text-muted-foreground">{error}</p>
                    <Button onClick={refresh} disabled={loading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Stock Alerts</h1>
                    <p className="text-muted-foreground">Stay on top of parts running low and decide what to reorder.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={refresh} disabled={loading} size="sm">
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>

                    <Button variant="outline" onClick={handleGenerateAlerts} disabled={actionLoading === 'generate'} size="sm">
                        <Settings className="mr-2 h-4 w-4" />
                        Scan for Low Stock
                    </Button>

                    <Button variant="outline" onClick={handleGenerateExpiryAlerts} disabled={actionLoading === 'generate-expiry'} size="sm">
                        <Clock className="mr-2 h-4 w-4" />
                        Scan for Expiry
                    </Button>

                    <Button variant="outline" onClick={exportAlertsCSV} size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>

                    <Button variant="outline" onClick={handleCleanup} disabled={actionLoading === 'cleanup'} size="sm">
                        <Package className="mr-2 h-4 w-4" />
                        Clear Old Alerts
                    </Button>
                </div>
            </div>

            {actionMessage && (
                <Alert variant={actionMessage.type === 'error' ? 'destructive' : 'default'}>
                    {actionMessage.type === 'error' ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    <AlertDescription>{actionMessage.message}</AlertDescription>
                </Alert>
            )}

            {/* Filter Bar */}
            <div className="flex flex-wrap items-end gap-3 rounded-xl border border-[#2a2a2e] bg-[#0d0d10]/40 p-4">
                <div className="flex-1 min-w-[200px]">
                    <Label htmlFor="alert-search" className="mb-1.5 block text-xs text-muted-foreground">Search</Label>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="alert-search"
                            placeholder="Item name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>
                <div className="w-[150px]">
                    <Label className="mb-1.5 block text-xs text-muted-foreground">Urgency</Label>
                    <Select value={urgencyFilter} onValueChange={(v) => setUrgencyFilter(v as UrgencyFilter)}>
                        <SelectTrigger>
                            <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="w-[150px]">
                    <Label className="mb-1.5 block text-xs text-muted-foreground">Alert Type</Label>
                    <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeFilter)}>
                        <SelectTrigger>
                            <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="low_stock">Low Stock</SelectItem>
                            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                            <SelectItem value="expiry">Expiry</SelectItem>
                            <SelectItem value="reorder">Reorder</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="mb-0.5">
                        <X className="mr-1 h-4 w-4" />
                        Clear
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="profile-card rounded-xl">
                    <div className="flex flex-row items-center justify-between p-5 pb-2">
                        <p className="text-sm font-medium">Needs Attention</p>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </div>
                    <div className="p-5 pt-0">
                        <div className="text-2xl font-bold text-destructive">{statistics?.critical_alerts || 0}</div>
                        <p className="text-xs text-muted-foreground">Order these right away</p>
                    </div>
                </div>

                <div className="profile-card rounded-xl">
                    <div className="flex flex-row items-center justify-between p-5 pb-2">
                        <p className="text-sm font-medium">High Priority</p>
                        <AlertTriangle className="h-4 w-4 text-primary" />
                    </div>
                    <div className="p-5 pt-0">
                        <div className="text-2xl font-bold text-primary">{statistics?.high_priority_alerts || 0}</div>
                        <p className="text-xs text-muted-foreground">Plan to reorder soon</p>
                    </div>
                </div>

                <div className="profile-card rounded-xl">
                    <div className="flex flex-row items-center justify-between p-5 pb-2">
                        <p className="text-sm font-medium">Unreviewed Alerts</p>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="p-5 pt-0">
                        <div className="text-2xl font-bold text-foreground">{statistics?.unacknowledged_alerts || 0}</div>
                        <p className="text-xs text-muted-foreground">Waiting to be checked</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="profile-card rounded-xl">
                    <div className="p-5 pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                                <h3 className="font-semibold text-foreground">Alerts to Review</h3>
                            </div>
                            {unacknowledgedAlerts.length > 0 && (
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={selectAllUnacknowledged} disabled={loading}>
                                        Select All
                                    </Button>
                                    {bulkSelected.length > 0 && (
                                        <Button size="sm" onClick={handleBulkAcknowledge} disabled={actionLoading === 'bulk-acknowledge'}>
                                            Acknowledge ({bulkSelected.length})
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="space-y-4 p-5 pt-0">
                        {loading ? (
                            <div className="py-8 text-center text-muted-foreground">
                                <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin" />
                                <p>Loading alerts...</p>
                            </div>
                        ) : filteredAlerts.filter(a => !a.acknowledged).length === 0 && hasActiveFilters ? (
                            <div className="py-12 text-center text-muted-foreground">
                                <Filter className="mx-auto mb-4 h-12 w-12 opacity-40" />
                                <p className="font-medium">No alerts match your filters</p>
                                <p className="mt-1 text-sm">Try adjusting your search or filter criteria.</p>
                                <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
                                    <X className="mr-2 h-4 w-4" />
                                    Clear Filters
                                </Button>
                            </div>
                        ) : unacknowledgedAlerts.length > 0 ? (
                            unacknowledgedAlerts.map((alert) => {
                                const borderColor =
                                    alert.urgency === 'critical' ? 'border-l-destructive' :
                                    alert.urgency === 'high' ? 'border-l-primary' :
                                    alert.urgency === 'medium' ? 'border-l-primary/70' :
                                    'border-l-muted-foreground';
                                return (
                                <div key={alert.id} className={`space-y-3 rounded-lg border border-[#2a2a2e] bg-[#0d0d10]/60 p-4 border-l-4 ${borderColor} transition-all duration-200 hover:border-[#3a3a3e]`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={bulkSelected.includes(alert.id)}
                                                onChange={() => toggleBulkSelect(alert.id)}
                                                className="rounded"
                                            />
                                            {getUrgencyIcon(alert.urgency)}
                                            <div>
                                                <p className="font-medium text-foreground">{alert.item_name || `Item #${alert.item_id}`}</p>
                                                <p className="text-sm text-muted-foreground">{alert.category || alert.alert_type}</p>
                                            </div>
                                        </div>
                                        {getUrgencyBadge(alert.urgency)}
                                    </div>

                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>Current Stock: {alert.current_stock}</span>
                                        <span>Threshold: {alert.reorder_level}</span>
                                    </div>

                                    <div className="h-2 w-full rounded-full bg-muted">
                                        <div
                                            className="h-2 rounded-full bg-destructive"
                                            style={{ width: `${Math.min((alert.current_stock / Math.max(alert.reorder_level, 1)) * 100, 100)}%` }}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">
                                            Created: {new Date(alert.created_at).toLocaleDateString()}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {acknowledgeWithNoteId === alert.id && (
                                                <Input
                                                    placeholder="Add note..."
                                                    value={acknowledgeNote}
                                                    onChange={(e) => setAcknowledgeNote(e.target.value)}
                                                    className="h-8 w-40 text-xs"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleAcknowledgeAlert(alert.id, acknowledgeNote);
                                                        if (e.key === 'Escape') { setAcknowledgeWithNoteId(null); setAcknowledgeNote(''); }
                                                    }}
                                                />
                                            )}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => {
                                                    if (acknowledgeWithNoteId === alert.id) {
                                                        setAcknowledgeWithNoteId(null);
                                                        setAcknowledgeNote('');
                                                    } else {
                                                        setAcknowledgeWithNoteId(alert.id);
                                                        setAcknowledgeNote('');
                                                    }
                                                }}
                                                className="text-xs text-muted-foreground hover:text-foreground"
                                            >
                                                + Note
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => handleAcknowledgeAlert(alert.id, acknowledgeNote)}
                                                disabled={actionLoading === `acknowledge-${alert.id}`}
                                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                                            >
                                                {actionLoading === `acknowledge-${alert.id}` ? 'Processing...' : 'Acknowledge'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                );
                            })
                        ) : (
                            <div className="py-12 text-center text-muted-foreground">
                                <Shield className="mx-auto mb-4 h-12 w-12 text-primary opacity-60" />
                                <p className="font-medium">All items are well stocked</p>
                                <p className="mt-1 text-sm">No alerts require your attention right now.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="profile-card rounded-xl">
                    <div className="p-5 pb-3">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-foreground">Reviewed Alerts</h3>
                        </div>
                    </div>
                    <div className="space-y-4 p-5 pt-0">
                        {loading ? (
                            <div className="py-8 text-center text-muted-foreground">
                                <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin" />
                                <p>Loading alerts...</p>
                            </div>
                        ) : acknowledgedAlerts.length > 0 ? (
                            acknowledgedAlerts.map((alert) => (
                                <div key={alert.id} className="space-y-3 rounded-lg border border-[#2a2a2e] bg-[#0d0d10]/60 p-4 opacity-75">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-primary" />
                                            <div>
                                                <p className="font-medium text-foreground">{alert.item_name || `Item #${alert.item_id}`}</p>
                                                <p className="text-sm text-muted-foreground">{alert.category || alert.alert_type}</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline">Acknowledged</Badge>
                                    </div>

                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span>Stock: {alert.current_stock}</span>
                                        <span>
                                            Acknowledged: {alert.acknowledged_at ? new Date(alert.acknowledged_at).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : filteredAlerts.filter(a => a.acknowledged).length === 0 && hasActiveFilters ? (
                            <div className="py-12 text-center text-muted-foreground">
                                <Filter className="mx-auto mb-4 h-12 w-12 opacity-40" />
                                <p className="font-medium">No reviewed alerts match your filters</p>
                                <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
                                    <X className="mr-2 h-4 w-4" />
                                    Clear Filters
                                </Button>
                            </div>
                        ) : (
                            <div className="py-12 text-center text-muted-foreground">
                                <CheckCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-40" />
                                <p className="font-medium">No reviewed alerts yet</p>
                                <p className="mt-1 text-sm">Acknowledged alerts will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Alert Trends Chart */}
            <div className="profile-card rounded-xl">
                <div className="p-5">
                    <div className="mb-3 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-semibold text-foreground">Alert Trends</h3>
                    </div>
                    <AlertTrendsChart />
                </div>
            </div>
        </div>
    );
}
