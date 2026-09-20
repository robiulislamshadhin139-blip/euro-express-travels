/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Service } from '../types';
import { MessageCircle } from 'lucide-react';

interface ServicesProps {
  services: Service[];
  whatsappNumber: string;
  onRequestService: (serviceId: string) => void;
  onPreviewService: (service: Service) => void;
}

const IconComponent = ({ name, className }: { name: string; className?: string }) => {
  const Icon = (LucideIcons as any)[name];
  return Icon ? <Icon className={className} /> : <LucideIcons.HelpCircle className={className} />;
};

export default function Services({ services, whatsappNumber, onRequestService, onPreviewService }: ServicesProps) {
  return (
    <section id="services" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
          <div>
            <h2 className="text-4xl font-black text-blue-900 tracking-tight">Our Services</h2>
            <p className="mt-2 text-slate-500 font-medium text-lg">Simplified processing for a complex world.</p>
          </div>
          <div className="flex gap-2">
            <div className="h-2 w-12 bg-blue-600 rounded-full"></div>
            <div className="h-2 w-2 bg-slate-300 rounded-full"></div>
            <div className="h-2 w-2 bg-slate-300 rounded-full"></div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onPreviewService(service)}
              className="bg-white rounded-xl sm:rounded-3xl border border-slate-100 shadow-md sm:shadow-xl sm:shadow-slate-200/40 hover:shadow-lg sm:hover:shadow-2xl sm:hover:shadow-blue-100 transition-all group flex flex-col overflow-hidden cursor-pointer"
            >
              {service.imageUrl ? (
                <div className="w-full bg-slate-50 overflow-hidden relative flex justify-center items-center border-b border-slate-100 h-[72px] sm:h-auto">
                  <img 
                    src={service.imageUrl} 
                    alt={service.title} 
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full sm:h-auto sm:max-h-[250px] object-cover sm:object-contain group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="hidden sm:flex absolute top-4 left-4 w-12 h-12 bg-white/90 backdrop-blur text-blue-600 rounded-xl items-center justify-center shadow-lg">
                    <IconComponent name={service.icon} className="w-6 h-6" />
                  </div>
                </div>
              ) : (
                <div className="px-2 pt-3 pb-0 sm:px-8 sm:pt-8 sm:pb-0 flex justify-center sm:justify-start">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 bg-blue-50 text-blue-600 rounded-lg sm:rounded-2xl flex items-center justify-center sm:mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:rotate-6">
                    <IconComponent name={service.icon} className="w-5 h-5 sm:w-7 h-7" />
                  </div>
                </div>
              )}
              <div className={`p-2 sm:px-8 ${service.imageUrl ? 'sm:pt-6' : 'sm:pt-0'} sm:pb-8 flex flex-col flex-grow`}>
                {/* Mobile Title & Arrow */}
                <div className="flex sm:hidden items-center justify-between w-full mt-0.5">
                  <h3 className="text-[10px] xs:text-[11px] font-bold text-blue-950 leading-tight line-clamp-2 pr-1">{service.title}</h3>
                  <LucideIcons.ArrowRight className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                </div>

                {/* Desktop Title */}
                <h3 className="hidden sm:block text-xl font-bold text-blue-900 mb-3 tracking-tight group-hover:text-blue-700 transition-colors">{service.title}</h3>
                
                {/* Desktop Description */}
                <p className="hidden sm:block text-sm text-slate-500 mb-8 leading-relaxed flex-grow">
                  {service.description}
                </p>
                
                {/* Desktop Request Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestService(service.id);
                  }}
                  className="hidden sm:flex mt-auto w-full py-4 rounded-xl bg-slate-50 hover:bg-blue-600 text-blue-600 hover:text-white font-black text-xs uppercase tracking-widest transition-all items-center justify-center gap-2 border border-slate-100 hover:border-blue-600"
                >
                  Request Service
                  <LucideIcons.ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
