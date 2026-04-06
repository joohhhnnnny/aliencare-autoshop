import CustomerLayout from '@/components/layout/customer-layout';
import { type BreadcrumbItem } from '@/types';
import { Clock, Search, Star } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/customer' },
    { title: 'Services', href: '/customer/services' },
];

const categories = ['All', 'Maintenance', 'Cleaning', 'Repair'] as const;

interface Service {
    id: number;
    name: string;
    description: string;
    price: number;
    duration: string;
    rating: number;
    category: string;
    image?: string;
}

const sampleServices: Service[] = [
    { id: 1, name: 'Oil Change', description: 'Full synthetic oil change with filter replacement', price: 1500, duration: '30 min', rating: 4.8, category: 'Maintenance' },
    { id: 2, name: 'Brake Inspection', description: 'Complete brake system inspection and adjustment', price: 800, duration: '45 min', rating: 4.7, category: 'Maintenance' },
    { id: 3, name: 'Full Detail Wash', description: 'Interior and exterior deep cleaning', price: 2500, duration: '2 hrs', rating: 4.9, category: 'Cleaning' },
    { id: 4, name: 'Engine Tune-Up', description: 'Comprehensive engine diagnostics and tuning', price: 3500, duration: '1.5 hrs', rating: 4.6, category: 'Repair' },
    { id: 5, name: 'Tire Rotation', description: 'Rotate and balance all four tires', price: 600, duration: '30 min', rating: 4.5, category: 'Maintenance' },
    { id: 6, name: 'Interior Cleaning', description: 'Deep vacuum, dashboard wipe, and deodorize', price: 1200, duration: '1 hr', rating: 4.8, category: 'Cleaning' },
    { id: 7, name: 'AC Repair', description: 'Air conditioning diagnostics and repair', price: 4000, duration: '2 hrs', rating: 4.4, category: 'Repair' },
    { id: 8, name: 'Battery Replacement', description: 'Battery test and replacement service', price: 5500, duration: '30 min', rating: 4.7, category: 'Repair' },
    { id: 9, name: 'Undercoating', description: 'Protective undercoating application', price: 3000, duration: '1.5 hrs', rating: 4.6, category: 'Cleaning' },
];

export default function CustomerServices() {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('All');

    const filtered = sampleServices.filter((s) => {
        const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = activeCategory === 'All' || s.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Services</h1>
                    <p className="text-muted-foreground">Browse and book our available services.</p>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search services..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex h-10 w-full rounded-lg border border-input bg-background px-9 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        />
                    </div>
                    <div className="flex gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                    activeCategory === cat
                                        ? 'bg-[#d4af37] text-black'
                                        : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Services Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((service) => (
                        <div key={service.id} className="group rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
                            <div className="mb-3 flex items-start justify-between">
                                <span className="rounded-md bg-[#d4af37]/10 px-2 py-1 text-xs font-medium text-[#d4af37]">{service.category}</span>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Star className="h-3.5 w-3.5 fill-[#d4af37] text-[#d4af37]" />
                                    {service.rating}
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold">{service.name}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">{service.description}</p>
                            <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {service.duration}
                                </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-xl font-bold">₱{service.price.toLocaleString()}</span>
                                <button className="rounded-lg bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#e6c24e]">
                                    Book Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className="flex items-center justify-center py-12 text-muted-foreground">
                        <p>No services found matching your criteria.</p>
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
