import { NavFooter } from '@/components/shared/nav-footer';
import { NavUser } from '@/components/shared/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Home, LogOut, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppLogo from './app-logo';
import { AdminNavMain } from './admin-nav-main';

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
];

const footerNavItems: NavItem[] = [
    {
        title: 'Sign Out',
        href: '#',
        icon: LogOut,
    },
];

export function AdminSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="m-0 p-0">
                <SidebarMenu className="m-0 p-0">
                    <SidebarMenuItem className="m-0 p-0">
                        <Link to="/admin" className="block h-full w-full">
                            <AppLogo />
                        </Link>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <AdminNavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
