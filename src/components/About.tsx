
import { motion } from 'framer-motion';
import { Shield, Target, Users, Award, CheckCircle2, Globe2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SiteConfig } from '../types';

interface AboutProps {
  config?: SiteConfig;
}

export default function About({ config }: AboutProps) {
  const about = config?.aboutConfig || {
    title: 'About Euro Express Travels',
    subtitle: 'Your Trusted Gateway to Global Journeys & Seamless Visas',
    mainStory: 'With over a decade of experience, Euro Express Travels has established itself as a premier visa consultancy and travel agency. Our mission is to simplify global mobility, providing transparent and efficient travel solutions to our valued clients.',
    secondaryStory: 'We specialize in navigating the complexities of international travel documentation, ensuring our clients can focus on their journey while we handle the paperwork. Our professional commitment is to provide the highest standard of service and integrity in every case we handle.',
    experienceYears: '10+',
    visaSuccessRate: '98.5%',
    happyClients: '15,000+',
    countriesServed: '50+'
  };

  const values = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Client-Centric Approach",
      description: "We prioritize your travel goals, offering personalized consultation for every visa category and travel route."
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "High Success Rate",
      description: "Our high success rate in worldwide visa approvals speaks for our strict documentation and embassy compliance."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Trusted & Transparent",
      description: "Zero hidden charges, authentic information, and end-to-end guidance from our dedicated consultants."
    }
  ];

  const stats = [
    { label: "Years of Experience", value: about.experienceYears, icon: <Award className="w-5 h-5 text-amber-500" /> },
    { label: "Visa Approval Rate", value: about.visaSuccessRate, icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" /> },
    { label: "Happy Travelers", value: about.happyClients, icon: <Users className="w-5 h-5 text-blue-500" /> },
    { label: "Countries Covered", value: about.countriesServed, icon: <Globe2 className="w-5 h-5 text-purple-500" /> },
  ];

  return (
    <div className="bg-white">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Discover Our Story</span>
          <h1 className="text-4xl sm:text-5xl font-black text-white">{about.title || 'About Euro Express Travels'}</h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto">
            {about.subtitle || 'Your Trusted Gateway to Global Journeys & Seamless Visas'}
          </p>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center">
                <div className="flex justify-center mb-1">{stat.icon}</div>
                <div className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900">{stat.value}</div>
                <div className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section id="about" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wider">
              <span>Who We Are</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-blue-950 tracking-tight">
              Pioneering Seamless Global Mobility with Integrity
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              {about.mainStory}
            </p>
            <p className="text-base text-slate-600 leading-relaxed">
              {about.secondaryStory}
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                to="/team"
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-blue-200 transition-all inline-flex items-center gap-2"
              >
                <span>Meet Our Team</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-bold transition-all"
              >
                Contact Our Office
              </Link>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 p-6 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-xs"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  {value.icon}
                </div>
                <div>
                  <h3 className="text-lg font-black text-blue-950 mb-1">{value.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
