import { motion, AnimatePresence } from 'framer-motion';
import { X, LogOut, Clock, CheckCircle2, User as UserIcon, AlertCircle, FileText, CheckCircle, ArrowRight } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { User, signOut } from 'firebase/auth';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export default function UserProfileModal({ isOpen, onClose, user }: UserProfileModalProps) {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      setLoading(true);
      const userEmail = (user.email || '').toLowerCase().trim();
      const userId = user.uid || '';

      const inquiriesMap = new Map<string, any>();

      const updateState = () => {
        const list = Array.from(inquiriesMap.values());
        list.sort((a, b) => {
          const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
          const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
          return bTime - aTime;
        });
        setInquiries(list);
        setLoading(false);
      };

      const unsubscribers: (() => void)[] = [];

      // 1. Query by userId (Primary)
      if (userId) {
        try {
          const qUserId = query(collection(db, 'inquiries'), where('userId', '==', userId));
          const unsub1 = onSnapshot(qUserId, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'removed') {
                inquiriesMap.delete(change.doc.id);
              } else {
                inquiriesMap.set(change.doc.id, { id: change.doc.id, ...change.doc.data() });
              }
            });
            updateState();
          }, (error) => {
            console.warn("Error fetching inquiries by userId:", error);
            setLoading(false);
          });
          unsubscribers.push(unsub1);
        } catch (e) {
          console.warn("Failed to subscribe by userId:", e);
        }
      }

      // 2. Query by userEmail (Fallback & Link)
      if (userEmail) {
        try {
          const qUserEmail = query(collection(db, 'inquiries'), where('userEmail', '==', userEmail));
          const unsub2 = onSnapshot(qUserEmail, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'removed') {
                if (!inquiriesMap.get(change.doc.id)?.userId || inquiriesMap.get(change.doc.id)?.userId !== userId) {
                  inquiriesMap.delete(change.doc.id);
                }
              } else {
                inquiriesMap.set(change.doc.id, { id: change.doc.id, ...change.doc.data() });
              }
            });
            updateState();
          }, (error) => {
            console.warn("Error fetching inquiries by userEmail:", error);
          });
          unsubscribers.push(unsub2);
        } catch (e) {
          console.warn("Failed to subscribe by userEmail:", e);
        }

        try {
          const qCustomerEmail = query(collection(db, 'inquiries'), where('customerEmail', '==', userEmail));
          const unsub3 = onSnapshot(qCustomerEmail, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'removed') {
                if (!inquiriesMap.get(change.doc.id)?.userId || inquiriesMap.get(change.doc.id)?.userId !== userId) {
                  inquiriesMap.delete(change.doc.id);
                }
              } else {
                inquiriesMap.set(change.doc.id, { id: change.doc.id, ...change.doc.data() });
              }
            });
            updateState();
          }, (error) => {
            console.warn("Error fetching inquiries by customerEmail:", error);
          });
          unsubscribers.push(unsub3);
        } catch (e) {
          console.warn("Failed to subscribe by customerEmail:", e);
        }
      }

      return () => {
        unsubscribers.forEach(unsub => unsub());
      };
    }
  }, [isOpen, user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onClose();
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout. Please try again.");
    }
  };

  const getStatusInfo = (status: string) => {
    const s = (status || 'PENDING').toUpperCase();
    switch (s) {
      case 'PENDING':
        return { 
          label: 'Pending Review', 
          bnLabel: 'অপেক্ষমাণ',
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500'
        };
      case 'PROCESSING':
        return { 
          label: 'In Processing', 
          bnLabel: 'প্রসেসিং চলছে',
          color: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500'
        };
      case 'DOCUMENT_SUBMITTED':
        return { 
          label: 'Documents Submitted', 
          bnLabel: 'ফাইল জমা হয়েছে',
          color: 'bg-purple-50 text-purple-700 border-purple-200',
          dot: 'bg-purple-500'
        };
      case 'EMBASSY_APPOINTMENT':
        return { 
          label: 'Embassy Appointment', 
          bnLabel: 'এম্বাসি অ্যাপয়েন্টমেন্ট',
          color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          dot: 'bg-indigo-500'
        };
      case 'APPROVED':
        return { 
          label: 'Approved', 
          bnLabel: 'অনুমোদিত',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500'
        };
      case 'COMPLETED':
        return { 
          label: 'Completed', 
          bnLabel: 'সম্পন্ন',
          color: 'bg-green-50 text-green-700 border-green-200',
          dot: 'bg-green-500'
        };
      case 'CONTACTED':
        return { 
          label: 'Contacted', 
          bnLabel: 'যোগাযোগ করা হয়েছে',
          color: 'bg-teal-50 text-teal-700 border-teal-200',
          dot: 'bg-teal-500'
        };
      case 'REJECTED':
        return { 
          label: 'Rejected', 
          bnLabel: 'বাতিল',
          color: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500'
        };
      default:
        return { 
          label: status, 
          bnLabel: '',
          color: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-500'
        };
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
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
            className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-4">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    className="w-13 h-13 rounded-2xl shadow-sm object-cover border-2 border-white ring-2 ring-blue-100" 
                  />
                ) : (
                  <div className="w-13 h-13 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xl shadow-xs">
                    <UserIcon className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-black text-slate-900 leading-tight">
                    {user.displayName || 'User Profile'}
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">{user.email}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2.5 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Content (User Requests & Status) */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>My Application & Service Status</span>
                </h3>
                <span className="text-xs font-bold text-slate-400">
                  {inquiries.length} {inquiries.length === 1 ? 'Request' : 'Requests'}
                </span>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs text-slate-500 font-bold">Loading your applications...</p>
                </div>
              ) : inquiries.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-700">No requests submitted yet</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Click "Request Service" or "Talk With Us" on the home page to submit your application.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {inquiries.map((inq) => {
                    const statusInfo = getStatusInfo(inq.status);
                    return (
                      <div 
                        key={inq.id} 
                        className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:shadow-md transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                              {inq.type === 'TalkToUs' ? 'Inquiry / Talk with Us' : 'Visa / Service Request'}
                            </span>
                            <h4 className="font-bold text-base text-slate-900 mt-1">
                              {inq.serviceName || inq.serviceTitle || 'General Consultation'}
                            </h4>
                          </div>
                          
                          <div className={`px-3.5 py-1.5 rounded-xl text-xs font-black border flex items-center gap-1.5 self-start sm:self-center shadow-2xs ${statusInfo.color}`}>
                            <span className={`w-2 h-2 rounded-full ${statusInfo.dot} animate-pulse`} />
                            <span>{statusInfo.label}</span>
                            {statusInfo.bnLabel && (
                              <span className="text-[10px] opacity-80">({statusInfo.bnLabel})</span>
                            )}
                          </div>
                        </div>
                        
                        {inq.details && (
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 my-3">
                            <p className="text-xs text-slate-600 font-medium leading-relaxed">
                              "{inq.details}"
                            </p>
                          </div>
                        )}
                        
                        {inq.adminReply && (
                          <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-100 my-3 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                            <h5 className="text-[10px] font-black uppercase text-blue-600 mb-1 tracking-wider">Message from Admin</h5>
                            <p className="text-xs text-blue-900 font-bold leading-relaxed whitespace-pre-wrap">
                              {inq.adminReply}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-100">
                          <span>Mobile: <strong className="text-slate-600">{inq.customerMobile || inq.mobile || 'N/A'}</strong></span>
                          <span>
                            {inq.createdAt?.toDate ? inq.createdAt.toDate().toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            }) : 'Recent'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer with Logout */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 mt-auto flex items-center justify-between gap-4">
              <button 
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Close
              </button>
              
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout from Account</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
