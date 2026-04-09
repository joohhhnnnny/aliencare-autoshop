import PublicFooter from '@/components/shared/public-footer';
import PublicNavbar from '@/components/shared/public-navbar';
import { useState } from 'react';

const faqs = [
    {
        question: 'What types of vehicles do you service?',
        answer: 'We service all makes and models, including sedans, SUVs, trucks, and light commercial vehicles. Whether you drive a Honda, Toyota, Ford, or any other brand, our certified technicians have the expertise to handle it.',
    },
    {
        question: 'How do I schedule a service appointment?',
        answer: 'You can schedule an appointment by signing up on our platform and creating a job order through the dashboard. Alternatively, you can call us directly or walk in during business hours.',
    },
    {
        question: 'What are your operating hours?',
        answer: 'We are open Monday through Saturday, 8:00 AM to 6:00 PM. We are closed on Sundays and public holidays.',
    },
    {
        question: 'Do you offer warranty on repairs?',
        answer: "Yes, all our repairs come with a warranty. Parts replacements carry the manufacturer's warranty, and our labor is guaranteed for 30 days or 1,000 km, whichever comes first.",
    },
    {
        question: 'How long does a typical service take?',
        answer: "Service times vary depending on the type of work. An oil change takes about 30-45 minutes, while more complex repairs like engine diagnostics or brake replacement may take a few hours. We'll give you an estimated completion time when you drop off your vehicle.",
    },
    {
        question: 'Do you provide a cost estimate before starting work?',
        answer: 'Absolutely. We perform a thorough inspection and provide a detailed cost estimate before any work begins. No repairs are done without your approval, and there are no hidden fees.',
    },
    {
        question: "Can I track my vehicle's service status?",
        answer: "Yes! Once you have an account, you can track the progress of your job order in real time through your dashboard. You'll also receive notifications when your vehicle is ready for pickup.",
    },
    {
        question: 'What payment methods do you accept?',
        answer: 'We accept cash, credit/debit cards, GCash, Maya, and bank transfers. Payment details are available through our billing system on the dashboard.',
    },
];

export default function FAQs() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <>
            <PublicNavbar activePage="faqs" />

            <div className="flex min-h-screen flex-col items-center overflow-x-hidden bg-gradient-to-br from-[#242424] to-[#000000] p-6 text-[#EDEDEC] lg:p-8">
                {/* Spotlight Effect */}
                <div className="pointer-events-none absolute top-0 left-1/2 z-0 h-screen w-full max-w-full -translate-x-1/2 overflow-hidden">
                    <div className="bg-gradient-radial absolute top-0 left-1/2 h-64 w-[1603px] max-w-[200vw] -translate-x-1/2 rounded-full from-yellow-200/25 via-yellow-100/15 to-transparent blur-3xl"></div>
                </div>

                <div className="h-24"></div>

                <main className="relative z-10 w-full max-w-3xl px-4">
                    <div className="mb-16 text-center">
                        <h1 className="mb-4 text-5xl font-bold text-[#D9AF01]">Frequently Asked Questions</h1>
                        <p className="text-xl text-gray-400">Got questions? We've got answers.</p>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="rounded-lg border border-white/10 bg-[#625959]/10 backdrop-blur-sm">
                                <button onClick={() => toggle(index)} className="flex w-full items-center justify-between px-6 py-5 text-left">
                                    <span className="text-lg font-medium text-[#EDEDEC]">{faq.question}</span>
                                    <span
                                        className={`ml-4 text-[#D9AF01] transition-transform duration-300 ${openIndex === index ? 'rotate-45' : ''}`}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="10" y1="4" x2="10" y2="16" />
                                            <line x1="4" y1="10" x2="16" y2="10" />
                                        </svg>
                                    </span>
                                </button>
                                <div className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96 pb-6' : 'max-h-0'}`}>
                                    <p className="px-6 text-base leading-relaxed text-gray-400">{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>

                <div className="h-16"></div>
            </div>

            <PublicFooter />
        </>
    );
}
