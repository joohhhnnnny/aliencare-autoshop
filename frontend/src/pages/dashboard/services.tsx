import AppLayout from '@/components/layout/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Construction } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Services', href: '/services' }];

export default function Services() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 p-8">
                <Construction className="h-16 w-16 text-muted-foreground" />
                <h1 className="text-2xl font-bold">Services</h1>
                <p className="text-muted-foreground">This page is under construction.</p>
            </div>
        </AppLayout>
    );
}
