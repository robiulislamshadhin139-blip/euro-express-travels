/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'framer-motion';
import { ArrowRight, Plane } from 'lucide-react';

interface HeroProps {
  title: string;
  subtitle: string;
  heroBannerUrl?: string;
  onRequestService: () => void;
  onTalkToUs: () => void;
}

export default function Hero({ title, subtitle, heroBannerUrl, onRequestService, onTalkToUs }: HeroProps) {
  // Fallback to the default image if no URL is provided in config
  const bgImage = heroBannerUrl || "https://res.cloudinary.com/lbbij0gf/image/upload/v1789362853/ChatGPT_Image_Sep_14_2026_11_12_39_AM.png";

  return (
    <section className="relative min-h-[calc(100vh-64px)] md:min-h-[600px] overflow-hidden flex items-center pt-16 lg:pt-20">
      {/* Background Banner Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={bgImage} 
          alt="Euro Express Travels Banner" 
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-950/60 to-transparent"></div>
        <div className="absolute inset-0 bg-blue-950/20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-12 relative z-10 w-full flex flex-col lg:flex-row items-center gap-8 lg:gap-12 py-10 lg:py-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:w-2/3"
        >
          <span className="inline-block px-4 py-1.5 bg-blue-600/30 text-blue-300 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-500/30 mb-4 sm:mb-6">
            Premier Visa & Travel Consultancy
          </span>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-6 sm:mb-8 tracking-tighter">
            Global Reach, <br className="hidden sm:block" /><span className="text-blue-500 italic">Local Expertise.</span>
          </h1>
          <p className="text-blue-100/90 text-lg sm:text-xl max-w-lg mb-8 sm:mb-10 leading-relaxed font-medium">
            {subtitle}
          </p>
          <div className="flex flex-row gap-4">
            <button
              onClick={onRequestService}
              className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 sm:px-10 py-3 sm:py-5 text-sm sm:text-lg font-black text-white bg-blue-600 rounded-2xl hover:bg-blue-700 shadow-2xl shadow-blue-900/40 transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap"
            >
              Request Service
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={onTalkToUs}
              className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 sm:px-10 py-3 sm:py-5 text-sm sm:text-lg font-black text-blue-100 border-2 border-white/20 rounded-2xl hover:bg-white/10 transition-all active:scale-95 whitespace-nowrap"
            >
              Talk With Us
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:w-1/3 w-full"
        >
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-white w-full">
            <div className="text-xs uppercase tracking-widest opacity-60 mb-3 font-bold">Fastest Processing</div>
            <div className="text-2xl font-mono mb-4">EURO-EXP <span className="text-green-400 text-sm ml-2 font-sans font-bold">● Active</span></div>
            <div className="space-y-4">
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-blue-400"></div>
              </div>
              <p className="text-xs opacity-70">98% Success rate in Worldwide Visit Visa applications this month.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
