/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Reviews from './components/Reviews';
import Footer from './components/Footer';
import SEO from './components/SEO';
import { 
  INITIAL_CONFIG, INITIAL_SERVICES, INITIAL_REVIEWS, INITIAL_TEAM, INITIAL_FAQS,
  Service, SiteConfig, Review, TeamMember, FAQItem 
} from './types';
import { db, auth } from './lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

// Lazy load secondary routes & heavy modals for near-instant initial page loading
const About = lazy(() => import('./components/About'));
const HowItWorks = lazy(() => import('./components/HowItWorks'));
const FAQ = lazy(() => import('./components/FAQ'));
const Team = lazy(() => import('./components/Team'));
const ContactUs = lazy(() => import('./components/ContactUs'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const AIAssistantModal = lazy(() => import('./components/AIAssistantModal'));
const RequestServiceModal = lazy(() => import('./components/RequestServiceModal'));
const ServicePreviewModal = lazy(() => import('./components/ServicePreviewModal'));
const UserProfileModal = lazy(() => import('./components/UserProfileModal'));
const Login = lazy(() => import('./components/Login'));

const RouteFallback = () => (
  <div className="min-h-[40vh] flex items-center justify-center py-16">
    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// 2D Instant lightweight page wrapper - zero click delay
const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full">
    {children}
  </div>
);

// Synchronous local cache helpers for 0ms instant first load
const getCached = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const setCached = (key: string, val: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
};

export default function App() {
  const [config, setConfig] = useState<SiteConfig>(() => getCached('eet_cfg', INITIAL_CONFIG));
  const [services, setServices] = useState<Service[]>(() => getCached('eet_srv', INITIAL_SERVICES));
  const [reviews, setReviews] = useState<Review[]>(() => getCached('eet_rev', INITIAL_REVIEWS));
  const [team, setTeam] = useState<TeamMember[]>(() => getCached('eet_team', INITIAL_TEAM));
  const [faqs, setFaqs] = useState<FAQItem[]>(() => getCached('eet_faq', INITIAL_FAQS));
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>();
  const [isTalkToUs, setIsTalkToUs] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [previewService, setPreviewService] = useState<Service | null>(null);

  // Preload secondary routes and modals during browser idle time so clicking is instant
  useEffect(() => {
    const preloadRoutes = () => {
      import('./components/About');
      import('./components/HowItWorks');
      import('./components/FAQ');
      import('./components/Team');
      import('./components/ContactUs');
      import('./components/RequestServiceModal');
      import('./components/ServicePreviewModal');
      import('./components/Login');
    };
    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(preloadRoutes);
      } else {
        setTimeout(preloadRoutes, 600);
      }
    }
  }, []);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) setIsLoginOpen(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync data with Firestore
  useEffect(() => {
    let servicesUnsubscribe: () => void = () => {};
    let reviewsUnsubscribe: () => void = () => {};
    let teamUnsubscribe: () => void = () => {};
    let faqsUnsubscribe: () => void = () => {};
    let configUnsubscribe: () => void = () => {};

    const syncData = () => {
      try {
        const configRef = doc(db, 'settings', 'config');
        const seedStatusRef = doc(db, 'settings', 'seed_status');

        // 1. Sync Services (Real-time from Firestore) - attached immediately
        servicesUnsubscribe = onSnapshot(collection(db, 'services'), (snapshot) => {
          if (!snapshot.empty) {
            const servicesData: Service[] = [];
            snapshot.forEach((doc) => {
              servicesData.push({ ...doc.data(), id: doc.id } as Service);
            });
            
            // Sort by ID to ensure consistent creation order
            const sortedServices = servicesData.sort((a, b) => Number(a.id) - Number(b.id));
            
            // Apply fallback images by index if missing
            sortedServices.forEach((service, index) => {
              if (!service.imageUrl && INITIAL_SERVICES[index]?.imageUrl) {
                service.imageUrl = INITIAL_SERVICES[index].imageUrl;
              }
            });
            
            setServices(sortedServices);
            setCached('eet_srv', sortedServices);
          } else {
            setServices([]);
          }
        }, (error) => {
          console.warn("Services sync error:", error);
        });

        // 2. Sync Team Members (Real-time from Firestore) - attached immediately
        teamUnsubscribe = onSnapshot(collection(db, 'team'), (snapshot) => {
          if (!snapshot.empty) {
            const teamData: TeamMember[] = [];
            snapshot.forEach((doc) => {
              teamData.push({ ...doc.data() } as TeamMember);
            });
            const sortedTeam = teamData.sort((a, b) => Number(a.id) - Number(b.id));
            setTeam(sortedTeam);
            setCached('eet_team', sortedTeam);
          } else {
            setTeam([]);
          }
        }, (error) => {
          console.warn("Team sync error:", error);
        });

        // 3. Sync FAQs (Real-time from Firestore) - attached immediately
        faqsUnsubscribe = onSnapshot(collection(db, 'faqs'), (snapshot) => {
          if (!snapshot.empty) {
            const faqsData: FAQItem[] = [];
            snapshot.forEach((doc) => {
              faqsData.push({ ...doc.data() } as FAQItem);
            });
            const sortedFaqs = faqsData.sort((a, b) => Number(a.id) - Number(b.id));
            setFaqs(sortedFaqs);
            setCached('eet_faq', sortedFaqs);
          } else {
            setFaqs([]);
          }
        }, (error) => {
          console.warn("FAQs sync error:", error);
        });

        // 4. Sync Reviews (Real-time from Firestore) - attached immediately
        reviewsUnsubscribe = onSnapshot(collection(db, 'reviews'), (snapshot) => {
          if (!snapshot.empty) {
            const reviewsData: Review[] = [];
            snapshot.forEach((doc) => {
              reviewsData.push({ ...doc.data() } as Review);
            });
            const sortedReviews = reviewsData.sort((a, b) => Number(a.id) - Number(b.id));
            setReviews(sortedReviews);
            setCached('eet_rev', sortedReviews);
          } else {
            setReviews([]);
          }
        }, (error) => {
          console.warn("Reviews sync error:", error);
        });

        // 5. Sync Config (Real-time) - attached immediately
        configUnsubscribe = onSnapshot(configRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data() as SiteConfig;
            if (!data.facebookPage || data.facebookPage === 'https://facebook.com/euroexpresstravels') {
              data.facebookPage = 'https://www.facebook.com/share/1HC7peKkEA/';
            }
            if (!data.adminPassword || data.adminPassword === 'admin') {
              data.adminPassword = 'T@slima-2904';
            }
            if (data.heroBannerUrl === undefined) {
              data.heroBannerUrl = INITIAL_CONFIG.heroBannerUrl;
            }
            const existingEmails = data.adminEmails || [];
            const requiredEmails = ['hellofingenix@gmail.com', 'taslimaakter2904@gmail.com', 'euroexpresstravels65@gmail.com'];
            let mergedEmails = Array.from(new Set([...existingEmails, ...requiredEmails]));
            
            // Strictly enforce removal of robiulshadhin139
            if (mergedEmails.some(e => e.toLowerCase().includes('robiulshadhin139'))) {
              mergedEmails = mergedEmails.filter(e => !e.toLowerCase().includes('robiulshadhin139'));
              // Background async cleanup in firestore
              updateDoc(configRef, { adminEmails: mergedEmails }).catch(() => {});
            }
            
            data.adminEmails = mergedEmails;
            setConfig(data);
            setCached('eet_cfg', data);
          }
        }, (error) => {
          console.warn("Config sync error:", error);
        });

        // 6. Fast non-blocking background verification for seed status
        const isSeededLocally = localStorage.getItem('eet_seeded_ok') === 'true';
        if (!isSeededLocally) {
          (async () => {
            try {
              const seedSnap = await getDoc(seedStatusRef);
              if (!seedSnap.exists()) {
                const configSnap = await getDoc(configRef);
                if (!configSnap.exists()) {
                  await setDoc(configRef, INITIAL_CONFIG);
                }

                const servicesSnap = await getDocs(collection(db, 'services'));
                if (servicesSnap.empty) {
                  for (const service of INITIAL_SERVICES) {
                    await setDoc(doc(db, 'services', service.id), service);
                  }
                }

                const teamSnap = await getDocs(collection(db, 'team'));
                if (teamSnap.empty) {
                  for (const member of INITIAL_TEAM) {
                    await setDoc(doc(db, 'team', member.id), member);
                  }
                }

                const faqsSnap = await getDocs(collection(db, 'faqs'));
                if (faqsSnap.empty) {
                  for (const faq of INITIAL_FAQS) {
                    await setDoc(doc(db, 'faqs', faq.id), faq);
                  }
                }

                const reviewsSnap = await getDocs(collection(db, 'reviews'));
                if (reviewsSnap.empty) {
                  for (const review of INITIAL_REVIEWS) {
                    await setDoc(doc(db, 'reviews', review.id), review);
                  }
                }

                await setDoc(seedStatusRef, { isSeeded: true, createdAt: new Date().toISOString() });
              }
              localStorage.setItem('eet_seeded_ok', 'true');
            } catch (e) {
              console.warn("Database initialization check:", e);
            }
          })();
        }

        setLoading(false);
      } catch (error) {
        console.error("Critical sync error:", error);
        setLoading(false);
      }
    };

    syncData();
    return () => {
      servicesUnsubscribe();
      teamUnsubscribe();
      faqsUnsubscribe();
      reviewsUnsubscribe();
      configUnsubscribe();
    };
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleRequestService = (serviceId?: string) => {
    setSelectedServiceId(serviceId);
    setIsTalkToUs(false);
    setIsModalOpen(true);
  };

  const handleTalkToUs = () => {
    setSelectedServiceId(undefined);
    setIsTalkToUs(true);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden flex flex-col pb-16 md:pb-0">
      <SEO />
      <Navbar 
        siteName={config.name} 
        whatsappNumber={config.whatsappNumber} 
        onAdminClick={() => setIsAdminOpen(true)}
        onUserProfileClick={() => setIsUserProfileOpen(true)} 
        user={user}
        onLoginClick={() => setIsLoginOpen(true)}
        adminEmails={config.adminEmails}
      />
      
      <main className="flex-1">
        <Routes location={location}>
          <Route path="/" element={
              <PageTransition>
                <Hero 
                  title={config.heroTitle} 
                  subtitle={config.heroSubtitle} 
                  heroBannerUrl={config.heroBannerUrl}
                  onRequestService={() => handleRequestService()}
                  onTalkToUs={handleTalkToUs}
                />
                
                <Services 
                  services={services} 
                  whatsappNumber={config.whatsappNumber} 
                  onRequestService={handleRequestService}
                  onPreviewService={setPreviewService}
                />

                <div className="bg-blue-600 py-12">
                  <div className="max-w-7xl mx-auto px-4 sm:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                      <h3 className="text-2xl font-black text-white mb-2">Need Help? Talk to Us</h3>
                      <p className="text-blue-100 font-medium">Have a question or need assistance? Tell us what you need and our team will contact you.</p>
                    </div>
                    <button 
                      onClick={handleTalkToUs}
                      className="px-10 py-4 bg-white text-blue-600 font-black rounded-xl hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/20 active:scale-95 cursor-pointer"
                    >
                      Talk to Us
                    </button>
                  </div>
                </div>

                <Reviews reviews={reviews} />
              </PageTransition>
            } />
            
            <Route path="/services" element={
              <PageTransition>
                <Services 
                  services={services} 
                  whatsappNumber={config.whatsappNumber} 
                  onRequestService={handleRequestService}
                  onPreviewService={setPreviewService}
                />
              </PageTransition>
            } />

            <Route path="/about" element={
              <Suspense fallback={<RouteFallback />}>
                <PageTransition>
                  <About config={config} />
                </PageTransition>
              </Suspense>
            } />

            <Route path="/team" element={
              <Suspense fallback={<RouteFallback />}>
                <PageTransition>
                  <Team 
                    team={team} 
                    config={config} 
                    onRequestService={() => handleRequestService()} 
                  />
                </PageTransition>
              </Suspense>
            } />

            <Route path="/how-it-works" element={
              <Suspense fallback={<RouteFallback />}>
                <PageTransition>
                  <HowItWorks />
                </PageTransition>
              </Suspense>
            } />

            <Route path="/faq" element={
              <Suspense fallback={<RouteFallback />}>
                <PageTransition>
                  <FAQ faqs={faqs} config={config} />
                </PageTransition>
              </Suspense>
            } />

            <Route path="/contact" element={
              <Suspense fallback={<RouteFallback />}>
                <PageTransition>
                  <ContactUs config={config} />
                </PageTransition>
              </Suspense>
            } />
          </Routes>
      </main>

      <Footer config={config} user={user} onAdminClick={() => setIsAdminOpen(true)} />

      {/* Floating AI Assistant Button (Positioned at bottom right with bounce animation) */}
      {!isAIAssistantOpen && (
        <button
          id="ai-assistant-floating-btn"
          onClick={() => setIsAIAssistantOpen(true)}
          onMouseEnter={() => {
            // Intelligent prefetch on hover
            import('./components/AIAssistantModal');
          }}
          className="fixed bottom-20 md:bottom-8 right-6 z-40 bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-500 text-white p-1 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all animate-bounce flex items-center justify-center group cursor-pointer border-2 border-white ring-4 ring-blue-500/30 hover:ring-blue-400/60"
          title="Ask AI Assistant • Visa & Travel Guide"
        >
          <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden flex items-center justify-center bg-slate-900">
            <img 
              src="https://res.cloudinary.com/lbbij0gf/image/upload/v1789533394/ChatGPT_Image_Sep_16_2026_10_36_17_AM.png" 
              alt="Euro Express AI Assistant" 
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full animate-pulse" />
          </div>
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:mx-2.5 transition-all duration-500 font-bold whitespace-nowrap hidden md:block text-xs text-white">
            AI Assistant
          </span>
        </button>
      )}

      {/* On-demand Modals loaded via Suspense (Zero impact on initial page load) */}
      <Suspense fallback={null}>
        {isAIAssistantOpen && (
          <AIAssistantModal 
            isOpen={isAIAssistantOpen}
            onClose={() => setIsAIAssistantOpen(false)}
            whatsappNumber={config.whatsappNumber}
            onRequestService={() => handleRequestService()}
          />
        )}

        {previewService && (
          <ServicePreviewModal
            isOpen={!!previewService}
            onClose={() => setPreviewService(null)}
            service={previewService}
            onRequestService={(serviceId) => {
              setPreviewService(null);
              handleRequestService(serviceId);
            }}
          />
        )}

        {isModalOpen && (
          <RequestServiceModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            services={services}
            selectedServiceId={selectedServiceId}
            isTalkToUs={isTalkToUs}
            user={user}
            onLoginRequired={() => {
              setIsModalOpen(false);
              setIsLoginOpen(true);
            }}
          />
        )}

        {isLoginOpen && (
          <Login onClose={() => setIsLoginOpen(false)} />
        )}

        {user && isUserProfileOpen && (
          <UserProfileModal 
            isOpen={isUserProfileOpen}
            onClose={() => setIsUserProfileOpen(false)}
            user={user}
          />
        )}

        {isAdminOpen && (
          <AdminPanel
            config={config}
            services={services}
            reviews={reviews}
            team={team}
            faqs={faqs}
            user={user}
            onClose={() => setIsAdminOpen(false)}
          />
        )}
      </Suspense>
    </div>
  );
}
