import CustomerLayout from '@/components/layout/customer-layout';
import { type BreadcrumbItem } from '@/types';
import { Minus, Plus, Search, ShoppingCart, Trash2, X } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/customer' },
    { title: 'My Services', href: '/customer/my-services' },
];

const productCategories = ['All', 'Oil & Fluids', 'Filters', 'Brakes', 'Accessories'] as const;

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    inStock: boolean;
}

interface CartItem {
    product: Product;
    quantity: number;
}

const sampleProducts: Product[] = [
    { id: 1, name: 'Synthetic Engine Oil 5W-30', description: '1 Liter - Full synthetic motor oil', price: 650, category: 'Oil & Fluids', inStock: true },
    { id: 2, name: 'Oil Filter Standard', description: 'Universal fit oil filter', price: 280, category: 'Filters', inStock: true },
    { id: 3, name: 'Brake Pad Set (Front)', description: 'Ceramic brake pads for front axle', price: 1800, category: 'Brakes', inStock: true },
    { id: 4, name: 'Coolant Fluid 1L', description: 'Long-life antifreeze coolant', price: 350, category: 'Oil & Fluids', inStock: true },
    { id: 5, name: 'Air Filter', description: 'Engine air filter replacement', price: 450, category: 'Filters', inStock: true },
    { id: 6, name: 'Brake Fluid DOT 4', description: '500ml high-performance brake fluid', price: 320, category: 'Oil & Fluids', inStock: true },
    { id: 7, name: 'Brake Disc Rotor (Rear)', description: 'Ventilated disc rotor pair', price: 3200, category: 'Brakes', inStock: false },
    { id: 8, name: 'Cabin Air Filter', description: 'Activated carbon cabin filter', price: 550, category: 'Filters', inStock: true },
    { id: 9, name: 'Car Phone Mount', description: 'Magnetic dashboard phone holder', price: 450, category: 'Accessories', inStock: true },
    { id: 10, name: 'Dash Camera HD', description: '1080p front-facing dash cam', price: 2800, category: 'Accessories', inStock: true },
    { id: 11, name: 'Transmission Fluid ATF', description: '1 Liter automatic transmission fluid', price: 580, category: 'Oil & Fluids', inStock: true },
    { id: 12, name: 'Wiper Blades (Pair)', description: 'All-weather silicone wiper blades', price: 750, category: 'Accessories', inStock: true },
];

export default function MyServices() {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [cartOpen, setCartOpen] = useState(false);

    const filtered = sampleProducts.filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const addToCart = (product: Product) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.product.id === product.id);
            if (existing) {
                return prev.map((item) => (item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
            }
            return [...prev, { product, quantity: 1 }];
        });
        setCartOpen(true);
    };

    const updateQuantity = (productId: number, delta: number) => {
        setCart((prev) =>
            prev
                .map((item) => (item.product.id === productId ? { ...item, quantity: item.quantity + delta } : item))
                .filter((item) => item.quantity > 0),
        );
    };

    const removeFromCart = (productId: number) => {
        setCart((prev) => prev.filter((item) => item.product.id !== productId));
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1">
                {/* Main Content */}
                <div className="flex flex-1 flex-col gap-6 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">My Services</h1>
                            <p className="text-muted-foreground">Browse and purchase products for your vehicle.</p>
                        </div>
                        <button
                            onClick={() => setCartOpen(!cartOpen)}
                            className="relative rounded-lg border p-2.5 transition-colors hover:bg-accent lg:hidden"
                        >
                            <ShoppingCart className="h-5 w-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#d4af37] text-xs font-bold text-black">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Search & Filters */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="flex h-10 w-full rounded-lg border border-input bg-background px-9 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {productCategories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
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

                    {/* Products Grid */}
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {filtered.map((product) => (
                            <div key={product.id} className="rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
                                <div className="mb-2 flex items-start justify-between">
                                    <span className="rounded-md bg-[#d4af37]/10 px-2 py-1 text-xs font-medium text-[#d4af37]">{product.category}</span>
                                    {!product.inStock && (
                                        <span className="rounded-md bg-red-500/10 px-2 py-1 text-xs font-medium text-red-500">Out of Stock</span>
                                    )}
                                </div>
                                <h3 className="text-base font-semibold">{product.name}</h3>
                                <p className="mt-1 text-sm text-muted-foreground">{product.description}</p>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-xl font-bold">₱{product.price.toLocaleString()}</span>
                                    <button
                                        onClick={() => addToCart(product)}
                                        disabled={!product.inStock}
                                        className="rounded-lg bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#e6c24e] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div className="flex items-center justify-center py-12 text-muted-foreground">
                            <p>No products found matching your criteria.</p>
                        </div>
                    )}
                </div>

                {/* Cart Sidebar */}
                <div
                    className={`fixed inset-y-0 right-0 z-40 w-80 transform border-l bg-background shadow-xl transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 lg:shadow-none ${
                        cartOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                >
                    <div className="flex h-full flex-col">
                        <div className="flex items-center justify-between border-b p-4">
                            <h2 className="flex items-center gap-2 text-lg font-semibold">
                                <ShoppingCart className="h-5 w-5" />
                                Cart ({cartCount})
                            </h2>
                            <button onClick={() => setCartOpen(false)} className="lg:hidden">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            {cart.length === 0 ? (
                                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Your cart is empty</div>
                            ) : (
                                <div className="space-y-3">
                                    {cart.map((item) => (
                                        <div key={item.product.id} className="rounded-lg border p-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{item.product.name}</p>
                                                    <p className="text-sm text-muted-foreground">₱{item.product.price.toLocaleString()}</p>
                                                </div>
                                                <button onClick={() => removeFromCart(item.product.id)} className="text-muted-foreground hover:text-red-500">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <div className="mt-2 flex items-center gap-2">
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, -1)}
                                                    className="rounded border p-1 hover:bg-accent"
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="min-w-[2rem] text-center text-sm font-medium">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, 1)}
                                                    className="rounded border p-1 hover:bg-accent"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                                <span className="ml-auto text-sm font-semibold">
                                                    ₱{(item.product.price * item.quantity).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="border-t p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="font-medium">Total</span>
                                    <span className="text-xl font-bold">₱{cartTotal.toLocaleString()}</span>
                                </div>
                                <button className="w-full rounded-lg bg-[#d4af37] py-2.5 text-sm font-semibold text-black transition-colors hover:bg-[#e6c24e]">
                                    Proceed to Checkout
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Overlay for mobile cart */}
                {cartOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setCartOpen(false)} />}
            </div>
        </CustomerLayout>
    );
}
