/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'framer-motion';
import { Phone, MessageCircle, Mail, Users, Award, ShieldCheck, CheckCircle2, UserCheck, ArrowRight } from 'lucide-react';
import { TeamMember, SiteConfig } from '../types';

interface TeamProps {
  team: TeamMember[];
  config: SiteConfig;
  onRequestService?: () => void;
}

export default function Team({ team, config, onRequestService }: TeamProps) {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-blue-950 via-slate-900 to-slate-900 text-white pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="absolute top-1/4 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 -left-24 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-bold uppercase tracking-wider"
          >
            <Users className="w-4 h-4 text-blue-400" />
            <span>Euro Express Travels Leadership & Specialists</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white"
          >
            Meet Our Dedicated Team
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            Our certified visa consultants, ticketing officers, and customer relations specialists are committed to delivering seamless travel solutions with total transparency.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-6 pt-4 text-xs font-semibold text-slate-300"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Certified Consultants</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>10+ Years Experience</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              <span>98.5% Visa Success Record</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team Members Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {team.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-black text-slate-800">No team members added yet</h3>
            <p className="text-sm text-slate-500 mt-1">You can add team members from the Admin Panel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.id || index}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-blue-300 transition-all duration-300 p-5 sm:p-6 lg:p-8 flex flex-col justify-between space-y-6 relative overflow-hidden group"
              >
                {/* Top Header Card Info */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-black text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-xs shrink-0">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 bg-blue-50 border border-blue-100/80 text-blue-700 font-bold text-[11px] uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-2xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Verified Consultant</span>
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                        {member.name}
                      </h3>
                      {/* Official Verified Badge */}
                      <span 
                        className="inline-flex items-center justify-center text-blue-500 hover:text-blue-600 transition-transform hover:scale-110 cursor-help"
                        title="Verified Visa & Travel Consultant"
                      >
                        <svg className="w-5 h-5 fill-blue-500 text-white shrink-0 drop-shadow-xs" viewBox="0 0 24 24">
                          <path
                            fillRule="evenodd"
                            d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.548 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.548 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    </div>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mt-1">
                      {member.designation}
                    </p>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {member.shortIntro}
                  </p>
                </div>

                {/* Direct Contact Bar */}
                <div className="pt-5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {member.whatsapp && (
                      <a
                        href={`https://wa.me/${member.whatsapp.replace(/\+/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-200/60 flex items-center justify-center transition-colors shadow-xs"
                        title={`WhatsApp ${member.name}`}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    )}

                    {member.phone && (
                      <a
                        href={`tel:${member.phone.replace(/\s/g, '')}`}
                        onClick={(e) => {
                          // On desktop without a dialer, tel: might silently fail.
                          // Let's copy it to clipboard as well.
                          try {
                            navigator.clipboard.writeText(member.phone);
                          } catch(err) {}
                        }}
                        className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200/60 flex items-center justify-center transition-colors shadow-xs"
                        title={`Call ${member.name} (Copies to clipboard)`}
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}

                    {member.email && (
                      <a
                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${member.email}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white border border-slate-200 flex items-center justify-center transition-colors shadow-xs"
                        title={`Email ${member.name}`}
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <a
                    href={`https://wa.me/${member.whatsapp || config.whatsappNumber}?text=Hello%20${encodeURIComponent(member.name)},%20I%20would%20like%20to%20consult%20about%20my%20visa/travel.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                  >
                    <span>Consult</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Bottom Banner */}
        <div className="mt-12 sm:mt-20 p-6 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black">Need Direct Consultation with Our Team?</h3>
            <p className="text-blue-200 text-xs sm:text-sm lg:text-base max-w-xl mx-auto md:mx-0">
              Visit our office at {config.address} or connect instantly with our senior counselors for personalized guidance.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
            <a
              href={`https://wa.me/${config.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer text-center w-full sm:w-auto"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>Chat on WhatsApp</span>
            </a>
            {onRequestService && (
              <button
                onClick={onRequestService}
                className="px-6 py-3.5 bg-white text-blue-950 hover:bg-blue-50 font-bold rounded-2xl text-sm transition-all shadow-lg cursor-pointer text-center w-full sm:w-auto"
              >
                Request Service Online
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
