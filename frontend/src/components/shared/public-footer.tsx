import { Link } from "react-router-dom";

export default function PublicFooter() {
  return (
    <footer className="w-full border-t border-white/10 bg-black">
      <div className="mx-auto max-w-6xl px-8 py-16">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Brand */}
          <div>
            <Link to="/" className="mb-4 inline-block">
              <img
                src="/images/iconlogo.svg"
                alt="AlienCare Auto Shop Logo"
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              Your car deserves cosmic-level care. AlienCare Autoshop is the
              trusted pit stop for drivers who want the best.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wider text-[#D9AF01] uppercase">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-sm text-gray-400 transition-colors duration-300 hover:text-[#D9AF01]"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-sm text-gray-400 transition-colors duration-300 hover:text-[#D9AF01]"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/#services"
                  className="text-sm text-gray-400 transition-colors duration-300 hover:text-[#D9AF01]"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  to="/faqs"
                  className="text-sm text-gray-400 transition-colors duration-300 hover:text-[#D9AF01]"
                >
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-wider text-[#D9AF01] uppercase">
              Contact Us
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-[#D9AF01]">&#9679;</span>
                TBCI Compound Purok 13 Terminal Ma-a Davao City, Davao City, Philippines, 8000
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-[#D9AF01]">&#9679;</span>
                (+63) 954 160 0424
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-[#D9AF01]">&#9679;</span>
                info@aliencare-autoshop.com
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-white/10 px-8 py-6">
        <p className="text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} AlienCare Autoshop. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
