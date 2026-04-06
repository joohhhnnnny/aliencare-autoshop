import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { LucideBell, Settings, UserCircle2 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export function CustomerNavMain({ items = [] }: { items: NavItem[] }) {
    const { pathname } = useLocation();
    const navigate = useNavigate();

    return (
        <SidebarGroup className="-mt-2 px-2 py-0">
            <SidebarGroupLabel className="mb-0 justify-center text-center text-base text-sidebar-primary group-data-[collapsible=icon]:hidden">Customer</SidebarGroupLabel>

            {/* Icons Row */}
            <div className="flex items-center justify-center gap-4 px-2 pb-6 pt-1 group-data-[collapsible=icon]:pb-2 group-data-[collapsible=icon]:pt-0">
                <UserCircle2
                    className="h-5 w-5 cursor-pointer text-white transition-colors hover:text-sidebar-primary"
                    onClick={() => navigate('/customer/profile')}
                />
                <Settings className="h-5 w-5 cursor-pointer text-white transition-colors hover:text-sidebar-primary" />
                <LucideBell className="h-5 w-5 cursor-pointer text-white transition-colors hover:text-sidebar-primary" />
            </div>

            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={item.href === '/customer' ? pathname === '/customer' : pathname.startsWith(item.href)}
                            tooltip={{ children: item.title }}
                        >
                            <Link to={item.href}>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
