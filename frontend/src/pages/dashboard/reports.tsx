import AppLayout from '@/components/layout/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Construction } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Reports and Analytics', href: '/reports' }];

export default function Reports() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex min-h-full flex-col items-center justify-center gap-4 p-5">
                <Construction className="h-16 w-16 text-muted-foreground" />
                <h1 className="text-2xl font-bold">Reports and Analytics</h1>
                <p className="text-muted-foreground">This page is under construction.</p>
            </div>
        </AppLayout>
    );
}
