import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { CreditCard, Home, LogOut, ScrollText, ShoppingCart, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLogo from './app-logo';
import { CustomerNavMain } from './customer-nav-main';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/customer',
        icon: Home,
    },
    {
        title: 'Services',
        href: '/customer/services',
        icon: Wrench,
    },
    {
        title: 'My Services',
        href: '/customer/my-services',
        icon: ShoppingCart,
    },
    {
        title: 'Billing & Payment',
        href: '/customer/billing',
        icon: CreditCard,
    },
    {
        title: 'Logs',
        href: '/customer/logs',
        icon: ScrollText,
    },
];

export function CustomerSidebar() {
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
                <CustomerNavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={handleSignOut}
                            tooltip={{ children: 'Sign Out' }}
                        >
                            <LogOut />
                            <span>Sign Out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
