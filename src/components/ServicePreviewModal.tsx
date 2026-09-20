import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Service } from '../types';

interface ServicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  onRequestService: (serviceId: string) => void;
}

const IconComponent = ({ name, className }: { name: string; className?: string }) => {
  const Icon = (LucideIcons as any)[name];
  return Icon ? <Icon className={className} /> : <LucideIcons.HelpCircle className={className} />;
};

export default function ServicePreviewModal({ isOpen, onClose, service, onRequestService }: ServicePreviewModalProps) {
  if (!service) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 backdrop-blur hover:bg-white text-slate-500 hover:text-slate-800 rounded-full flex items-center justify-center transition-colors shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col md:flex-row h-full overflow-y-auto">
              {/* Image Section */}
              <div className="w-full md:w-1/2 bg-slate-50 flex items-center justify-center relative min-h-[250px] border-b md:border-b-0 md:border-r border-slate-100">
                {service.imageUrl ? (
                  <img 
                    src={service.imageUrl} 
                    alt={service.title} 
                    className="w-full h-full object-contain max-h-[400px] p-6" 
                  />
                ) : (
                  <IconComponent name={service.icon} className="w-32 h-32 text-blue-100" />
                )}
                
                {/* Floating Icon */}
                <div className="absolute top-6 left-6 w-14 h-14 bg-white/90 backdrop-blur text-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
                  <IconComponent name={service.icon} className="w-7 h-7" />
                </div>
              </div>

              {/* Content Section */}
              <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center bg-white">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-bold tracking-wide uppercase mb-6 w-max">
                  <IconComponent name={service.icon} className="w-4 h-4" />
                  Service Details
                </div>
                
                <h2 className="text-3xl font-black text-blue-950 mb-4 tracking-tight leading-tight">
                  {service.title}
                </h2>
                
                <div className="w-12 h-1 bg-blue-600 rounded-full mb-6"></div>
                
                <p className="text-slate-600 leading-relaxed mb-10 text-lg">
                  {service.description}
                </p>

                <div className="mt-auto pt-6 border-t border-slate-100">
                  <button
                    onClick={() => {
                      onClose();
                      onRequestService(service.id);
                    }}
                    className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 hover:shadow-blue-300 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3"
                  >
                    Request This Service
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
