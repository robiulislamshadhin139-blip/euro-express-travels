/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Save, Plus, Trash2, LogOut, Phone, Shield, Layout, Inbox, 
  Clock, Calendar, Star, MessageSquare, KeyRound, CheckCircle2, 
  Lock, Eye, EyeOff, UserCheck, AlertCircle, Users, HelpCircle, 
  FileText, Globe, Briefcase, GraduationCap, Stethoscope, 
  ShieldCheck, Hotel, Plane, MapPin, ClipboardList, Umbrella, 
  Upload, Sparkles, ExternalLink, RefreshCw, Edit3, Image as ImageIcon,
  Building, Check, Search, Loader2, MessageCircle, BarChart3, FolderLock
} from 'lucide-react';
import AdminDigitalDashboard from './AdminDigitalDashboard';
import AdminDocumentsTab from './AdminDocumentsTab';
import { Service, SiteConfig, Review, TeamMember, FAQItem, AboutConfig, INITIAL_TEAM, INITIAL_FAQS, INITIAL_ABOUT_CONFIG, INITIAL_CONFIG } from '../types';
import { uploadFileToCloudinary } from '../utils/cloudinary';
import { db, auth, secondaryAuth, googleProvider } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail, 
  User 
} from 'firebase/auth';

interface Inquiry {
  id: string;
  customerName?: string;
  name?: string;
  customerMobile?: string;
  mobile?: string;
  customerEmail?: string;
  email?: string;
  userEmail?: string;
  serviceName?: string;
  serviceTitle?: string;
  serviceId?: string;
  details?: string;
  message?: string;
  type?: string;
  createdAt: any;
  status: string;
}

interface AdminPanelProps {
  config: SiteConfig;
  services: Service[];
  reviews: Review[];
  team?: TeamMember[];
  faqs?: FAQItem[];
  user?: User | null;
  onClose: () => void;
}

const AVAILABLE_ICONS = [
  'Globe', 'GraduationCap', 'Briefcase', 'Stethoscope', 
  'FileText', 'ShieldCheck', 'Hotel', 'Plane', 
  'MapPin', 'ClipboardList', 'Umbrella', 'HelpCircle'
];

export default function AdminPanel({ config, services, reviews, team = INITIAL_TEAM, faqs = INITIAL_FAQS, user, onClose }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState(user?.email || 'taslimaakter2904@gmail.com');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [isEmailPasswordLoading, setIsEmailPasswordLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [isAdminCreating, setIsAdminCreating] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [localConfig, setLocalConfig] = useState(() => ({
    ...config,
    heroBannerUrl: config.heroBannerUrl || INITIAL_CONFIG.heroBannerUrl
  }));
  const [localServices, setLocalServices] = useState(services);
  const [localReviews, setLocalReviews] = useState(reviews);
  const [localTeam, setLocalTeam] = useState<TeamMember[]>(team);
  const [localFaqs, setLocalFaqs] = useState<FAQItem[]>(faqs);

  type TabType = 'dashboard' | 'inquiries' | 'documents' | 'team' | 'services' | 'about' | 'faqs' | 'config';
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(true);
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState('ALL');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, message: string, onConfirm: () => void} | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Security Lock State
  const [isSecurityUnlocked, setIsSecurityUnlocked] = useState(false);
  const [securityInputPass, setSecurityInputPass] = useState('');
  const [securityPassError, setSecurityPassError] = useState('');

  // Active Team Member being edited in a modal/drawer or inline
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // Permanent protected Main Super Admins (Can NEVER be removed or demoted by anyone)
  const MAIN_SUPER_ADMIN_EMAILS = [
    'taslimaakter2904@gmail.com'
  ];

  const defaultAdminEmails = [
    'taslimaakter2904@gmail.com',
    'euroexpresstravels65@gmail.com',
    'hellofingenix@gmail.com'
  ];

  // The persistent admin list from Firebase Firestore (or default fallback)
  const currentAdminEmailsList = (localConfig.adminEmails && localConfig.adminEmails.length > 0)
    ? localConfig.adminEmails
    : (config.adminEmails && config.adminEmails.length > 0)
      ? config.adminEmails
      : defaultAdminEmails;

  // Always enforce that MAIN_SUPER_ADMIN_EMAILS are included and never missing
  const authorizedAdminEmails = Array.from(new Set([
    ...MAIN_SUPER_ADMIN_EMAILS,
    ...currentAdminEmailsList.map(e => e.toLowerCase().trim())
  ])).filter(Boolean);

  const isCurrentUserAdmin = Boolean(
    user?.email && authorizedAdminEmails.includes(user.email.toLowerCase().trim())
  );

  // Check if current logged-in user is a Main Super Admin
  const currentAdminEmailNormalized = (user?.email || adminEmail || '').toLowerCase().trim();
  const isCurrentLoggedInMainAdmin = MAIN_SUPER_ADMIN_EMAILS.includes(currentAdminEmailNormalized);

  // Admin panel always stays locked until admin enters email & password
  // Only pre-fill adminEmail from current user if available
  useEffect(() => {
    if (user?.email) {
      setAdminEmail(user.email);
    }
  }, [user]);

  // Sync local states when props change
  useEffect(() => { setLocalConfig(config); }, [config]);
  useEffect(() => { setLocalServices(services); }, [services]);
  useEffect(() => { setLocalReviews(reviews); }, [reviews]);
  useEffect(() => { setLocalTeam(team); }, [team]);
  useEffect(() => { setLocalFaqs(faqs); }, [faqs]);

  // Fetch inquiries from Firestore once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLoadingInquiries(true);
      const unsubscribe = onSnapshot(collection(db, 'inquiries'), (querySnapshot) => {
        const inquiriesData: Inquiry[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          inquiriesData.push({ 
            id: doc.id,
            customerName: data.customerName || data.name || 'Valued Customer',
            customerMobile: data.customerMobile || data.mobile || '',
            customerEmail: data.customerEmail || data.email || data.userEmail || '',
            serviceName: data.serviceName || data.serviceTitle || 'General Consultation',
            details: data.details || data.message || '',
            status: data.status || 'PENDING',
            type: data.type || 'ServiceRequest',
            createdAt: data.createdAt,
            ...data 
          } as Inquiry);
        });

        // Sort descending by created timestamp
        inquiriesData.sort((a, b) => {
          const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
          const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
          return bTime - aTime;
        });

        setInquiries(inquiriesData);
        setLoadingInquiries(false);
      }, (err) => {
        console.warn("Inquiries snapshot error:", err);
        setLoadingInquiries(false);
      });
      return () => unsubscribe();
    }
  }, [isAuthenticated]);

  const showNotification = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const handleGoogleAdminLogin = async () => {
    setAuthError(null);
    setResetMessage(null);
    setIsGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email?.toLowerCase().trim();
      if (!email || !authorizedAdminEmails.includes(email)) {
        setAuthError(`Access Denied: "${result.user.email}" is not an authorized administrator account.`);
      } else {
        setIsAuthenticated(true);
      }
    } catch (error: any) {
      if (
        error?.code === 'auth/popup-closed-by-user' ||
        error?.code === 'auth/cancelled-popup-request'
      ) {
        return;
      }
      console.warn("Admin sign in error:", error);
      setAuthError(error.message || 'Google sign-in could not be completed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Firebase Email & Password Login Handler
  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setResetMessage(null);

    const cleanEmail = adminEmail.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail) {
      setAuthError('Please enter your admin email.');
      return;
    }
    if (!cleanPass) {
      setAuthError('Please enter your password.');
      return;
    }

    const isAuthorizedEmail = authorizedAdminEmails.includes(cleanEmail) || (localConfig.adminEmails && localConfig.adminEmails.includes(cleanEmail));
    if (!isAuthorizedEmail) {
      setAuthError(`Access Denied: "${cleanEmail}" is not in the authorized administrator list.`);
      return;
    }

    setIsEmailPasswordLoading(true);

    try {
      // 1. Attempt Firebase Authentication
      try {
        await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
        setIsAuthenticated(true);
        return;
      } catch (authErr: any) {
        // 2. Check against Firebase Firestore site configuration password
        const firebaseConfigPassword = (localConfig.adminPassword || config.adminPassword || 'T@slima-2904').trim();
        if (cleanPass === firebaseConfigPassword) {
          setIsAuthenticated(true);
          return;
        }

        console.warn("Firebase Auth Error:", authErr);
        if (authErr?.code === 'auth/wrong-password' || authErr?.code === 'auth/invalid-credential') {
          setAuthError('Incorrect password. Please enter the correct password.');
        } else if (authErr?.code === 'auth/user-not-found') {
          setAuthError('No admin account found for this email. Please check your credentials.');
        } else if (authErr?.code === 'auth/too-many-requests') {
          setAuthError('Too many failed attempts. Please wait a moment or reset your password.');
        } else {
          setAuthError('Incorrect password. Please check your credentials.');
        }
      }
    } finally {
      setIsEmailPasswordLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!adminEmail.trim()) {
      setAuthError('Please enter your admin email above to receive the password reset link.');
      return;
    }
    setAuthError(null);
    setResetMessage(null);
    setIsEmailPasswordLoading(true);
    try {
      await sendPasswordResetEmail(auth, adminEmail.trim());
      setResetMessage(`Password reset link sent to ${adminEmail.trim()}! Please check your inbox.`);
    } catch (err: any) {
      console.warn("Reset Password Error:", err);
      if (err?.code === 'auth/invalid-email') {
        setAuthError('Please enter a valid email address.');
      } else if (err?.code === 'auth/user-not-found') {
        setAuthError('No account found with this email.');
      } else {
        setAuthError('Failed to send reset link. Please try again.');
      }
    } finally {
      setIsEmailPasswordLoading(false);
    }
  };

  const handleExit = () => {
    setIsAuthenticated(false);
    setPassword('');
    onClose();
  };

  // ===================== SAVE HANDLERS =====================

  // Save Site & Security Settings
  const saveConfig = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'config'), localConfig);
      showNotification('Site & Security Settings saved to Firebase!');
    } catch (error: any) {
      console.error("Error saving config:", error);
      showNotification(`Failed to save configuration: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Save Services to Firestore
  const saveSingleService = async (service: Service) => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'services', service.id), service);
      showNotification(`Service "${service.title}" saved & published!`);
    } catch (error: any) {
      console.error("Error saving service:", error);
      showNotification(`Failed to save: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const saveAllServices = async () => {
    setIsSaving(true);
    try {
      for (const service of localServices) {
        await setDoc(doc(db, 'services', service.id), service);
      }
      showNotification('All services updated and saved to Firebase!');
    } catch (error: any) {
      console.error("Error saving services:", error);
      showNotification(`Failed to save services: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteService = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      message: 'Are you sure you want to delete this service?',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'services', id));
          setLocalServices(prev => prev.filter(s => s.id !== id));
          showNotification('Service removed.');
        } catch (error: any) {
          console.error("Error deleting service:", error);
          showNotification(`Failed to delete service: ${error.message}`);
        }
      }
    });
  };

  const addService = () => {
    const newService: Service = {
      id: Date.now().toString(),
      title: 'New Visa Service',
      description: 'Detailed description of the new visa processing or travel service.',
      icon: 'Globe',
    };
    setLocalServices([newService, ...localServices]);
  };

  // Save Team Members to Firestore
  const saveSingleTeamMember = async (member: TeamMember) => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'team', member.id), member);
      showNotification(`Consultant "${member.name}" saved & published!`);
    } catch (error: any) {
      console.error("Error saving team member:", error);
      showNotification(`Failed to save: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const saveAllTeam = async () => {
    setIsSaving(true);
    try {
      for (const member of localTeam) {
        await setDoc(doc(db, 'team', member.id), member);
      }
      showNotification('All team members successfully saved and published!');
    } catch (error: any) {
      console.error("Error saving team:", error);
      showNotification(`Failed to save team: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTeamMember = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      message: 'Are you sure you want to remove this team member?',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'team', id));
          setLocalTeam(prev => prev.filter(m => m.id !== id));
          showNotification('Team member removed.');
        } catch (error: any) {
          console.error("Error deleting member:", error);
          showNotification(`Failed to delete member: ${error.message}`);
        }
      }
    });
  };

  const addTeamMember = () => {
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: 'New Consultant Name',
      designation: 'Visa & Travel Consultant',
      photoUrl: '',
      shortIntro: 'Provide a short introduction highlighting experience, expertise, and dedication to client service.',
      phone: localConfig.phone || '01798483565',
      whatsapp: localConfig.whatsappNumber || '8801798483565',
      email: localConfig.email || 'euroexpresstravels65@gmail.com',
      facebook: '',
      linkedin: ''
    };
    setLocalTeam([newMember, ...localTeam]);
    setEditingMember(newMember);
  };

  // Save Reviews to Firestore
  const saveSingleReview = async (review: Review) => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'reviews', review.id), review);
      showNotification(`Review by "${review.name}" saved!`);
    } catch (error: any) {
      console.error("Error saving review:", error);
      showNotification(`Failed to save: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const saveAllReviews = async () => {
    setIsSaving(true);
    try {
      for (const review of localReviews) {
        await setDoc(doc(db, 'reviews', review.id), review);
      }
      showNotification('Reviews successfully saved to Firebase!');
    } catch (error: any) {
      console.error("Error saving reviews:", error);
      showNotification(`Failed to save reviews: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteReview = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      message: 'Are you sure you want to delete this review?',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'reviews', id));
          setLocalReviews(prev => prev.filter(r => r.id !== id));
          showNotification('Review deleted.');
        } catch (error: any) {
          console.error("Error deleting review:", error);
          showNotification(`Failed to delete review: ${error.message}`);
        }
      }
    });
  };

  const addReview = () => {
    const newReview: Review = {
      id: Date.now().toString(),
      name: 'Satisfied Traveler',
      rating: 5,
      comment: 'Euro Express Travels provided prompt and dependable visa assistance. Highly recommended!',
      date: 'Just now',
    };
    setLocalReviews([newReview, ...localReviews]);
  };

  // Save FAQs to Firestore
  const saveSingleFaq = async (faq: FAQItem) => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'faqs', faq.id), faq);
      showNotification(`FAQ item saved & published!`);
    } catch (error: any) {
      console.error("Error saving FAQ:", error);
      showNotification(`Failed to save: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const saveAllFaqs = async () => {
    setIsSaving(true);
    try {
      for (const faq of localFaqs) {
        await setDoc(doc(db, 'faqs', faq.id), faq);
      }
      showNotification('FAQs successfully saved to Firebase!');
    } catch (error: any) {
      console.error("Error saving FAQs:", error);
      showNotification(`Failed to save FAQs: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteFaq = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      message: 'Are you sure you want to delete this FAQ?',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'faqs', id));
          setLocalFaqs(prev => prev.filter(f => f.id !== id));
          showNotification('FAQ removed.');
        } catch (error: any) {
          console.error("Error deleting FAQ:", error);
          showNotification(`Failed to delete FAQ: ${error.message}`);
        }
      }
    });
  };

  const addFaq = () => {
    const newFaq: FAQItem = {
      id: Date.now().toString(),
      question: 'New Question Title?',
      answer: 'Detailed and accurate answer for the question goes here.'
    };
    setLocalFaqs([newFaq, ...localFaqs]);
  };

  // Save About Page details (stored in doc settings/config under aboutConfig)
  const saveAboutContent = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'config'), localConfig);
      showNotification('About Page story & statistics saved to Firebase!');
    } catch (error: any) {
      console.error("Error saving About content:", error);
      showNotification(`Failed to save About content: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // State for Admin Replies
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Inquiry actions
  const updateInquiryStatus = async (id: string, newStatus: string) => {
    try {
      await setDoc(doc(db, 'inquiries', id), { status: newStatus }, { merge: true });
      showNotification(`Request status updated to ${newStatus}`);
    } catch (error: any) {
      console.error("Error updating inquiry status:", error);
      showNotification(`Failed to update status: ${error.message}`);
    }
  };

  const handleSaveReply = async (id: string) => {
    try {
      await setDoc(doc(db, 'inquiries', id), { adminReply: replyText.trim() }, { merge: true });
      showNotification('Reply saved and sent to user successfully!');
      setReplyingToId(null);
      setReplyText('');
    } catch (error: any) {
      console.error("Error saving reply:", error);
      showNotification(`Failed to save reply: ${error.message}`);
    }
  };

  const deleteInquiry = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      message: 'Are you sure you want to delete this customer request permanently?',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'inquiries', id));
          showNotification('Customer request deleted.');
        } catch (error: any) {
          console.error("Error deleting inquiry:", error);
          showNotification(`Failed to delete request: ${error.message}`);
        }
      }
    });
  };

  
  // Update Master Admin Password directly to Firebase Firestore
  const handleUpdateAdminPassword = async () => {
    const passToSave = (localConfig.adminPassword || '').trim();
    if (!passToSave || passToSave.length < 6) {
      alert('পাসওয়ার্ডটি কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await setDoc(doc(db, 'settings', 'config'), { adminPassword: passToSave }, { merge: true });
      showNotification('মাস্টার অ্যাডমিন পাসওয়ার্ড ফায়ারবেসে সফলভাবে আপডেট হয়েছে!');
    } catch (error: any) {
      console.error("Error updating admin password in Firebase:", error);
      alert('ফায়ারবেসে পাসওয়ার্ড সংরক্ষণ করতে ব্যর্থ হয়েছে: ' + (error.message || 'Unknown error'));
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Add new Admin Email with direct Firebase Auth & Firestore synchronization
  const handleAddAdminEmail = async () => {
    if (!newAdminEmail || !newAdminEmail.includes('@')) {
      alert('অনুগ্রহ করে একটি সঠিক ইমেইল এড্রেস লিখুন।');
      return;
    }
    if (!newAdminPassword || newAdminPassword.length < 6) {
      alert('পাসওয়ার্ডটি কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    const cleanEmail = newAdminEmail.toLowerCase().trim();
    const currentList = Array.from(new Set([
      ...MAIN_SUPER_ADMIN_EMAILS,
      ...(localConfig.adminEmails || defaultAdminEmails)
    ]));
    
    if (currentList.includes(cleanEmail)) {
      alert('এই ইমেইলটি ইতিমধ্যে অ্যাডমিন তালিকায় রয়েছে।');
      return;
    }

    setIsAdminCreating(true);
    try {
      // 1. Create in Firebase Auth using secondaryAuth instance without logging out current user
      try {
        await createUserWithEmailAndPassword(secondaryAuth, cleanEmail, newAdminPassword);
      } catch (authErr: any) {
        if (authErr.code !== 'auth/email-already-in-use') {
          console.warn("Auth creation warning:", authErr);
        }
      }

      // 2. Immediately save to Firebase Firestore
      const updatedList = Array.from(new Set([...currentList, cleanEmail]));
      await setDoc(doc(db, 'settings', 'config'), { adminEmails: updatedList }, { merge: true });

      // 3. Update local state
      setLocalConfig({
        ...localConfig,
        adminEmails: updatedList
      });
      
      setNewAdminEmail('');
      setNewAdminPassword('');
      showNotification(`নতুন অ্যাডমিন (${cleanEmail}) সফলভাবে তৈরি ও ফায়ারবেসে সংরক্ষিত হয়েছে!`);
    } catch (error: any) {
      console.error("Error adding admin:", error);
      alert('ফায়ারবেসে অ্যাডমিন তৈরি করতে সমস্যা হয়েছে: ' + (error.message || 'Unknown error'));
    } finally {
      setIsAdminCreating(false);
    }
  };

  // Remove Admin Email with strict Main Admin Protection & direct Firebase Firestore deletion
  const handleRemoveAdminEmail = (emailToRemove: string) => {
    const cleanEmail = emailToRemove.toLowerCase().trim();

    // STRICT PROTECTION: Main Super Admins can NEVER be removed by anyone!
    if (MAIN_SUPER_ADMIN_EMAILS.includes(cleanEmail)) {
      alert('প্রধান অ্যাডমিনকে (Main Super Admin) কখনো রিমুভ করা সম্ভব নয়। এই অ্যাকাউন্টটি আজীবন সুরক্ষিত।');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      message: `আপনি কি নিশ্চিত যে "${cleanEmail}"-এর অ্যাডমিন অ্যাক্সেস বাতিল করে ফায়ারবেস থেকে মুছে ফেলতে চান?`,
      onConfirm: async () => {
        setIsSaving(true);
        try {
          const currentList = Array.from(new Set(authorizedAdminEmails));
          const updatedList = currentList.filter(e => e.toLowerCase().trim() !== cleanEmail);

          // Update directly in Firebase Firestore
          await setDoc(doc(db, 'settings', 'config'), { adminEmails: updatedList }, { merge: true });

          setLocalConfig({
            ...localConfig,
            adminEmails: updatedList
          });

          showNotification(`"${cleanEmail}" সফলভাবে ফায়ারবেস থেকে মুছে ফেলা হয়েছে।`);
        } catch (error: any) {
          console.error("Error removing admin email:", error);
          alert('ফায়ারবেস থেকে মুছতে সমস্যা হয়েছে: ' + (error.message || 'Unknown error'));
        } finally {
          setIsSaving(false);
        }
      }
    });
  };

  // ===================== FIREBASE AUTH SCREEN =====================
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-slate-100 overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-100 rounded-full blur-3xl pointer-events-none" />
          
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6 space-y-2">
            <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
              <Shield className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Admin Portal Login
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Sign in with your Admin Email & Password
            </p>
          </div>

          {/* Firebase Email & Password Form */}
          <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                Admin Email (Gmail)
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@gmail.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* Success / Reset Message */}
            {resetMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                <span>{resetMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isEmailPasswordLoading || !adminEmail || !password}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {isEmailPasswordLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Sign In with Email & Password</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Or 1-Click Sign-in</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Alternative Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleAdminLogin}
            disabled={isGoogleLoading}
            className="w-full py-3 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
            <span>{isGoogleLoading ? 'Connecting Google...' : 'Sign In with Authorized Gmail'}</span>
          </button>
        </motion.div>
      </div>
    );
  }

  // Filter inquiries
  const filteredInquiries = inquiries.filter(item => {
    const name = item.customerName || item.name || '';
    const mobile = item.customerMobile || item.mobile || '';
    const email = item.customerEmail || item.email || item.userEmail || '';
    const service = item.serviceName || item.serviceTitle || '';
    const details = item.details || item.message || '';
    const term = inquirySearch.toLowerCase().trim();

    const matchesSearch = !term ||
      name.toLowerCase().includes(term) ||
      mobile.toLowerCase().includes(term) ||
      email.toLowerCase().includes(term) ||
      service.toLowerCase().includes(term) ||
      details.toLowerCase().includes(term);

    const currentStatus = item.status || 'PENDING';
    const matchesStatus = inquiryStatusFilter === 'ALL' || currentStatus === inquiryStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // ===================== AUTHENTICATED DASHBOARD =====================
  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className="w-full h-full bg-white shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Top Header Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
                <span>Admin Management Panel</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 text-[10px] font-extrabold uppercase">
                  Live Firestore
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">Control and configure all pages of Euro Express Travels</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleExit}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              title="Close Admin Panel"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Global Save Toast / Notification */}
        <AnimatePresence>
          {saveSuccessMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-md shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{saveSuccessMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        
        {/* Custom Confirm Dialog for Delete Actions */}
        <AnimatePresence>
          {confirmDialog?.isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              >
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-center text-slate-900 mb-2">Confirm Deletion</h3>
                <p className="text-sm text-center text-slate-500 mb-6">{confirmDialog.message}</p>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setConfirmDialog(null)}
                    className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      confirmDialog.onConfirm();
                      setConfirmDialog(null);
                    }}
                    className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-md shadow-red-500/20 transition-colors cursor-pointer"
                  >
                    Yes, Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Layout with Responsive Sidebar */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50">
          {/* Navigation Tabs Bar */}
          <nav className="w-full md:w-64 bg-white border-r border-slate-200 p-3 sm:p-4 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto shrink-0 shadow-xs">
            <div className="hidden md:block px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Site Control Menu
            </div>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Executive Dashboard</span>
              <span className={`ml-auto px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                activeTab === 'dashboard' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'
              }`}>
                Live
              </span>
            </button>

            <button
              onClick={() => setActiveTab('inquiries')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'inquiries'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>Inquiries & CRM</span>
              {inquiries.filter(i => i.status === 'PENDING' || !i.status).length > 0 && (
                <span className={`ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === 'inquiries' ? 'bg-white text-blue-700' : 'bg-red-500 text-white'
                }`}>
                  {inquiries.filter(i => i.status === 'PENDING' || !i.status).length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('documents')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'documents'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FolderLock className="w-4 h-4" />
              <span>Document Vault</span>
              <span className={`ml-auto px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                activeTab === 'documents' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'
              }`}>
                Vault
              </span>
            </button>

            <button
              onClick={() => setActiveTab('team')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'team'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Our Team</span>
              <span className={`ml-auto text-[10px] font-bold opacity-80 ${activeTab === 'team' ? 'text-white' : 'text-slate-400'}`}>
                {localTeam.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'services'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Layout className="w-4 h-4" />
              <span>Services Page</span>
              <span className={`ml-auto text-[10px] font-bold opacity-80 ${activeTab === 'services' ? 'text-white' : 'text-slate-400'}`}>
                {localServices.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'about'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>About & Stats</span>
            </button>

            <button
              onClick={() => setActiveTab('faqs')}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'faqs'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>FAQ Page</span>
              <span className={`ml-auto text-[10px] font-bold opacity-80 ${activeTab === 'faqs' ? 'text-white' : 'text-slate-400'}`}>
                {localFaqs.length}
              </span>
            </button>

            <button
              onClick={() => {
                setIsSecurityUnlocked(false);
                setSecurityInputPass('');
                setSecurityPassError('');
                setActiveTab('config');
              }}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'config'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Site & Security</span>
            </button>

            <div className="hidden md:block mt-auto pt-4 border-t border-slate-100 space-y-2">
              <button
                onClick={handleExit}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl font-bold text-xs text-slate-500 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Close Panel</span>
              </button>
            </div>
          </nav>

          {/* Active Tab Panel Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">

            {/* ================= TAB 0: DIGITAL DASHBOARD ================= */}
            {activeTab === 'dashboard' && (
              <AdminDigitalDashboard
                inquiries={inquiries}
                services={localServices}
                reviews={localReviews}
                team={localTeam}
                faqs={localFaqs}
                config={localConfig}
                loadingInquiries={loadingInquiries}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onUpdateInquiryStatus={updateInquiryStatus}
              />
            )}

            {/* ================= TAB 1: INQUIRIES & CRM ================= */}
            {activeTab === 'inquiries' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Customer Inquiries & Leads</h3>
                    <p className="text-xs text-slate-500">Real-time incoming service requests and callback leads.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={inquirySearch}
                        onChange={(e) => setInquirySearch(e.target.value)}
                        placeholder="Search name, phone, service..."
                        className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none w-44 sm:w-56"
                      />
                    </div>

                    <select
                      value={inquiryStatusFilter}
                      onChange={(e) => setInquiryStatusFilter(e.target.value)}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                    >
                      <option value="ALL">All Status</option>
                      <option value="PENDING">Pending (অপেক্ষমাণ)</option>
                      <option value="PROCESSING">Processing (প্রসেসিং)</option>
                      <option value="DOCUMENT_SUBMITTED">Doc Submitted (ফাইল জমা)</option>
                      <option value="EMBASSY_APPOINTMENT">Embassy Appointment</option>
                      <option value="APPROVED">Approved (অনুমোদিত)</option>
                      <option value="COMPLETED">Completed (সম্পন্ন)</option>
                      <option value="CONTACTED">Contacted (যোগাযোগ সম্পন্ন)</option>
                      <option value="REJECTED">Rejected (বাতিল)</option>
                    </select>
                  </div>
                </div>

                {loadingInquiries ? (
                  <div className="text-center py-16">
                    <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-bold">Loading inquiries from database...</p>
                  </div>
                ) : filteredInquiries.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
                    <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <h4 className="text-base font-bold text-slate-700">No matching inquiries found</h4>
                    <p className="text-xs text-slate-400 mt-1">When customers submit service requests or Talk to Us forms, they will appear here instantly.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredInquiries.map((inquiry) => {
                      const status = inquiry.status || 'PENDING';
                      const customerMobile = inquiry.customerMobile || inquiry.mobile || '';
                      const customerName = inquiry.customerName || inquiry.name || 'Valued Customer';
                      const customerEmail = inquiry.customerEmail || inquiry.email || inquiry.userEmail || '';
                      const serviceName = inquiry.serviceName || inquiry.serviceTitle || 'General Consultation';
                      const details = inquiry.details || inquiry.message || '';
                      const formattedDate = inquiry.createdAt?.toDate 
                        ? inquiry.createdAt.toDate().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : (inquiry.createdAt?.seconds ? new Date(inquiry.createdAt.seconds * 1000).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent');

                      const cleanMobileForWa = customerMobile.replace(/[^0-9]/g, '');
                      const cleanMobileForTel = customerMobile.replace(/\s/g, '');

                      return (
                        <div
                          key={inquiry.id}
                          className={`bg-white rounded-2xl p-5 border shadow-xs transition-all ${
                            status === 'PENDING' ? 'border-amber-200 ring-1 ring-amber-100' : 'border-slate-200/90'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="space-y-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-base font-black text-slate-900">{customerName}</h4>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                                  status === 'CONTACTED' ? 'bg-blue-100 text-blue-800' :
                                  status === 'APPROVED' || status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                                  status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                  'bg-purple-100 text-purple-800'
                                }`}>
                                  {status}
                                </span>
                                {inquiry.type && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                                    {inquiry.type === 'TalkToUs' ? '💬 Talk to Us' : '📋 Service Request'}
                                  </span>
                                )}
                                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formattedDate}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                                <div className="text-blue-700 font-bold">
                                  Service: <span className="font-semibold text-slate-800">{serviceName}</span>
                                </div>
                                {customerEmail && (
                                  <div className="text-slate-500 font-medium">
                                    Email: <span className="text-slate-700">{customerEmail}</span>
                                  </div>
                                )}
                              </div>

                              {details && (
                                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2 font-normal leading-relaxed">
                                  "{details}"
                                </p>
                              )}

                              {inquiry.adminReply && (
                                <div className="mt-2 p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl relative">
                                  <span className="absolute -top-2 left-3 bg-white px-1 text-[9px] font-black uppercase text-blue-600 tracking-wider">Admin Reply</span>
                                  <p className="text-xs text-blue-800 font-medium leading-relaxed mt-1">
                                    {inquiry.adminReply}
                                  </p>
                                </div>
                              )}
                              
                              {replyingToId === inquiry.id && (
                                <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                  <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Type your reply to the user..."
                                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                                    rows={3}
                                  />
                                  <div className="flex items-center justify-end gap-2 mt-2">
                                    <button
                                      onClick={() => { setReplyingToId(null); setReplyText(''); }}
                                      className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => handleSaveReply(inquiry.id)}
                                      disabled={!replyText.trim()}
                                      className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all cursor-pointer"
                                    >
                                      Send Reply
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              <button
                                onClick={() => {
                                  setReplyingToId(replyingToId === inquiry.id ? null : inquiry.id);
                                  setReplyText(inquiry.adminReply || '');
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border ${
                                  replyingToId === inquiry.id 
                                    ? 'bg-blue-100 text-blue-700 border-blue-200' 
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                                }`}
                                title="Reply to User"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>{inquiry.adminReply ? 'Edit Reply' : 'Add Reply'}</span>
                              </button>

                              {cleanMobileForWa && (
                                <a
                                  href={`https://wa.me/${cleanMobileForWa}?text=Hello%20${encodeURIComponent(customerName)},%20thank%20you%20for%20contacting%20Euro%20Express%20Travels%20regarding%20${encodeURIComponent(serviceName)}.`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                                  title="Reply on WhatsApp"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>WhatsApp</span>
                                </a>
                              )}

                              {customerMobile && (
                                <a
                                  href={`tel:${cleanMobileForTel}`}
                                  className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                                  title="Call Mobile"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                  <span>{customerMobile}</span>
                                </a>
                              )}

                              <select
                                value={status}
                                onChange={(e) => updateInquiryStatus(inquiry.id, e.target.value)}
                                className="px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
                              >
                                <option value="PENDING">Pending (অপেক্ষমাণ)</option>
                                <option value="PROCESSING">Processing (প্রসেসিং চলছে)</option>
                                <option value="DOCUMENT_SUBMITTED">Documents Submitted (ফাইল জমা)</option>
                                <option value="EMBASSY_APPOINTMENT">Embassy Appointment (অ্যাপয়েন্টমেন্ট)</option>
                                <option value="APPROVED">Approved (অনুমোদিত)</option>
                                <option value="COMPLETED">Completed (সম্পন্ন)</option>
                                <option value="CONTACTED">Contacted (যোগাযোগ সম্পন্ন)</option>
                                <option value="REJECTED">Rejected (বাতিল)</option>
                              </select>

                              <button
                                onClick={() => deleteInquiry(inquiry.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                                title="Delete inquiry"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ================= TAB: DOCUMENTS (নথি ও ভল্ট) ================= */}
            {activeTab === 'documents' && (
              <AdminDocumentsTab
                config={localConfig}
                adminEmail={user?.email || 'Admin'}
                onUpdateConfig={async (newCfg) => {
                  setLocalConfig(newCfg);
                  await setDoc(doc(db, 'settings', 'config'), newCfg, { merge: true });
                }}
                showNotification={showNotification}
              />
            )}

            {/* ================= TAB 2: OUR TEAM MANAGEMENT ================= */}
            {activeTab === 'team' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Our Team Members</h3>
                    <p className="text-xs text-slate-500">
                      Manage leadership & consultants displayed on the <strong>Our Team</strong> page.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={addTeamMember}
                      className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Member</span>
                    </button>

                    <button
                      onClick={saveAllTeam}
                      disabled={isSaving}
                      className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Saving...' : 'Save All Team Changes'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {localTeam.map((member, index) => (
                    <div
                      key={member.id || index}
                      className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition-all"
                    >
                      {/* Top Header info */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                            Consultant #{index + 1}
                          </span>
                          <button
                            onClick={() => deleteTeamMember(member.id)}
                            className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-400">Full Name</label>
                            <input
                              type="text"
                              value={member.name}
                              onChange={(e) => {
                                setLocalTeam(localTeam.map(m => m.id === member.id ? { ...m, name: e.target.value } : m));
                              }}
                              placeholder="e.g. MD. Faruk Ahmed"
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none mt-0.5"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-400">Designation / Role</label>
                            <input
                              type="text"
                              value={member.designation}
                              onChange={(e) => {
                                setLocalTeam(localTeam.map(m => m.id === member.id ? { ...m, designation: e.target.value } : m));
                              }}
                              placeholder="e.g. Founder & Managing Director"
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-blue-700 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none mt-0.5"
                            />
                          </div>
                        </div>

                        {/* Short Introduction */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-slate-400">Short Introduction / Bio</label>
                          <textarea
                            rows={3}
                            value={member.shortIntro}
                            onChange={(e) => {
                              setLocalTeam(localTeam.map(m => m.id === member.id ? { ...m, shortIntro: e.target.value } : m));
                            }}
                            placeholder="Provide a brief summary of qualifications and experience..."
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                          />
                        </div>
                      </div>

                      {/* Contact Info Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-100">
                        <div>
                          <label className="text-[9px] font-bold uppercase text-slate-400">WhatsApp</label>
                          <input
                            type="text"
                            value={member.whatsapp || ''}
                            onChange={(e) => {
                              setLocalTeam(localTeam.map(m => m.id === member.id ? { ...m, whatsapp: e.target.value } : m));
                            }}
                            placeholder="8801798483565"
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700 outline-none mt-0.5"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold uppercase text-slate-400">Phone</label>
                          <input
                            type="text"
                            value={member.phone || ''}
                            onChange={(e) => {
                              setLocalTeam(localTeam.map(m => m.id === member.id ? { ...m, phone: e.target.value } : m));
                            }}
                            placeholder="01798483565"
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700 outline-none mt-0.5"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold uppercase text-slate-400">Email Address</label>
                          <input
                            type="email"
                            value={member.email || ''}
                            onChange={(e) => {
                              setLocalTeam(localTeam.map(m => m.id === member.id ? { ...m, email: e.target.value } : m));
                            }}
                            placeholder="consultant@euroexpress.com"
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700 outline-none mt-0.5"
                          />
                        </div>
                      </div>

                      {/* Card Action Footer */}
                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => saveSingleTeamMember(member)}
                          disabled={isSaving}
                          className="flex items-center gap-1 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Consultant</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= TAB 3: SERVICES MANAGEMENT ================= */}
            {activeTab === 'services' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Services & Visa Categories</h3>
                    <p className="text-xs text-slate-500">Controls the Services section on the homepage and the full Services page.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={addService}
                      className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Service</span>
                    </button>

                    <button
                      onClick={saveAllServices}
                      disabled={isSaving}
                      className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Saving...' : 'Save All Services'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {localServices.map((service, index) => (
                    <div
                      key={service.id}
                      className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Service #{index + 1}
                          </span>
                          <select
                            value={service.icon}
                            onChange={(e) => {
                              setLocalServices(localServices.map(s => s.id === service.id ? { ...s, icon: e.target.value } : s));
                            }}
                            className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200 outline-none"
                          >
                            {AVAILABLE_ICONS.map(iconName => (
                              <option key={iconName} value={iconName}>{iconName}</option>
                            ))}
                          </select>
                        </div>

                        <button
                          onClick={() => deleteService(service.id)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-colors cursor-pointer"
                          title="Delete service"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400">Service Title</label>
                        <input
                          type="text"
                          value={service.title}
                          onChange={(e) => {
                            setLocalServices(localServices.map(s => s.id === service.id ? { ...s, title: e.target.value } : s));
                          }}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400">Image URL (Optional)</label>
                        <input
                          type="text"
                          value={service.imageUrl || ''}
                          onChange={(e) => {
                            setLocalServices(localServices.map(s => s.id === service.id ? { ...s, imageUrl: e.target.value } : s));
                          }}
                          placeholder="https://res.cloudinary.com/..."
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400">Description</label>
                        <textarea
                          rows={2}
                          value={service.description}
                          onChange={(e) => {
                            setLocalServices(localServices.map(s => s.id === service.id ? { ...s, description: e.target.value } : s));
                          }}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        />
                      </div>

                      {/* Card Action Footer */}
                      <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => saveSingleService(service)}
                          disabled={isSaving}
                          className="flex items-center gap-1 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Service</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= TAB 4: ABOUT PAGE & STATS ================= */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">About Us Page & Statistics</h3>
                    <p className="text-xs text-slate-500">Edit company story, experience years, visa success metrics, and milestones.</p>
                  </div>

                  <button
                    onClick={saveAboutContent}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Save About Page'}</span>
                  </button>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-6">
                  {/* Title and Subtitle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">About Header Title</label>
                      <input
                        type="text"
                        value={localConfig.aboutConfig?.title || 'About Euro Express Travels'}
                        onChange={(e) => {
                          setLocalConfig({
                            ...localConfig,
                            aboutConfig: {
                              ...(localConfig.aboutConfig || INITIAL_ABOUT_CONFIG),
                              title: e.target.value
                            }
                          });
                        }}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">About Subtitle / Tagline</label>
                      <input
                        type="text"
                        value={localConfig.aboutConfig?.subtitle || 'Your Trusted Gateway to Global Journeys & Seamless Visas'}
                        onChange={(e) => {
                          setLocalConfig({
                            ...localConfig,
                            aboutConfig: {
                              ...(localConfig.aboutConfig || INITIAL_ABOUT_CONFIG),
                              subtitle: e.target.value
                            }
                          });
                        }}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Main Story */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Main Company Story</label>
                    <textarea
                      rows={4}
                      value={localConfig.aboutConfig?.mainStory || INITIAL_ABOUT_CONFIG.mainStory}
                      onChange={(e) => {
                        setLocalConfig({
                          ...localConfig,
                          aboutConfig: {
                            ...(localConfig.aboutConfig || INITIAL_ABOUT_CONFIG),
                            mainStory: e.target.value
                          }
                        });
                      }}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  {/* Secondary Story */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">Mission & Commitment Paragraph</label>
                    <textarea
                      rows={3}
                      value={localConfig.aboutConfig?.secondaryStory || INITIAL_ABOUT_CONFIG.secondaryStory}
                      onChange={(e) => {
                        setLocalConfig({
                          ...localConfig,
                          aboutConfig: {
                            ...(localConfig.aboutConfig || INITIAL_ABOUT_CONFIG),
                            secondaryStory: e.target.value
                          }
                        });
                      }}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  {/* Key Stats Grid */}
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">
                      Performance Metrics & Counters
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400">Experience Years</label>
                        <input
                          type="text"
                          value={localConfig.aboutConfig?.experienceYears || '10+'}
                          onChange={(e) => {
                            setLocalConfig({
                              ...localConfig,
                              aboutConfig: {
                                ...(localConfig.aboutConfig || INITIAL_ABOUT_CONFIG),
                                experienceYears: e.target.value
                              }
                            });
                          }}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-amber-600 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400">Visa Success Rate</label>
                        <input
                          type="text"
                          value={localConfig.aboutConfig?.visaSuccessRate || '98.5%'}
                          onChange={(e) => {
                            setLocalConfig({
                              ...localConfig,
                              aboutConfig: {
                                ...(localConfig.aboutConfig || INITIAL_ABOUT_CONFIG),
                                visaSuccessRate: e.target.value
                              }
                            });
                          }}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-emerald-600 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400">Happy Clients</label>
                        <input
                          type="text"
                          value={localConfig.aboutConfig?.happyClients || '15,000+'}
                          onChange={(e) => {
                            setLocalConfig({
                              ...localConfig,
                              aboutConfig: {
                                ...(localConfig.aboutConfig || INITIAL_ABOUT_CONFIG),
                                happyClients: e.target.value
                              }
                            });
                          }}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-blue-600 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400">Countries Served</label>
                        <input
                          type="text"
                          value={localConfig.aboutConfig?.countriesServed || '50+'}
                          onChange={(e) => {
                            setLocalConfig({
                              ...localConfig,
                              aboutConfig: {
                                ...(localConfig.aboutConfig || INITIAL_ABOUT_CONFIG),
                                countriesServed: e.target.value
                              }
                            });
                          }}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-purple-600 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 6: FAQ MANAGEMENT ================= */}
            {activeTab === 'faqs' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Frequently Asked Questions (FAQ)</h3>
                    <p className="text-xs text-slate-500">Manage questions and answers displayed on the FAQ page.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={addFaq}
                      className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add FAQ</span>
                    </button>

                    <button
                      onClick={saveAllFaqs}
                      disabled={isSaving}
                      className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Saving...' : 'Save All FAQs'}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {localFaqs.map((faq, index) => (
                    <div
                      key={faq.id || index}
                      className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                          Question #{index + 1}
                        </span>
                        <button
                          onClick={() => deleteFaq(faq.id)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400">Question</label>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => {
                            setLocalFaqs(localFaqs.map(f => f.id === faq.id ? { ...f, question: e.target.value } : f));
                          }}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400">Answer</label>
                        <textarea
                          rows={2}
                          value={faq.answer}
                          onChange={(e) => {
                            setLocalFaqs(localFaqs.map(f => f.id === faq.id ? { ...f, answer: e.target.value } : f));
                          }}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed outline-none resize-none"
                        />
                      </div>

                      {/* Card Action Footer */}
                      <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => saveSingleFaq(faq)}
                          disabled={isSaving}
                          className="flex items-center gap-1 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save FAQ</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= TAB 7: SITE & SECURITY SETTINGS ================= */}
            {activeTab === 'config' && (
              <div className="space-y-6">
                {!isSecurityUnlocked && (
                  <div className="max-w-md mx-auto my-10 bg-white p-8 rounded-2xl border-2 border-blue-600 shadow-2xl text-center space-y-5 animate-in fade-in zoom-in duration-200">
                    <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                      <Lock className="w-8 h-8 stroke-[2.5]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900">Site & Security সুরক্ষিত এলাকা</h3>
                      <p className="text-xs font-medium text-slate-500 mt-1.5">
                        এই সেকশনে প্রবেশ করতে সিকিউরিটি পাসওয়ার্ড দিন।
                      </p>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (securityInputPass === 'Admintaslima123') {
                          setIsSecurityUnlocked(true);
                          setSecurityPassError('');
                        } else {
                          setSecurityPassError('ভুল পাসওয়ার্ড! সঠিক কোড দিন: Admintaslima123');
                        }
                      }}
                      className="space-y-4 pt-2"
                    >
                      <div>
                        <input
                          type="password"
                          id="security-pass-input"
                          value={securityInputPass}
                          onChange={(e) => setSecurityInputPass(e.target.value)}
                          placeholder="লক পাসওয়ার্ড দিন..."
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 text-base text-center font-bold tracking-wider focus:outline-hidden focus:border-blue-600 bg-slate-50 focus:bg-white"
                          autoFocus
                        />
                        {securityPassError && (
                          <p className="text-xs font-bold text-rose-600 mt-2 bg-rose-50 py-1.5 px-3 rounded-lg border border-rose-200">
                            {securityPassError}
                          </p>
                        )}
                      </div>

                      <button
                        type="submit"
                        id="security-unlock-btn"
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4" /> আনলক করুন
                      </button>
                    </form>
                  </div>
                )}

                {isSecurityUnlocked && (
                  <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Site Configuration & Security</h3>
                    <p className="text-xs text-slate-500">Manage contact details, social links, passwords, and authorized admin accounts.</p>
                  </div>

                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => setIsSecurityUnlocked(false)}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Lock Settings</span>
                    </button>
                    <button
                      onClick={saveConfig}
                      disabled={isSaving}
                      className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Saving...' : 'Save Site Settings'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* General Contact Info Card */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-600" />
                      <span>Contact & Company Info</span>
                    </h4>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400">Company Name</label>
                      <input
                        type="text"
                        value={localConfig.name}
                        onChange={(e) => setLocalConfig({ ...localConfig, name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400">WhatsApp Number (with country code)</label>
                      <input
                        type="text"
                        value={localConfig.whatsappNumber}
                        onChange={(e) => setLocalConfig({ ...localConfig, whatsappNumber: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400">Direct Phone</label>
                      <input
                        type="text"
                        value={localConfig.phone}
                        onChange={(e) => setLocalConfig({ ...localConfig, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400">Email Address</label>
                      <input
                        type="email"
                        value={localConfig.email}
                        onChange={(e) => setLocalConfig({ ...localConfig, email: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400">Office Address</label>
                      <textarea
                        rows={2}
                        value={localConfig.address}
                        onChange={(e) => setLocalConfig({ ...localConfig, address: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400">Facebook Page URL</label>
                      <input
                        type="text"
                        value={localConfig.facebookPage}
                        onChange={(e) => setLocalConfig({ ...localConfig, facebookPage: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-blue-700 outline-none"
                      />
                    </div>
                  </div>

                  {/* Security & Password Card (Fully Synced with Firebase) */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <span>Security & Access Control</span>
                      </h4>
                    </div>

                    {/* Master Admin Password Management */}
                    <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-black uppercase tracking-wider text-amber-900 block flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                          Master Admin Password (Step 2 of 2FA)
                        </label>
                        <span className="text-[10px] text-amber-700 font-bold">ফায়ারবেসে সংরক্ষিত</span>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={localConfig.adminPassword || 'T@slima-2904'}
                            onChange={(e) => setLocalConfig({ ...localConfig, adminPassword: e.target.value })}
                            placeholder="New Admin Password"
                            className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none pr-10 focus:ring-2 focus:ring-amber-500/20"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                            title={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={handleUpdateAdminPassword}
                          disabled={isUpdatingPassword}
                          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95"
                          title="সরাসরি ফায়ারবেসে পাসওয়ার্ড সংরক্ষণ করুন"
                        >
                          {isUpdatingPassword ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>আপডেট হচ্ছে...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-3.5 h-3.5" />
                              <span>পাসওয়ার্ড সেভ করুন</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[10px] text-amber-800/80">
                        পাসওয়ার্ড পরিবর্তন করে 'পাসওয়ার্ড সেভ করুন' বাটনে ক্লিক করলেই তা সরাসরি ফায়ারবেসে আপডেট হয়ে যাবে।
                      </p>
                    </div>

                    {/* Authorized Admin Gmail Accounts */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                          Authorized Admin Accounts (অ্যাডমিন তালিকা)
                        </label>
                        <span className="text-[10px] text-slate-500 font-mono font-semibold">{authorizedAdminEmails.length} Accounts</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        শুধুমাত্র এই ইমেইলগুলো দিয়ে লগইন করলে অ্যাডমিন প্যানেল আনলক হবে। প্রধান সুপার অ্যাডমিনরা আজীবন স্থায়ী ও সুরক্ষিত।
                      </p>

                      {/* Admin Accounts List */}
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {authorizedAdminEmails.map((email) => {
                          const isMain = MAIN_SUPER_ADMIN_EMAILS.includes(email.toLowerCase().trim());
                          return (
                            <div
                              key={email}
                              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                                isMain 
                                  ? 'bg-blue-50/70 border-blue-200 text-blue-950 shadow-xs' 
                                  : 'bg-slate-50 border-slate-200 text-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {isMain ? (
                                  <Shield className="w-4 h-4 text-blue-600 shrink-0" />
                                ) : (
                                  <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
                                )}
                                <span className="truncate font-mono">{email}</span>
                                {isMain && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-600 text-white uppercase tracking-wider shrink-0 flex items-center gap-1">
                                    <Lock className="w-2.5 h-2.5" /> Main Super Admin
                                  </span>
                                )}
                              </div>

                              <div>
                                {isMain ? (
                                  <div 
                                    className="p-1 text-blue-600 flex items-center gap-1 cursor-default"
                                    title="প্রধান অ্যাডমিনকে সরানো অসম্ভব (Permanently Protected)"
                                  >
                                    <Lock className="w-3.5 h-3.5" />
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveAdminEmail(email)}
                                    className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                    title="অ্যাডমিন অ্যাক্সেস বাতিল করে ফায়ারবেস থেকে মুছুন"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Add New Admin Section (Available to all admins) */}
                      <div className="pt-2 border-t border-slate-100">
                        <p className="text-[11px] font-bold text-slate-700 mb-2">নতুন অ্যাডমিন যুক্ত করুন (ফায়ারবেসে সরাসরি সংরক্ষিত হবে):</p>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="email"
                            value={newAdminEmail}
                            onChange={(e) => setNewAdminEmail(e.target.value)}
                            placeholder="New Admin Gmail..."
                            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                          />
                          <input
                            type="password"
                            value={newAdminPassword}
                            onChange={(e) => setNewAdminPassword(e.target.value)}
                            placeholder="পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)"
                            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                          />
                          <button
                            type="button"
                            onClick={handleAddAdminEmail}
                            disabled={isAdminCreating}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 min-w-[85px] active:scale-95"
                          >
                            {isAdminCreating ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>তৈরি হচ্ছে...</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>যুক্ত করুন</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Hero Title & Subtitle */}
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
                        Homepage Hero Title & Subtitle
                      </label>
                      <div>
                        <label className="text-[9px] font-bold uppercase text-slate-400">Hero Main Title</label>
                        <input
                          type="text"
                          value={localConfig.heroTitle}
                          onChange={(e) => setLocalConfig({ ...localConfig, heroTitle: e.target.value })}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase text-slate-400">Hero Subtitle</label>
                        <textarea
                          rows={2}
                          value={localConfig.heroSubtitle}
                          onChange={(e) => setLocalConfig({ ...localConfig, heroSubtitle: e.target.value })}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none resize-none"
                        />
                      </div>
                      
                      {/* Hero Banner Upload */}
                      <div>
                        <label className="text-[9px] font-bold uppercase text-slate-400">Hero Banner Background Image</label>
                        <div className="flex flex-col gap-2 mt-1">
                          {localConfig.heroBannerUrl && localConfig.heroBannerUrl !== "" && (
                            <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-200">
                              <img src={localConfig.heroBannerUrl} alt="Hero Banner Preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setLocalConfig({ ...localConfig, heroBannerUrl: "" })}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                                title="Remove Banner (Use Default)"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                          <label className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed ${isUploadingBanner ? 'border-blue-300 bg-blue-50 text-blue-500' : 'border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/50 text-slate-500 hover:text-blue-600'} rounded-xl cursor-pointer transition-all`}>
                            {isUploadingBanner ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-xs font-bold">Uploading to Cloudinary...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4" />
                                <span className="text-xs font-bold">{localConfig.heroBannerUrl ? 'Change Banner Image' : 'Upload Banner Image'}</span>
                              </>
                            )}
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              disabled={isUploadingBanner}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setIsUploadingBanner(true);
                                try {
                                  const result = await uploadFileToCloudinary(file);
                                  setLocalConfig({ ...localConfig, heroBannerUrl: result.secure_url });
                                } catch (error: any) {
                                  console.error("Banner upload failed:", error);
                                  alert(`Upload failed: ${error.message}`);
                                } finally {
                                  setIsUploadingBanner(false);
                                  e.target.value = '';
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                  </>
                )}
              </div>
            )}

          </div>
        </div>
      </motion.div>
    </div>
  );
}
