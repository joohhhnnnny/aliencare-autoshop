import AdminSidebarLayout from '@/components/layout/admin/admin-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';

interface AdminLayoutProps {
    children?: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AdminLayoutProps) => (
    <AdminSidebarLayout breadcrumbs={breadcrumbs} {...props}>
        {children || <Outlet />}
    </AdminSidebarLayout>
);
