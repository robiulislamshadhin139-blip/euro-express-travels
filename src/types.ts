/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  imageUrl?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  designation: string;
  photoUrl?: string;
  shortIntro: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  facebook?: string;
  linkedin?: string;
  order?: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface AboutConfig {
  title: string;
  subtitle: string;
  mainStory: string;
  secondaryStory: string;
  experienceYears: string;
  visaSuccessRate: string;
  happyClients: string;
  countriesServed: string;
}

export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
  folder?: string;
}

export interface AdminDocument {
  id: string;
  title: string;
  category: string;
  fileUrl: string;
  publicId?: string;
  fileType: 'pdf' | 'image' | 'doc' | 'other';
  fileFormat?: string;
  fileSize?: number;
  uploadedByEmail: string;
  uploadedAt: string;
  notes?: string;
}

export interface SiteConfig {
  name: string;
  whatsappNumber: string;
  phone: string;
  email: string;
  address: string;
  facebookPage: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBannerUrl?: string;
  adminPassword: string;
  adminEmails?: string[];
  aboutConfig?: AboutConfig;
  cloudinaryConfig?: CloudinaryConfig;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

export const INITIAL_SERVICES: Service[] = [
  {
    id: '1',
    title: 'Worldwide Visit Visa Processing',
    description: 'Professional assistance for visit visa applications to countries across the globe.',
    icon: 'Globe',
    imageUrl: 'https://res.cloudinary.com/lbbij0gf/image/upload/v1787984462/ChatGPT_Image_Aug_29_2026_11_34_55_AM.png'
  },
  {
    id: '2',
    title: 'Student Visa Processing',
    description: 'Expert guidance for students seeking to study abroad with full documentation support.',
    icon: 'GraduationCap',
    imageUrl: 'https://res.cloudinary.com/lbbij0gf/image/upload/v1787984471/ChatGPT_Image_Aug_29_2026_11_36_13_AM.png'
  },
  {
    id: '3',
    title: 'Work Permit',
    description: 'Reliable processing for international work permits and employment visas.',
    icon: 'Briefcase',
    imageUrl: 'https://res.cloudinary.com/lbbij0gf/image/upload/v1787984458/ChatGPT_Image_Aug_29_2026_11_37_39_AM.png'
  },
  {
    id: '4',
    title: 'Indian Medical Visa',
    description: 'Fast-track processing for patients traveling to India for medical treatment.',
    icon: 'Stethoscope',
    imageUrl: 'https://res.cloudinary.com/lbbij0gf/image/upload/v1787984465/ChatGPT_Image_Aug_29_2026_11_39_18_AM.png'
  },
  {
    id: '5',
    title: 'Indian Double Entry Visa',
    description: 'Hassle-free application for double entry visas to India.',
    icon: 'FileText',
    imageUrl: 'https://res.cloudinary.com/lbbij0gf/image/upload/v1787984457/ChatGPT_Image_Aug_29_2026_11_42_00_AM.png'
  },
  {
    id: '6',
    title: 'Police Clearance Certificate',
    description: 'Assistance in obtaining police clearance certificates for immigration.',
    icon: 'ShieldCheck',
    imageUrl: 'https://res.cloudinary.com/lbbij0gf/image/upload/v1787984454/ChatGPT_Image_Aug_29_2026_12_13_11_PM.png'
  },
  {
    id: '7',
    title: 'Hotel Booking',
    description: 'Worldwide hotel reservation services with confirmed bookings.',
    icon: 'Hotel',
    imageUrl: 'https://res.cloudinary.com/lbbij0gf/image/upload/v1787984453/ChatGPT_Image_Aug_29_2026_12_14_09_PM.png'
  },
  {
    id: '8',
    title: 'Air Ticketing',
    description: 'Domestic and international flight bookings with confirmed status.',
    icon: 'Plane',
    imageUrl: 'https://res.cloudinary.com/lbbij0gf/image/upload/v1787984453/ChatGPT_Image_Aug_29_2026_12_15_11_PM.png'
  },
  {
    id: '9',
    title: 'Passport Application',
    description: 'Full support for new passport applications and renewals.',
    icon: 'MapPin',
    imageUrl: 'https://res.cloudinary.com/lbbij0gf/image/upload/v1787984456/ChatGPT_Image_Aug_29_2026_12_15_51_PM.png'
  },
  {
    id: '10',
    title: 'Online GD',
    description: 'Professional assistance for online General Diary applications.',
    icon: 'ClipboardList',
    imageUrl: 'https://res.cloudinary.com/lbbij0gf/image/upload/v1787984468/ChatGPT_Image_Aug_29_2026_12_16_59_PM.png'
  },
  {
    id: '11',
    title: 'Insurance & Online Applications',
    description: 'Comprehensive travel insurance and various online application services.',
    icon: 'Umbrella',
    imageUrl: 'https://res.cloudinary.com/lbbij0gf/image/upload/v1787984457/ChatGPT_Image_Aug_29_2026_12_18_22_PM.png'
  },
];

export const INITIAL_TEAM: TeamMember[] = [
  {
    id: '1',
    name: 'MD. Faruk Ahmed',
    designation: 'Founder & Managing Director',
    shortIntro: 'Over 12 years of specialized expertise in international visa processing, immigration advisory, and global travel logistics.',
    phone: '01798483565',
    email: 'euroexpresstravels65@gmail.com',
    whatsapp: '8801798483565'
  },
  {
    id: '2',
    name: 'Taslima Akter',
    designation: 'Head of Visa Operations & Client Relations',
    shortIntro: 'Leads student visa documentation, embassy appointments, and personalized customer care with high approval accuracy.',
    phone: '01798483565',
    email: 'taslimaakter2904@gmail.com',
    whatsapp: '8801798483565'
  },
  {
    id: '3',
    name: 'Syed Mahbubur Rahman',
    designation: 'Senior Air Ticketing & Global Reservation Specialist',
    shortIntro: 'Expert in international flight reservations, group ticketing, transit visa coordination, and hotel accommodations.',
    phone: '01798483565',
    email: 'euroexpresstravels65@gmail.com',
    whatsapp: '8801798483565'
  },
  {
    id: '4',
    name: 'Nusrat Jahan',
    designation: 'Medical Visa & Emergency Travel Consultant',
    shortIntro: 'Dedicated support for Indian medical visas, urgent patient travel coordination, and expedited document clearance.',
    phone: '01798483565',
    email: 'euroexpresstravels65@gmail.com',
    whatsapp: '8801798483565'
  }
];

export const INITIAL_FAQS: FAQItem[] = [
  {
    id: '1',
    question: "What documents are typically required for a tourist visa?",
    answer: "Commonly required documents include a valid passport (minimum 6 months validity), recent passport-sized photographs, bank statements for the last 6 months, an invitation letter (if applicable), confirmed flight itinerary, and hotel booking proof."
  },
  {
    id: '2',
    question: "How long does the visa processing take?",
    answer: "Processing times vary by country and visa category. Generally, visit visas take 5 to 15 working days. Medical visas can be expedited within 3-5 days. We recommend applying at least 3-4 weeks in advance of your planned departure."
  },
  {
    id: '3',
    question: "Do you assist with Indian Medical Visa and Double Entry Visa?",
    answer: "Yes! We specialize in Indian Medical Visas with hospital doctor appointments, attendant documentation, and Double/Multiple entry visas with fast-track submission."
  },
  {
    id: '4',
    question: "Is there a guarantee of visa approval?",
    answer: "While final approval rests solely with the respective embassy or high commission, our 98%+ track record comes from rigorous pre-screening, flawless documentation, and strict adherence to consular guidelines."
  },
  {
    id: '5',
    question: "Can you arrange flight tickets and hotel bookings for visa applications?",
    answer: "Yes, we provide verified dummy or confirmed flight itineraries and hotel reservation vouchers fully acceptable for embassy documentation."
  },
  {
    id: '6',
    question: "What happens if a visa is rejected?",
    answer: "If a refusal occurs, our senior advisors analyze the refusal points, address any gaps or missing financial proofs, and re-apply with a strengthened profile or appeal letter."
  }
];

export const INITIAL_ABOUT_CONFIG: AboutConfig = {
  title: 'About Euro Express',
  subtitle: 'Your Trusted Gateway to Global Journeys & Seamless Visas',
  mainStory: 'Euro Express has established itself as a premier visa consultancy and global travel agency located at Mirpur Bazar, Bahubal, Hobiganj. Our mission is to simplify international mobility, providing transparent, fast, and reliable visa processing and air ticketing solutions to individuals, families, students, and businesses.',
  secondaryStory: 'We specialize in navigating the complexities of international travel documentation, embassy protocols, and ticketing systems. Our dedicated consultants ensure your application meets the highest standards so you can focus on your journey with absolute peace of mind.',
  experienceYears: '10+',
  visaSuccessRate: '98.5%',
  happyClients: '15,000+',
  countriesServed: '50+'
};

export const INITIAL_REVIEWS: Review[] = [
  {
    id: '1',
    name: 'Rahim Ahmed',
    rating: 5,
    comment: 'Excellent service for my Indian Medical Visa. Very fast, professional, and reliable guidance from the team.',
    date: '2 weeks ago'
  },
  {
    id: '2',
    name: 'Sara Khan',
    rating: 5,
    comment: 'Got my work permit and air ticket processed smoothly. Outstanding support and transparent communication!',
    date: '1 month ago'
  },
  {
    id: '3',
    name: 'Mahbubur Rahman',
    rating: 5,
    comment: 'The team is very helpful and guided me through the entire student visa process step by step. Highly recommended!',
    date: '3 months ago'
  }
];

export const INITIAL_CONFIG: SiteConfig = {
  name: 'EURO EXPRESS',
  whatsappNumber: '8801798483565',
  phone: '01798483565',
  email: 'euroexpresstravels65@gmail.com',
  address: 'Mirpur Bazar, Bahubal, Hobiganj',
  facebookPage: 'https://www.facebook.com/share/1HC7peKkEA/',
  heroTitle: 'Your Trusted Partner for Global Travel & Visas',
  heroSubtitle: 'Professional visa processing, air ticketing, and travel solutions all in one place.',
  heroBannerUrl: 'https://res.cloudinary.com/lbbij0gf/image/upload/v1789362853/ChatGPT_Image_Sep_14_2026_11_12_39_AM.png',
  adminPassword: 'T@slima-2904',
  adminEmails: [
    'taslimaakter2904@gmail.com',
    'taslimaakterr469@gmail.com',
    'hellofingenix@gmail.com',
    'euroexpresstravels65@gmail.com'
  ],
  aboutConfig: INITIAL_ABOUT_CONFIG,
  cloudinaryConfig: {
    cloudName: 'lbbij0gf',
    uploadPreset: 'euro_docs',
    folder: 'documents'
  }
};
