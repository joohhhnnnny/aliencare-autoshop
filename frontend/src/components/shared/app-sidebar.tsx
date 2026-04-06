import { NavMain } from '@/components/shared/nav-main';
import { NavUser } from '@/components/shared/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { BarChart4, FoldersIcon, Home, LogOut, LucideFileBarChart2, LucideReceiptText, Package, Tags, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: Home,
    },
    {
        title: 'Services',
        href: '/services',
        icon: FoldersIcon,
    },
    {
        title: 'Job Orders',
        href: '/job-orders',
        icon: Tags,
    },
    {
        title: 'Point of Sale',
        href: '/pos',
        icon: BarChart4,
    },
    {
        title: 'Billing & Payment',
        href: '/billing',
        icon: LucideReceiptText,
    },
    {
        title: 'Inventory',
        href: '/inventory',
        icon: Package,
    },
    {
        title: 'Customers',
        href: '/customers',
        icon: Users,
    },
    {
        title: 'Reports and Analytics',
        href: '/reports',
        icon: LucideFileBarChart2,
    },
];

export function AppSidebar() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { toggleSidebar, state } = useSidebar();

    const handleSignOut = async () => {
        await logout();
        navigate('/');
    };

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader className="m-0 p-0">
                <SidebarMenu className="m-0 p-0">
                    <SidebarMenuItem className="m-0 p-0">
                        <button onClick={toggleSidebar} className="block h-full w-full cursor-pointer">
                            {state === 'collapsed'
                                ? <img src="/images/iconlogo.svg" alt="AlienCare AutoShop" className="block h-full w-full object-contain p-1" />
                                : <AppLogo />
                            }
                        </button>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={handleSignOut}
                            tooltip={{ children: 'Sign Out' }}
                            className="text-sidebar-foreground hover:text-sidebar-accent"
                        >
                            <LogOut />
                            <span>Sign Out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
