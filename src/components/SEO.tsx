import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { INITIAL_SERVICES, INITIAL_FAQS } from '../types';

export default function SEO() {
  const location = useLocation();

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://startling-meringue-520cae.netlify.app';
    const currentUrl = `${origin}${location.pathname}`;

    let title = "Euro Express Travels | Best Visa Processing & Travel Agency in Bangladesh";
    let description = "Euro Express Travels - Leading visa processing, air ticketing & immigration consultancy in Bangladesh. Fast & reliable Visit Visa, Student Visa, Work Permit, Europe Schengen Visa, Indian Visa & Medical processing.";
    let keywords = "Euro Express Travels, Euro Express, ইউরো এক্সপ্রেস ট্রাভেলস, visa processing agency Bangladesh, travel agency Sylhet, travel agency Hobiganj, travel agency Bahubal, Europe visa Bangladesh, Schengen visa processing, student visa consultancy, work permit agency, Indian medical visa, air ticket booking, visit visa processing";
    let pageType = "website";
    let structuredData: any = null;

    switch (location.pathname) {
      case '/':
        title = "Euro Express Travels | Best Visa Processing & Travel Agency in Bangladesh";
        description = "Euro Express Travels offers top-rated visa consultancy, worldwide visit visas, student visas, work permits, Schengen visas, air ticketing & hotel bookings. Trusted visa agency in Mirpur Bazar, Bahubal, Hobiganj.";
        keywords = "Euro Express Travels, Euro Express, visa agency Bangladesh, travel agency Bangladesh, ইউরো এক্সপ্রেস, ইউরো এক্সপ্রেস ট্রাভেলস, visit visa processing, student visa abroad, work permit visa, Schengen Europe visa, air ticket Sylhet, Bahubal travel agency, Hobiganj visa office";
        structuredData = {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "@id": `${origin}/#website`,
              "url": origin,
              "name": "Euro Express Travels",
              "alternateName": ["Euro Express", "ইউরো এক্সপ্রেস ট্রাভেলস", "Euro Express Travel Agency"],
              "description": "Leading Visa Processing and Travel Agency in Bangladesh",
              "inLanguage": ["en-US", "bn-BD"],
              "potentialAction": {
                "@type": "SearchAction",
                "target": `${origin}/services?q={search_term_string}`,
                "query-input": "required name=search_term_string"
              }
            },
            {
              "@type": "TravelAgency",
              "@id": `${origin}/#organization`,
              "name": "Euro Express Travels",
              "alternateName": ["Euro Express", "EuroExpress", "ইউরো এক্সপ্রেস", "ইউরো এক্সপ্রেস ট্রাভেলস"],
              "url": origin,
              "logo": "https://res.cloudinary.com/lbbij0gf/image/upload/v1787569136/Untitled-1_copy.png",
              "image": "https://res.cloudinary.com/lbbij0gf/image/upload/v1787572599/ChatGPT_Image_Aug_24_2026_05_55_44_PM.png",
              "telephone": "+8801798483565",
              "email": "euroexpresstravels65@gmail.com",
              "priceRange": "$$",
              "currenciesAccepted": "BDT, USD, EUR",
              "paymentAccepted": "Cash, Bank Transfer, bKash, Nagad",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Mirpur Bazar",
                "addressLocality": "Bahubal",
                "addressRegion": "Hobiganj",
                "postalCode": "3310",
                "addressCountry": "BD"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 24.3537,
                "longitude": 91.5385
              },
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                  "opens": "09:00",
                  "closes": "21:00"
                }
              ],
              "sameAs": [
                "https://www.facebook.com/share/1HC7peKkEA/"
              ],
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Visa Processing and Travel Services",
                "itemListElement": INITIAL_SERVICES.map((s, idx) => ({
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": s.title,
                    "description": s.description,
                    "image": s.imageUrl
                  }
                }))
              }
            }
          ]
        };
        break;

      case '/services':
        title = "Our Visa & Travel Services | Worldwide Visas, Tickets & Permits | Euro Express Travels";
        description = "Explore all services by Euro Express Travels: Worldwide Visit Visa, Student Visa, Work Permits, Indian Medical & Double Entry Visa, Police Clearance, Air Tickets, and Hotel Bookings.";
        keywords = "visa services Bangladesh, worldwide visit visa, student visa processing, work permit agency, Indian medical visa, Indian double entry visa, police clearance certificate, air ticket booking, hotel reservation, online GD, Euro Express services, ইউরো এক্সপ্রেস সার্ভিস";
        pageType = "website";
        structuredData = {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Visa and Travel Services Catalog - Euro Express Travels",
          "url": currentUrl,
          "description": "Comprehensive list of international visa processing, immigration consulting, air ticketing, and travel solutions offered by Euro Express Travels.",
          "provider": {
            "@type": "TravelAgency",
            "name": "Euro Express Travels",
            "telephone": "+8801798483565"
          },
          "mainEntity": {
            "@type": "ItemList",
            "itemListElement": INITIAL_SERVICES.map((s, idx) => ({
              "@type": "ListItem",
              "position": idx + 1,
              "item": {
                "@type": "Service",
                "name": s.title,
                "description": s.description,
                "image": s.imageUrl,
                "provider": {
                  "@type": "TravelAgency",
                  "name": "Euro Express Travels"
                }
              }
            }))
          }
        };
        break;

      case '/about':
        title = "About Us | Trusted Visa Agency & Travel Consultant | Euro Express Travels";
        description = "Learn about Euro Express Travels — our decade of expertise, high visa approval rate (98.5%), certified consultancy team, and transparent immigration solutions based in Bahubal, Hobiganj.";
        keywords = "about Euro Express Travels, trusted visa agency, Bangladesh travel consultancy, visa success rate, immigration consultant Hobiganj, Euro Express history, আমাদের সম্পর্কে ইউরো এক্সপ্রেস";
        pageType = "article";
        structuredData = {
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "About Euro Express Travels",
          "url": currentUrl,
          "description": "Discover our mission, experienced team, and standard of excellence in global visa processing and travel solutions.",
          "mainEntity": {
            "@type": "TravelAgency",
            "name": "Euro Express Travels",
            "foundingDate": "2015",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Mirpur Bazar",
              "addressLocality": "Bahubal",
              "addressRegion": "Hobiganj",
              "addressCountry": "BD"
            },
            "telephone": "+8801798483565",
            "email": "euroexpresstravels65@gmail.com"
          }
        };
        break;

      case '/team':
        title = "Our Expert Team | Experienced Visa Consultants | Euro Express Travels";
        description = "Meet the passionate visa advisors, documentation experts, and immigration consultants at Euro Express Travels dedicated to making your foreign travel easy.";
        keywords = "Euro Express team, visa experts, travel consultants Sylhet, immigration advisors Bangladesh, ট্রাভেল টিম";
        pageType = "profile";
        break;

      case '/how-it-works':
        title = "How It Works | 4-Step Simple Visa Application Process | Euro Express Travels";
        description = "Learn our transparent 4-step visa process: 1. Free Consultation, 2. Document Verification & Preparation, 3. Embassy Submission, 4. Visa Approval & Ticket Delivery.";
        keywords = "visa application process, how to get visa Bangladesh, visa processing steps, embassy documentation support, Euro Express process, ভিসা প্রসেসিং নিয়ম";
        pageType = "article";
        structuredData = {
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": "How to Process Your International Visa with Euro Express Travels",
          "description": "A step-by-step guide to applying and receiving your visit, student, or work visa hassle-free with Euro Express Travels.",
          "step": [
            {
              "@type": "HowToStep",
              "name": "Initial Consultation & Assessment",
              "text": "Discuss your destination and travel category with our expert consultants to assess eligibility and requirements.",
              "position": 1
            },
            {
              "@type": "HowToStep",
              "name": "Documentation & Verification",
              "text": "Our team prepares, translates, and meticulously verifies all necessary legal documents to match embassy standards.",
              "position": 2
            },
            {
              "@type": "HowToStep",
              "name": "Embassy Submission & Biometrics",
              "text": "We schedule embassy appointments and submit applications with full compliance monitoring.",
              "position": 3
            },
            {
              "@type": "HowToStep",
              "name": "Visa Approval & Travel Support",
              "text": "Collect your approved visa alongside confirmed flight tickets, hotel reservations, and travel insurance.",
              "position": 4
            }
          ]
        };
        break;

      case '/faq':
        title = "Frequently Asked Questions (FAQs) | Visa & Travel Queries | Euro Express Travels";
        description = "Got questions about visa eligibility, required documents, processing duration, or costs? Read our comprehensive FAQs answered by visa experts.";
        keywords = "visa FAQ Bangladesh, travel questions, student visa requirements, work permit duration, schengen visa FAQ, Euro Express questions and answers, ভিসা প্রশ্নোত্তর";
        pageType = "article";
        structuredData = {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": INITIAL_FAQS.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        };
        break;

      case '/contact':
        title = "Contact Us | Office Location, Phone & WhatsApp | Euro Express Travels";
        description = "Contact Euro Express Travels in Mirpur Bazar, Bahubal, Hobiganj. Call/WhatsApp: +880 1798-483565. Email: euroexpresstravels65@gmail.com for instant visa support.";
        keywords = "contact Euro Express Travels, Bahubal travel agency phone number, Hobiganj visa office address, Euro Express WhatsApp number, যোগাযোগ ইউরো এক্সপ্রেস";
        pageType = "contact";
        structuredData = {
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": "Contact Euro Express Travels",
          "url": currentUrl,
          "mainEntity": {
            "@type": "TravelAgency",
            "name": "Euro Express Travels",
            "telephone": "+8801798483565",
            "email": "euroexpresstravels65@gmail.com",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Mirpur Bazar",
              "addressLocality": "Bahubal",
              "addressRegion": "Hobiganj",
              "postalCode": "3310",
              "addressCountry": "BD"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 24.3537,
              "longitude": 91.5385
            }
          }
        };
        break;

      default:
        break;
    }

    // Set Document Title
    document.title = title;

    // Helper to safely set meta attributes
    const setMeta = (selector: string, content: string) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        const [attr, val] = selector.replace('meta[', '').replace(']', '').split('=');
        el.setAttribute(attr, val.replace(/['"]/g, ''));
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('meta[name="description"]', description);
    setMeta('meta[name="keywords"]', keywords);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:url"]', currentUrl);
    setMeta('meta[property="og:type"]', pageType);
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description);

    // Canonical link management
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);

    // Breadcrumb Schema for all pages
    const breadcrumbList = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": origin
        },
        ...(location.pathname !== '/' ? [
          {
            "@type": "ListItem",
            "position": 2,
            "name": title.split('|')[0].trim(),
            "item": currentUrl
          }
        ] : [])
      ]
    };

    // Inject / Update Dynamic JSON-LD Schema
    const dynamicScriptId = 'dynamic-seo-jsonld';
    let scriptTag = document.getElementById(dynamicScriptId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = dynamicScriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const fullSchema = structuredData 
      ? [breadcrumbList, structuredData] 
      : [breadcrumbList];

    scriptTag.text = JSON.stringify(fullSchema);

  }, [location.pathname]);

  return null;
}
