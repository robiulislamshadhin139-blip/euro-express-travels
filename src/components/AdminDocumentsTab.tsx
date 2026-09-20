/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, UploadCloud, ShieldAlert, Lock, Trash2, Search, Filter, 
  Eye, AlertTriangle, CheckCircle2, RefreshCw, X, FolderLock, Plus, 
  Settings, HardDrive, Tag, Calendar, User, Info, FileSpreadsheet,
  ShieldCheck, Shield
} from 'lucide-react';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AdminDocument, SiteConfig } from '../types';
import { uploadFileToCloudinary } from '../utils/cloudinary';
import SecureDocumentViewer from './SecureDocumentViewer';

interface AdminDocumentsTabProps {
  config: SiteConfig;
  adminEmail: string;
  onUpdateConfig: (newConfig: SiteConfig) => Promise<void>;
  showNotification: (msg: string) => void;
}

const CATEGORIES = [
  'Visa Application',
  'Passport Copy',
  'Embassy Submission',
  'Flight Ticket / Voucher',
  'Bank Statement & Solvency',
  'Legal & Contract',
  'Medical Clearance',
  'Other Document'
];

export default function AdminDocumentsTab({ 
  config, 
  adminEmail, 
  onUpdateConfig, 
  showNotification 
}: AdminDocumentsTabProps) {
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState(CATEGORIES[0]);
  const [docNotes, setDocNotes] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Secure View State
  const [viewingDoc, setViewingDoc] = useState<AdminDocument | null>(null);

  // Delete Confirm Dialog
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Real-time Firestore Sync for Documents collection
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, 'documents'), (snapshot) => {
      const docsData: AdminDocument[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        docsData.push({
          id: docSnap.id,
          title: data.title || 'Untitled Document',
          category: data.category || 'Other Document',
          fileUrl: data.fileUrl || '',
          publicId: data.publicId || '',
          fileType: data.fileType || 'other',
          fileFormat: data.fileFormat || '',
          fileSize: data.fileSize || 0,
          uploadedByEmail: data.uploadedByEmail || 'Admin',
          uploadedAt: data.uploadedAt || new Date().toISOString(),
          notes: data.notes || ''
        });
      });

      // Sort descending by upload timestamp
      docsData.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

      setDocuments(docsData);
      setLoading(false);
    }, (error) => {
      console.warn("Firestore documents snapshot error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setUploadError(null);
      if (!docTitle) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setDocTitle(cleanName);
      }
    }
  };

  // Drag and drop handlers
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setUploadError(null);
      if (!docTitle) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setDocTitle(cleanName);
      }
    }
  };

  // Upload handler to Cloudinary & Firestore
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }
    if (!docTitle.trim()) {
      setUploadError('Please specify a title or client identifier for this document.');
      return;
    }
    if (selectedFile.size > 50 * 1024 * 1024) {
      setUploadError('ফাইলের সাইজ ৫০ মেগাবাইটের (50MB) বেশি হতে পারবে না।');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      // 1. Upload to Cloudinary directly
      const result = await uploadFileToCloudinary(
        selectedFile,
        config.cloudinaryConfig?.cloudName || 'lbbij0gf',
        config.cloudinaryConfig?.uploadPreset || 'euro_docs',
        config.cloudinaryConfig?.folder || 'documents',
        (progress) => setUploadProgress(progress)
      );

      // Determine file format and type
      const ext = selectedFile.name.split('.').pop()?.toLowerCase() || result.format || 'pdf';
      const fileType = ext === 'pdf' ? 'pdf' : (selectedFile.type.startsWith('image/') ? 'image' : 'doc');

      // 2. Write metadata to Firestore
      const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newAdminDoc: AdminDocument = {
        id: docId,
        title: docTitle.trim(),
        category: docCategory,
        fileUrl: result.secure_url,
        publicId: result.public_id,
        fileType,
        fileFormat: ext,
        fileSize: result.bytes || selectedFile.size,
        uploadedByEmail: adminEmail,
        uploadedAt: new Date().toISOString(),
        notes: docNotes.trim()
      };

      await setDoc(doc(db, 'documents', docId), newAdminDoc);

      showNotification(`"${docTitle}" has been securely uploaded and cataloged.`);
      // Reset form
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setDocTitle('');
      setDocNotes('');
      setUploadProgress(0);
    } catch (err: any) {
      console.error("Cloudinary/Firestore upload error:", err);
      setUploadError(err.message || 'File upload failed. Please verify your Cloudinary upload preset.');
    } finally {
      setIsUploading(false);
    }
  };

  // Delete Document
  const handleDeleteConfirm = async () => {
    if (!deletingDocId) return;
    try {
      await deleteDoc(doc(db, 'documents', deletingDocId));
      showNotification('Document record removed successfully.');
      setDeletingDocId(null);
    } catch (err: any) {
      console.error("Error deleting document:", err);
      showNotification(`Failed to delete document: ${err.message}`);
    }
  };

  // Filtered documents
  const filteredDocs = documents.filter((item) => {
    const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.uploadedByEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.fileFormat?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Calculate stats
  const totalSizeBytes = documents.reduce((acc, curr) => acc + (curr.fileSize || 0), 0);
  const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(2);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner with Enterprise Security Styling */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-sm">
                <FolderLock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    Confidential Document Vault
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                    Anti-Screenshot & Zero-Export
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  Secure Administrative File Repository • Real-Time Firestore Metadata & Cloudinary Storage
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="open-upload-modal-btn"
              onClick={() => {
                setUploadError(null);
                setSelectedFile(null);
                setDocTitle('');
                setDocNotes('');
                setIsUploadModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          </div>
        </div>

        {/* Security Metrics Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Vault Records</p>
            <p className="text-lg sm:text-xl font-black text-white mt-0.5">{documents.length}</p>
          </div>
          <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cloud Footprint</p>
            <p className="text-lg sm:text-xl font-black text-blue-400 mt-0.5">{totalSizeMB} MB</p>
          </div>
          <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Privacy Protocol</p>
            <p className="text-lg sm:text-xl font-black text-emerald-400 mt-0.5">Enforced</p>
          </div>
          <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Access Clearance</p>
            <p className="text-lg sm:text-xl font-black text-amber-400 mt-0.5">Admin Only</p>
          </div>
        </div>
      </div>

      {/* Compliance Policy Notice */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3.5 text-xs text-amber-900 dark:text-amber-200">
        <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-950 dark:text-amber-100 uppercase tracking-wider text-[11px]">
            Security & Governance Protocol
          </p>
          <p className="leading-relaxed opacity-90">
            Files stored in this vault are strictly confined to authorized administrator sessions. Direct download URLs and public file indexing are permanently disabled. The built-in viewer features dynamic forensic watermarking and an anti-screenshot blur shield that masks data upon window focus loss.
          </p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, applicant, format..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shrink-0"
          >
            <option value="ALL">All Categories ({documents.length})</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat} ({documents.filter((d) => d.category === cat).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Grid / Table */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-sm font-bold text-slate-600">Synchronizing vault records...</p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">No Documents Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mb-5">
            {searchQuery || selectedCategory !== 'ALL'
              ? 'No records match your active search filters.'
              : 'Upload client passports, visas, air tickets, or financial statements for encrypted administrative storage.'}
          </p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Document</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((item) => {
            const isPdf = item.fileType === 'pdf' || item.fileFormat === 'pdf';
            const isImage = item.fileType === 'image';
            const sizeInMb = item.fileSize ? (item.fileSize / (1024 * 1024)).toFixed(2) : null;

            return (
              <div 
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-4 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isPdf ? 'bg-red-50 text-red-600' : isImage ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {isPdf ? <FileText className="w-5 h-5" /> : isImage ? <FileSpreadsheet className="w-5 h-5" /> : <HardDrive className="w-5 h-5" />}
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {item.category}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setDeletingDocId(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2 mb-3">
                      {item.notes}
                    </p>
                  )}

                  <div className="space-y-1.5 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        Uploaded by:
                      </span>
                      <span className="font-semibold text-slate-700 truncate max-w-[160px]">
                        {item.uploadedByEmail}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Date:
                      </span>
                      <span className="font-semibold text-slate-700">
                        {new Date(item.uploadedAt).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3 text-slate-400" />
                        Format / Size:
                      </span>
                      <span className="font-semibold text-slate-700 uppercase">
                        {item.fileFormat || item.fileType} {sizeInMb ? `• ${sizeInMb} MB` : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions: Secure Inspection Only, Zero Export */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => setViewingDoc(item)}
                    className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-98"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Secure Inspection</span>
                  </button>

                  <div 
                    className="p-2.5 rounded-xl bg-slate-100 text-slate-400 cursor-not-allowed"
                    title="Export and external distribution restricted by security policy"
                  >
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload File Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                if (!isUploading) {
                  setIsUploadModalOpen(false);
                  setSelectedFile(null);
                }
              }}
              disabled={isUploading}
              className="absolute right-5 top-5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Upload Confidential Document</h3>
                <p className="text-xs text-slate-500 font-medium">Direct encrypted ingest to Cloudinary & Firestore</p>
              </div>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  selectedFile
                    ? 'border-emerald-500 bg-emerald-50/40 text-emerald-800'
                    : 'border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/20'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mb-2" />
                    <p className="text-xs font-bold text-slate-900 truncate max-w-xs">{selectedFile.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for ingest
                    </p>
                    <span className="mt-2 text-[10px] font-bold text-blue-600 underline">Change Selected File</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-xs font-bold text-slate-700">Drop your file here, or click to browse</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Supported: PDF, JPG, PNG, DOCX (Max 50MB)
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Document Title / Client Identifier *
                </label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g., Passport Copy - John Doe / Schengen Visa Form"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Classification Category
                </label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Internal Notes or Reference Code (Optional)
                </label>
                <textarea
                  rows={2}
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  placeholder="e.g., Appointment date, application tracking number, or verification notes..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              {/* Upload Progress Bar */}
              {isUploading && (
                <div className="space-y-1.5 bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <div className="flex justify-between text-xs font-bold text-blue-700">
                    <span>Uploading to encrypted storage...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <span className="leading-relaxed">{uploadError}</span>
                </div>
              )}

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  disabled={isUploading}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !selectedFile}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>Confirm Upload</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingDocId && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Delete Document Record?</h3>
            <p className="text-xs text-slate-500 mb-6">
              This will permanently delete this document record from the administrative database. This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeletingDocId(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Secure Document Viewer Modal with Anti-Screenshot & Watermark */}
      {viewingDoc && (
        <SecureDocumentViewer
          document={viewingDoc}
          adminEmail={adminEmail}
          onClose={() => setViewingDoc(null)}
        />
      )}
    </div>
  );
}
