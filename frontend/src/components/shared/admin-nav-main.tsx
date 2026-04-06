import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { LucideBell, Settings, UserCircle2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function AdminNavMain({ items = [] }: { items: NavItem[] }) {
    const { pathname } = useLocation();

    return (
        <SidebarGroup className="-mt-2 px-2 py-0">
            <SidebarGroupLabel className="mb-0 justify-center text-center text-base text-sidebar-primary">Admin</SidebarGroupLabel>

            {/* Icons Row */}
            <div className="flex items-center justify-center gap-4 px-2 pb-2">
                <UserCircle2 className="h-5 w-5 cursor-pointer text-white transition-colors hover:text-sidebar-primary" />
                <Settings className="h-5 w-5 cursor-pointer text-white transition-colors hover:text-sidebar-primary" />
                <LucideBell className="h-5 w-5 cursor-pointer text-white transition-colors hover:text-sidebar-primary" />
            </div>

            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)}
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
