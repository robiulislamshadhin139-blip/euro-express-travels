import { motion } from 'framer-motion';
import { Star, BadgeCheck, ChevronRight, ChevronLeft } from 'lucide-react';
import { Review } from '../types';
import { useRef, useState, useEffect } from 'react';

const GoogleLogo = ({ size = 24 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M23.7449 12.27C23.7449 11.48 23.6749 10.73 23.5549 10H12.2148V14.51H18.7248C18.4348 15.99 17.5848 17.24 16.3248 18.09V21.09H20.2148C22.4749 19.01 23.7449 15.92 23.7449 12.27Z"/>
    <path fill="#34A853" d="M12.2148 24C15.4548 24 18.1848 22.93 20.2148 21.09L16.3248 18.09C15.2248 18.83 13.8448 19.25 12.2148 19.25C9.0748 19.25 6.4248 17.14 5.4648 14.29H1.44482V17.4C3.43482 21.36 7.4848 24 12.2148 24Z"/>
    <path fill="#FBBC05" d="M5.4648 14.29C5.2148 13.56 5.0748 12.79 5.0748 12C5.0748 11.21 5.2148 10.44 5.4648 9.71V6.6H1.44482C0.624824 8.23 0.144824 10.06 0.144824 12C0.144824 13.94 0.624824 15.77 1.44482 17.4L5.4648 14.29Z"/>
    <path fill="#EA4335" d="M12.2148 4.75C13.9848 4.75 15.5648 5.36 16.8048 6.54L20.2948 3.05C18.1748 1.08 15.4548 0 12.2148 0C7.4848 0 3.43482 2.64 1.44482 6.6L5.4648 9.71C6.4248 6.86 9.0748 4.75 12.2148 4.75Z"/>
  </svg>
);

interface ReviewsProps {
  reviews: Review[];
}

export default function Reviews({ reviews }: ReviewsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [displayReviews, setDisplayReviews] = useState<Review[]>(reviews);
  const [googleStats, setGoogleStats] = useState<{ rating: number; total: number } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  useEffect(() => {
    // Attempt to load real Google Reviews securely from backend with resilient endpoint fallback
    const endpoints = window.location.hostname.includes('netlify.app')
      ? ['/.netlify/functions/google-reviews', '/api/google-reviews']
      : ['/api/google-reviews', '/.netlify/functions/google-reviews'];

    const loadReviews = async () => {
      for (const ep of endpoints) {
        try {
          const res = await fetch(ep);
          if (res.ok) {
            const data = await res.json().catch(() => null);
            if (data && data.reviews && data.reviews.length > 0) {
              setDisplayReviews(data.reviews);
              setGoogleStats({ rating: data.rating, total: data.total });
              break;
            }
          }
        } catch (e) {
          console.warn(`Could not load reviews from ${ep}:`, e);
        }
      }
    };

    loadReviews();
  }, []);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      if (scrollWidth <= clientWidth) {
        setActiveIndex(0);
        return;
      }
      const maxScroll = scrollWidth - clientWidth;
      const scrollPercentage = scrollLeft / maxScroll;
      const totalDots = displayReviews.length;
      const dotIndex = Math.round(scrollPercentage * (totalDots - 1));
      setActiveIndex(dotIndex);
    }
  };

  const scrollToDot = (index: number) => {
    if (scrollRef.current && displayReviews.length > 1) {
      const { scrollWidth, clientWidth } = scrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      const targetScroll = (index / (displayReviews.length - 1)) * maxScroll;
      scrollRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -350 : 350;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Fallback to static props if Google API didn't return rating summary
  const avgRating = googleStats ? googleStats.rating.toFixed(1) : (displayReviews.length ? (displayReviews.reduce((acc, r) => acc + r.rating, 0) / displayReviews.length).toFixed(1) : "5.0");
  const numReviews = googleStats ? googleStats.total : (displayReviews.length || 0);

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Block - Static Google Design */}
        <div className="mb-10 max-w-5xl mx-auto">
          {/* Tabs Area */}
          <div className="flex items-center gap-8 border-b border-slate-200 pb-4 mb-8">
             <div className="flex items-center gap-2 border-b-2 border-[#C89B7B] pb-4 -mb-[18px]">
                <GoogleLogo size={20} />
                <span className="font-bold text-slate-800 text-sm sm:text-base">Google Reviews</span>
             </div>

          </div>
          
          {/* Summary Container */}
          <div className="bg-[#F8F9FA] rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <GoogleLogo size={28} />
                <span className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">Reviews</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl font-bold text-slate-900">{avgRating}</span>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 sm:w-6 sm:h-6 ${i < Math.round(Number(avgRating)) ? 'fill-[#005149] text-[#005149]' : 'fill-slate-300 text-slate-300'}`} />
                  ))}
                </div>
                <span className="text-slate-500 font-medium text-sm">({numReviews})</span>
              </div>
            </div>
            
            <a 
              href="https://share.google/k8aE75VgEgJd2w028"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#C89B7B] hover:bg-[#B3886A] text-white text-sm font-semibold rounded-full transition-colors w-full sm:w-auto flex-shrink-0"
            >
              Review us on Google
            </a>
          </div>
        </div>

        {/* Scrollable Reviews Cards */}
        <div className="max-w-5xl mx-auto relative group">
          <button 
            onClick={() => scroll('left')}
            className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all z-10 hidden sm:flex"
            aria-label="Previous reviews"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 pt-4 px-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {displayReviews.map((review, index) => {
              const initial = review.name.charAt(0).toUpperCase();
              const colors = ['bg-[#6F777B]', 'bg-[#F26D21]', 'bg-[#964B00]', 'bg-[#673AB7]', 'bg-[#1976D2]', 'bg-[#E91E63]'];
              const bgColor = colors[index % colors.length];

              return (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="snap-start flex-shrink-0 w-[300px] sm:w-[320px] p-6 rounded-xl bg-[#F8F9FA] flex flex-col hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <div className={`w-11 h-11 rounded-full ${bgColor} text-white flex items-center justify-center font-bold text-lg`}>
                        {initial}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-[2px] shadow-sm">
                        <GoogleLogo size={14} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-slate-900 text-[15px]">{review.name}</h4>
                        <BadgeCheck className="w-3.5 h-3.5 text-[#C89B7B]" />
                      </div>
                      <p className="text-xs text-slate-500">{review.date}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-[2px] mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < review.rating ? 'fill-[#005149] text-[#005149]' : 'fill-slate-300 text-slate-300'}`} 
                      />
                    ))}
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-slate-700 text-sm leading-[1.6] mb-2">
                      {review.comment}
                    </p>
                    {review.comment.length > 150 && (
                      <button className="text-[#C89B7B] hover:text-[#B3886A] text-sm font-medium transition-colors">
                        Read more
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <button 
            onClick={() => scroll('right')}
            className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all z-10 hidden sm:flex"
            aria-label="Next reviews"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          
          {/* Pagination dots (Dynamic) */}
          <div className="flex justify-center gap-2 mt-2">
            {displayReviews.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToDot(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === activeIndex 
                    ? 'bg-[#005149] w-4' 
                    : 'bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
