import { createContext, useContext, ReactNode } from 'react';
import { useAlerts, UseAlertsReturn } from '../hooks/useAlerts';

const AlertContext = createContext<UseAlertsReturn | null>(null);

export function AlertProvider({ children }: { children: ReactNode }) {
    const alerts = useAlerts();

    return <AlertContext.Provider value={alerts}>{children}</AlertContext.Provider>;
}

export function useAlertContext(): UseAlertsReturn {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlertContext must be used within an AlertProvider');
    }
    return context;
}
