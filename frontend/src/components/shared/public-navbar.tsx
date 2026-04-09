import { useAuth } from '@/context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

interface PublicNavbarProps {
    activePage?: 'home' | 'about' | 'services' | 'faqs';
}

export default function PublicNavbar({ activePage }: PublicNavbarProps) {
    const { user } = useAuth();
    const location = useLocation();

    const linkClass = (page: string) =>
        `text-sm leading-normal transition-colors duration-300 ${activePage === page ? 'text-[#D9AF01]' : 'text-[#EDEDEC] hover:text-[#D9AF01]'}`;

    const handleAnchorClick = (e: React.MouseEvent, hash: string) => {
        if (location.pathname === '/') {
            e.preventDefault();
            const el = document.getElementById(hash);
            if (el) {
                window.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
            }
        }
    };

    return (
        <header className="fixed top-0 right-0 left-0 z-50 w-full px-8 pt-6 text-sm lg:px-16">
            <nav className="flex items-center justify-between rounded-lg bg-[#625959]/20 px-6 py-4 backdrop-blur-md">
                <div className="flex items-center gap-10">
                    <Link to="/" className="flex items-center">
                        <img src="/images/iconlogo.svg" alt="AlienCare Auto Shop Logo" className="h-10 w-auto" />
                    </Link>
                    <Link to="/" className={linkClass('home')}>
                        Home
                    </Link>
                    <Link to="/#about" className={linkClass('about')} onClick={(e) => handleAnchorClick(e, 'about')}>
                        About Us
                    </Link>
                    <Link to="/#services" className={linkClass('services')} onClick={(e) => handleAnchorClick(e, 'services')}>
                        Services
                    </Link>
                    <Link to="/faqs" className={linkClass('faqs')}>
                        FAQs
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <Link
                            to="/dashboard"
                            className="inline-block rounded-sm border border-[#EDEDEC]/30 px-5 py-1.5 text-sm leading-normal text-[#EDEDEC] transition-all duration-300 hover:border-[#D9AF01] hover:text-[#D9AF01]"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="inline-block rounded-sm border border-[#EDEDEC]/30 px-5 py-1.5 text-sm leading-normal font-bold text-[#EDEDEC] transition-all duration-300 hover:border-[#D9AF01] hover:text-[#D9AF01]"
                            >
                                Log in
                            </Link>
                            <Link
                                to="/register"
                                className="inline-block rounded-sm bg-[#D9AF01] px-5 py-1.5 text-sm leading-normal font-bold text-[#1b1b18] transition-all duration-300 hover:bg-[#c29d01]"
                            >
                                Sign up
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}
