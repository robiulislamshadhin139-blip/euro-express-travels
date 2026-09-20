
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';
import { FAQItem, INITIAL_FAQS, SiteConfig } from '../types';

interface FAQProps {
  faqs?: FAQItem[];
  config?: SiteConfig;
}

export default function FAQ({ faqs = INITIAL_FAQS, config }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const activeFaqs = faqs && faqs.length > 0 ? faqs : INITIAL_FAQS;

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>Common Questions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-blue-950">Frequently Asked Questions</h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
            Everything you need to know about our visa processing, flight bookings, and documentation procedures.
          </p>
        </div>

        <div className="space-y-4">
          {activeFaqs.map((faq, index) => (
            <div
              key={faq.id || index}
              className="border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 sm:p-6 text-left bg-white hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span className="font-bold text-slate-900 text-sm sm:text-base pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-5 sm:p-6 pt-0 text-slate-600 text-sm leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Quick Help box */}
        {config?.whatsappNumber && (
          <div className="mt-12 p-6 rounded-2xl bg-blue-50/70 border border-blue-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <h4 className="text-sm font-bold text-blue-950">Still have questions?</h4>
              <p className="text-xs text-slate-600 mt-0.5">Our consultants are available right now on WhatsApp for instant assistance.</p>
            </div>
            <a
              href={`https://wa.me/${config.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Ask on WhatsApp</span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
