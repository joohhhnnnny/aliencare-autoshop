import { type NavItem } from '@/types';
import { CalendarClock, Home, Users } from 'lucide-react';
import { AppSharedSidebar } from './app-shared-sidebar';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/admin',
        icon: Home,
    },
    {
        title: 'Front Desk Accounts',
        href: '/admin/frontdesk-accounts',
        icon: Users,
    },
    {
        title: 'Booking Slots',
        href: '/admin/booking-slots',
        icon: CalendarClock,
    },
];

export function AdminSidebar() {
    return (
        <AppSharedSidebar
            navItems={mainNavItems}
            role="Admin"
            profileHref="/admin/profile"
            settingsHref="/admin/settings"
            notificationsHref="/admin/notifications"
            homeHref="/admin"
        />
    );
}
