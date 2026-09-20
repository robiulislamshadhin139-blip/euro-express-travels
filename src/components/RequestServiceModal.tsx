import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Upload, CheckCircle2, LogIn, RefreshCw } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Service, INITIAL_SERVICES } from '../types';
import { db, auth, googleProvider } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { User, signInWithPopup } from 'firebase/auth';

interface RequestServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  selectedServiceId?: string;
  isTalkToUs?: boolean;
  user: User | null;
  onLoginRequired: () => void;
}

export default function RequestServiceModal({ 
  isOpen, 
  onClose, 
  services, 
  selectedServiceId,
  isTalkToUs,
  user,
  onLoginRequired
}: RequestServiceModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    serviceId: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const availableServices = (services && services.length > 0) ? services : INITIAL_SERVICES;

  // Reset form when modal opens or selection changes
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        name: prev.name || user?.displayName || '',
        mobile: prev.mobile || '',
        email: prev.email || user?.email || '',
        serviceId: selectedServiceId || prev.serviceId || '',
        message: isTalkToUs ? (prev.message || 'I need help with...') : prev.message
      }));
      setIsSuccess(false);
    }
  }, [isOpen, selectedServiceId, isTalkToUs, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const serviceObj = availableServices.find(s => s.id === formData.serviceId);
      const chosenServiceName = serviceObj?.title || (formData.serviceId === 'other' ? 'General Consultation' : 'General Inquiry');

      // Save to Firestore inquiries collection
      await addDoc(collection(db, 'inquiries'), {
        name: formData.name.trim(),
        customerName: formData.name.trim(),
        mobile: formData.mobile.trim(),
        customerMobile: formData.mobile.trim(),
        email: (formData.email || user?.email || '').trim(),
        customerEmail: (formData.email || user?.email || '').trim(),
        userEmail: (user?.email || formData.email || '').trim(),
        userId: user?.uid || '',
        serviceId: formData.serviceId,
        serviceTitle: chosenServiceName,
        serviceName: chosenServiceName,
        message: formData.message.trim(),
        details: formData.message.trim(),
        type: isTalkToUs ? 'TalkToUs' : 'ServiceRequest',
        status: 'PENDING',
        createdAt: serverTimestamp()
      });
      
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error: any) {
      console.error('Error sending request:', error);
      const errorMessage = error.code === 'permission-denied' 
        ? 'Permission Denied: Please refresh the page and try again.'
        : `Error: ${error.message || 'Something went wrong. Please try again.'}`;
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-black text-blue-900">
                    {isTalkToUs ? 'Talk With Us' : 'Request Service'}
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    {isTalkToUs 
                      ? 'Tell us what you need and our team will contact you.' 
                      : 'Fill in the details below to request this service.'}
                  </p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              {isSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center space-y-4"
                >
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Request Sent Successfully!</h3>
                  <p className="text-slate-500">Thank you, {formData.name}. Our team will contact you shortly.</p>
                  <button
                    onClick={onClose}
                    className="mt-6 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
                  >
                    Close
                  </button>
                </motion.div>
              ) : !user ? (
                <div className="py-8 text-center space-y-6">
                  <div className="flex items-center justify-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-3xl mx-auto w-fit shadow-sm">
                    <LogIn className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Login Required</h3>
                    <p className="text-slate-500 text-sm font-medium mt-1 max-w-sm mx-auto">
                      Please sign in with Google to send your service request or inquiry directly to our team.
                    </p>
                  </div>
                  <button
                    onClick={handleGoogleLogin}
                    disabled={isLoggingIn}
                    className="w-full max-w-xs mx-auto bg-white hover:bg-slate-50 disabled:opacity-60 text-slate-800 border-2 border-slate-200 hover:border-slate-300 py-3.5 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-98 transition-all shadow-md shadow-slate-100"
                  >
                    {isLoggingIn ? (
                      <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
                    ) : (
                      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    )}
                    <span className="text-slate-800 text-sm font-semibold tracking-wide">
                      {isLoggingIn ? 'Signing in...' : 'Sign in with Google'}
                    </span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Name</label>
                      <input
                        required
                        disabled={isSubmitting}
                        type="text"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm disabled:opacity-50"
                        placeholder="Your Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Mobile Number</label>
                      <input
                        required
                        disabled={isSubmitting}
                        type="tel"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm disabled:opacity-50"
                        placeholder="e.g. +8801..."
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Email (Optional)</label>
                    <input
                      disabled={isSubmitting}
                      type="email"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm disabled:opacity-50"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Select Service</label>
                    <select
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm bg-white disabled:opacity-50"
                      value={formData.serviceId}
                      onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                    >
                      <option value="">Select a service</option>
                      {availableServices.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.title}
                        </option>
                      ))}
                      <option value="other">Other / General Inquiry</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Message / Your Requirements</label>
                    <textarea
                      disabled={isSubmitting}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm resize-none disabled:opacity-50"
                      placeholder="Describe your needs in detail..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </div>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Request
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
