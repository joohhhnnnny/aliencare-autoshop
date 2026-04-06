import CustomerSidebarLayout from '@/components/layout/customer/customer-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';

interface CustomerLayoutProps {
    children?: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: CustomerLayoutProps) => (
    <CustomerSidebarLayout breadcrumbs={breadcrumbs} {...props}>
        {children || <Outlet />}
    </CustomerSidebarLayout>
);
