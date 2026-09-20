/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, Lock, X, AlertTriangle, FileText, 
  User, Tag, Clock, CheckCircle2,
  RefreshCw, ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  RotateCw, Maximize2, Move
} from 'lucide-react';
import { AdminDocument } from '../types';

interface SecureDocumentViewerProps {
  document: AdminDocument;
  adminEmail: string;
  onClose: () => void;
}

export default function SecureDocumentViewer({
  document,
  adminEmail,
  onClose,
}: SecureDocumentViewerProps) {
  const [isScreenBlurred, setIsScreenBlurred] = useState(false);
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Page State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [knownMaxPages, setKnownMaxPages] = useState<number>(5);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // High-Performance Zoom, Pan & Rotation State
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initialPanX: number; initialPanY: number }>({
    startX: 0,
    startY: 0,
    initialPanX: 0,
    initialPanY: 0,
  });

  const isPdf = 
    document.fileType === 'pdf' || 
    document.fileFormat === 'pdf' || 
    document.fileUrl.toLowerCase().includes('.pdf');

  // Generate high-DPI Cloudinary image URL (rendered once per page, zoom is GPU-accelerated)
  const getRenderUrl = (page: number) => {
    const fileUrl = document.fileUrl;
    if (!fileUrl.includes('cloudinary.com')) {
      return fileUrl;
    }

    if (isPdf) {
      // Cloudinary PDF-to-Image with high-resolution width for sharp zooming
      const jpgUrl = fileUrl.replace(/\.pdf(\?.*)?$/i, '.jpg');
      if (jpgUrl.includes('/upload/')) {
        return jpgUrl.replace(
          '/upload/',
          `/upload/pg_${page},q_auto:best,f_auto,w_1800/`
        );
      }
      return jpgUrl;
    } else {
      // Regular image at high resolution
      if (fileUrl.includes('/upload/')) {
        return fileUrl.replace(
          '/upload/',
          '/upload/q_auto:best,f_auto,w_1800/'
        );
      }
      return fileUrl;
    }
  };

  const currentDisplayUrl = getRenderUrl(currentPage);

  // Dynamic real-time UTC forensic watermark
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        `${now.toISOString().replace('T', ' ').substring(0, 19)} UTC`
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Anti-Screenshot and Anti-Download Protection Listeners
  useEffect(() => {
    const handleBlur = () => {
      setIsScreenBlurred(true);
    };

    const handleVisibilityChange = () => {
      if (window.document.hidden) {
        setIsScreenBlurred(true);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Intercept PrintScreen
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        e.preventDefault();
        setIsScreenBlurred(true);
        setSecurityWarning('Security Alert: Screenshot attempt intercepted. Document preview protected.');
        try {
          navigator.clipboard.writeText('');
        } catch {}
      }

      // Block Ctrl+P / Cmd+P (Print to PDF)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        setSecurityWarning('Security Alert: Printing and PDF export are restricted by corporate security policy.');
      }

      // Block Ctrl+S / Cmd+S (Save webpage)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        setSecurityWarning('Security Alert: Direct downloading is strictly restricted.');
      }

      // Block DevTools shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+C)
      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'I', 'c', 'C', 'j', 'J'].includes(e.key))
      ) {
        e.preventDefault();
      }

      // Quick Zoom Shortcuts
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        setZoomLevel(z => Math.min(3.5, Math.round((z + 0.25) * 100) / 100));
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        setZoomLevel(z => Math.max(0.5, Math.round((z - 0.25) * 100) / 100));
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === '0')) {
        e.preventDefault();
        resetZoomAndPan();
      }

      // Close Viewer on Escape
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('blur', handleBlur);
    window.document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [onClose]);

  // Reset Zoom, Pan and Rotation
  const resetZoomAndPan = () => {
    setZoomLevel(1.0);
    setPanPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  // Zoom handlers
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(3.5, Math.round((prev + 0.25) * 100) / 100));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => {
      const next = Math.max(0.5, Math.round((prev - 0.25) * 100) / 100);
      if (next <= 1.0) {
        setPanPosition({ x: 0, y: 0 });
      }
      return next;
    });
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // Mouse Wheel Smooth Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      // Zoom in
      setZoomLevel(prev => Math.min(3.5, Math.round((prev + 0.15) * 100) / 100));
    } else {
      // Zoom out
      setZoomLevel(prev => {
        const next = Math.max(0.5, Math.round((prev - 0.15) * 100) / 100);
        if (next <= 1.0) {
          setPanPosition({ x: 0, y: 0 });
        }
        return next;
      });
    }
  };

  // Drag / Pan Interactions
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left-click
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPanX: panPosition.x,
      initialPanY: panPosition.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;
    setPanPosition({
      x: dragStartRef.current.initialPanX + deltaX,
      y: dragStartRef.current.initialPanY + deltaY,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Double click to toggle 100% <-> 180%
  const handleDoubleClick = () => {
    if (zoomLevel > 1.05) {
      resetZoomAndPan();
    } else {
      setZoomLevel(1.8);
    }
  };

  // Page Change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > knownMaxPages) return;
    setIsLoading(true);
    setLoadError(null);
    setCurrentPage(newPage);
    resetZoomAndPan();
  };

  const handleImageError = () => {
    setIsLoading(false);
    if (isPdf && currentPage > 1) {
      setKnownMaxPages(currentPage - 1);
      setCurrentPage(currentPage - 1);
    } else {
      setLoadError('ডকুমেন্টটি লোড করতে সমস্যা হয়েছে।');
    }
  };

  return (
    <div 
      id="secure-document-viewer-overlay"
      className="fixed inset-0 z-50 bg-slate-950 flex flex-col select-none overflow-hidden"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* CSS Print & Selection Disabler */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body, #root, #secure-document-viewer-overlay {
            display: none !important;
            visibility: hidden !important;
          }
        }
        #secure-document-viewer-overlay, 
        #secure-document-viewer-overlay * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-user-drag: none !important;
        }
      `}} />

      {/* Top Security Header */}
      <div className="bg-slate-900/95 border-b border-slate-800/90 px-3 sm:px-6 py-2.5 flex items-center justify-between z-30 shadow-lg gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
            <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-base font-black text-white truncate max-w-[150px] sm:max-w-md">
                {document.title}
              </h3>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50">
                {document.category}
              </span>
            </div>
            <p className="text-slate-400 text-[11px] sm:text-xs flex items-center gap-2 mt-0.5 truncate">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <Lock className="w-3 h-3 shrink-0" />
                Anti-Download Active
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-slate-500">
                • অ্যাডমিন: <strong className="text-slate-300 font-medium">{adminEmail}</strong>
              </span>
            </p>
          </div>
        </div>

        {/* Toolbar Controls: Page & Interactive Zoom */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Multi-Page Navigation */}
          {isPdf && (
            <div className="flex items-center bg-slate-800/90 rounded-xl border border-slate-700 p-0.5 text-xs text-slate-200">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="p-1.5 rounded-lg hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 cursor-pointer transition-colors"
                title="পূর্ববর্তী পেজ"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="px-2 font-mono font-semibold text-[11px] whitespace-nowrap">
                {currentPage} / {knownMaxPages}
              </span>

              <button
                type="button"
                disabled={currentPage >= knownMaxPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="p-1.5 rounded-lg hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 cursor-pointer transition-colors"
                title="পরবর্তী পেজ"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Dedicated Zoom & Pan Control Suite */}
          <div className="flex items-center bg-slate-800/95 rounded-xl border border-slate-700 p-0.5 text-xs text-slate-200 shadow-md">
            {/* Zoom Out Button */}
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.5}
              className="p-1.5 rounded-lg hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 hover:text-white cursor-pointer transition-colors"
              title="জুম আউট করুন (Ctrl + -)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            {/* Zoom Percentage Click-to-Reset Badge */}
            <button
              type="button"
              onClick={resetZoomAndPan}
              className="px-2 py-1 font-mono font-bold text-[11px] text-blue-400 hover:text-blue-300 hover:bg-slate-700/60 rounded-md transition-all cursor-pointer"
              title="ক্লিক করে রিসেট করুন (100%)"
            >
              {Math.round(zoomLevel * 100)}%
            </button>

            {/* Zoom In Button */}
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3.5}
              className="p-1.5 rounded-lg hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 hover:text-white cursor-pointer transition-colors"
              title="জুম ইন করুন (Ctrl + +)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <div className="w-[1px] h-4 bg-slate-700 mx-1" />

            {/* Rotate Clockwise Button */}
            <button
              type="button"
              onClick={handleRotate}
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-amber-300 cursor-pointer transition-colors"
              title="ডকুমেন্টটি ৯০° ঘোরান (Rotate 90°)"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Reset / Fit to Screen Button */}
            <button
              type="button"
              onClick={resetZoomAndPan}
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer transition-colors"
              title="রিসেট ও ফিট টু স্ক্রিন"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Close Viewer Button */}
          <button
            id="close-secure-viewer-btn"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
            title="ভিউয়ার বন্ধ করুন (Esc)"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Security Alert Banner */}
      {securityWarning && (
        <div className="bg-rose-600 text-white px-4 py-2 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xl z-40 animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{securityWarning}</span>
          </div>
          <button 
            onClick={() => setSecurityWarning(null)} 
            className="text-white/80 hover:text-white text-xs underline cursor-pointer ml-4 shrink-0 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Interactive Viewport (Supports Drag Pan & Mouse Wheel Zoom) */}
      <div 
        id="secure-doc-viewport"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        className={`relative flex-1 w-full overflow-hidden bg-slate-950 flex items-center justify-center select-none ${
          zoomLevel > 1.0 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
        }`}
      >
        {/* Anti-Screenshot Privacy Shield Overlay */}
        {isScreenBlurred && (
          <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center text-center p-6 transition-all duration-200">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-lg">
              <Lock className="w-8 h-8 animate-bounce" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Privacy Shield Active</h4>
            <p className="text-slate-300 text-xs sm:text-sm max-w-md mb-6 leading-relaxed">
              উইন্ডো ফোকাস পরিবর্তন বা স্ক্রিন ক্যাপচার প্রতিরোধের কারণে ভিউ সাময়িকভাবে আবৃত করা হয়েছে।
            </p>
            <button
              onClick={() => setIsScreenBlurred(false)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-blue-600/30 cursor-pointer active:scale-98"
            >
              ডকুমেন্ট দেখতে এখানে ক্লিক করুন (Resume Inspection)
            </button>
          </div>
        )}

        {/* Dynamic Forensic Watermark Layer */}
        <div 
          className="absolute inset-0 pointer-events-none z-20 overflow-hidden flex flex-wrap items-center justify-around opacity-15 rotate-[-18deg] select-none"
          style={{ width: '140%', height: '140%', left: '-20%', top: '-20%' }}
        >
          {Array.from({ length: 42 }).map((_, i) => (
            <div key={i} className="p-6 text-center whitespace-nowrap text-white font-mono text-xs md:text-sm font-black tracking-widest leading-tight">
              <p className="text-red-400">CONFIDENTIAL • EURO EXPRESS TRAVELS</p>
              <p className="text-blue-300">AUDITED ADMIN: {adminEmail}</p>
              <p className="text-slate-300">{currentTime || 'AUDIT LOG ACTIVE'}</p>
              <p className="text-[10px] text-slate-500">PROPRIETARY • DO NOT REDISTRIBUTE</p>
            </div>
          ))}
        </div>

        {/* Transparent Click Shield */}
        <div 
          className="absolute inset-0 z-10 pointer-events-none"
          onContextMenu={(e) => e.preventDefault()}
        />

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute z-30 flex flex-col items-center justify-center p-10 bg-slate-900/90 border border-slate-800 rounded-2xl text-slate-300 gap-3 shadow-2xl backdrop-blur-sm">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm font-bold text-white">ডকুমেন্টটি লোড হচ্ছে...</p>
            <p className="text-xs text-slate-400">High-Definition Safe Rendering</p>
          </div>
        )}

        {/* Error Notification */}
        {loadError && (
          <div className="absolute z-30 p-8 bg-slate-900 border border-rose-800/60 rounded-2xl text-center max-w-md shadow-2xl">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white mb-2">ডকুমেন্ট রেন্ডারিং সতর্কতা</h4>
            <p className="text-xs text-slate-300 mb-4">{loadError}</p>
            <button
              type="button"
              onClick={() => {
                setLoadError(null);
                setIsLoading(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95"
            >
              পুনরায় চেষ্টা করুন
            </button>
          </div>
        )}

        {/* The Scalable & Draggable Document Canvas Container */}
        <div 
          className="relative max-w-5xl w-full flex items-center justify-center transition-transform duration-75 will-change-transform"
          style={{
            transform: `translate3d(${panPosition.x}px, ${panPosition.y}px, 0px) scale(${zoomLevel}) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className={`relative p-2 bg-slate-900/90 border border-slate-800/90 rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center max-w-full ${loadError ? 'hidden' : 'block'}`}>
            <img
              src={currentDisplayUrl}
              alt={document.title}
              draggable={false}
              onLoad={() => setIsLoading(false)}
              onError={handleImageError}
              onContextMenu={(e) => e.preventDefault()}
              className={`max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-lg pointer-events-none select-none transition-opacity duration-150 ${
                isLoading ? 'opacity-0 h-0' : 'opacity-100'
              }`}
            />
          </div>
        </div>

        {/* Quick Pan & Zoom Floating Help Hint */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2 pointer-events-none shadow-lg z-20">
          <Move className="w-3 h-3 text-blue-400" />
          <span>মাউস দিয়ে টেনে প্যান করুন • স্ক্রল হুইল দিয়ে জুম করুন • ডাবল-ক্লিকে টগল জুম</span>
        </div>
      </div>

      {/* Bottom Status & Audit Bar */}
      <div className="bg-slate-900/95 border-t border-slate-800/90 px-4 md:px-6 py-2.5 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2 z-30">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-400" />
            আপলোডকারী: <strong className="text-slate-200">{document.uploadedByEmail}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            তারিখ: <strong className="text-slate-200">{new Date(document.uploadedAt).toLocaleDateString('en-GB')}</strong>
          </span>
          {document.fileSize && (
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              ফাইলের সাইজ: <strong className="text-slate-200">{(document.fileSize / (1024 * 1024)).toFixed(2)} MB</strong>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 font-medium text-emerald-400 text-[11px]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Interactive Zoom Active • Anti-Download Shield On</span>
        </div>
      </div>
    </div>
  );
}
