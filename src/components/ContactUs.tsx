import { motion } from 'framer-motion';
import { Phone, MessageCircle, Mail, MapPin, Facebook, ExternalLink } from 'lucide-react';
import { SiteConfig } from '../types';

interface ContactUsProps {
  config: SiteConfig;
}

export default function ContactUs({ config }: ContactUsProps) {
  return (
    <section id="contact" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-blue-900 mb-4">Contact Us</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Have questions or ready to start your application? Reach out to us through any of these channels.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ContactCard
                icon={<Phone className="w-6 h-6" />}
                title="Phone"
                value={config.phone}
                href={`tel:${config.phone.replace(/\s/g, '')}`}
              />
              <ContactCard
                icon={<MessageCircle className="w-6 h-6" />}
                title="WhatsApp"
                value="Message on WhatsApp"
                href={`https://wa.me/${config.whatsappNumber}`}
                variant="success"
              />
              <ContactCard
                icon={<Mail className="w-6 h-6" />}
                title="Email"
                value={config.email}
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${config.email}`} target="_blank" rel="noopener noreferrer"
              />
              <ContactCard
                icon={<Facebook className="w-6 h-6" />}
                title="Facebook"
                value="Visit our Page"
                href={config.facebookPage || 'https://www.facebook.com/share/1HC7peKkEA/'}
                variant="blue"
              />
            </div>

            <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-blue-900 mb-2">Office Address</h3>
                  <p className="text-slate-600 leading-relaxed">
                    {config.address}
                  </p>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.address || 'Mirpur Bazar, Bahubal, Hobiganj, Bangladesh')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 hover:gap-2 transition-all"
                  >
                    Get Directions <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="h-full min-h-[300px] sm:min-h-[420px] rounded-3xl overflow-hidden shadow-2xl shadow-slate-200 border border-slate-200 relative bg-slate-100">
            <iframe
              title="Euro Express Travels Location"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(config.address || 'Mirpur Bazar, Bahubal, Habiganj, Bangladesh')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '420px' }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactCard({ icon, title, value, href, variant = 'default' }: any) {
  const variants: any = {
    default: 'bg-white text-blue-600 border-slate-100',
    success: 'bg-green-50 text-green-600 border-green-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100'
  };

  return (
    <motion.a
      whileHover={{ y: -5 }}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`p-6 rounded-3xl border shadow-lg shadow-slate-200/50 transition-all ${variants[variant] || variants.default}`}
    >
      <div className="mb-4">{icon}</div>
      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{title}</h4>
      <p className="font-bold text-blue-900">{value}</p>
    </motion.a>
  );
}
