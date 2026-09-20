/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Plane, Mail, MapPin, Phone, Facebook, Twitter, Instagram, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { User } from 'firebase/auth';

import { SiteConfig } from '../types';

interface FooterProps {
  config: SiteConfig;
  onAdminClick?: () => void;
  user?: User | null;
}

export default function Footer({ config, onAdminClick, user }: FooterProps) {
  const defaultAdmins = [
    'taslimaakter2904@gmail.com',
    'hellofingenix@gmail.com',
    'euroexpresstravels65@gmail.com'
  ];
  const allAdminEmails = Array.from(new Set([...defaultAdmins, ...(config.adminEmails || []).map(e => e.toLowerCase().trim())]));
  const isUserAdmin = Boolean(user?.email && allAdminEmails.includes(user.email.toLowerCase().trim()));
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-12 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 text-white">
              <img 
                src="https://res.cloudinary.com/lbbij0gf/image/upload/v1787569136/Untitled-1_copy.png" 
                alt={config.name} 
                className="h-12 w-auto object-contain brightness-0 invert"
              />
              <img 
                src="https://res.cloudinary.com/lbbij0gf/image/upload/v1787572599/ChatGPT_Image_Aug_24_2026_05_55_44_PM.png" 
                alt={config.name} 
                className="h-10 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-xs leading-relaxed opacity-60">
              Global reach with local expertise. Your trusted partner for worldwide visas and travel documentation.
            </p>
            <div className="pt-4 flex gap-2">
              <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
              <p className="text-[10px] leading-relaxed">{config.address}</p>
            </div>
          </div>

          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-widest mb-6">Explore</h4>
            <ul className="space-y-3 text-xs font-bold">
              <li><Link to="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
              <li><Link to="/services" className="hover:text-blue-400 transition-colors">Our Services</Link></li>
              <li><Link to="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
              <li><Link to="/team" className="hover:text-blue-400 transition-colors">Our Team</Link></li>
              <li><Link to="/how-it-works" className="hover:text-blue-400 transition-colors">How It Works</Link></li>
              <li><Link to="/faq" className="hover:text-blue-400 transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-widest mb-6">Contact</h4>
            <ul className="space-y-3 text-xs font-bold">
              <li className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-blue-500" />
                {config.phone}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3 h-3 text-blue-500" />
                {config.email}
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-start gap-4">
            <h4 className="text-white text-xs font-black uppercase tracking-widest mb-2">Connect</h4>
            <div className="flex gap-3">
              <a href={config.facebookPage || 'https://www.facebook.com/share/1HC7peKkEA/'} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 py-4 px-4 sm:px-12 text-[10px] font-bold flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-slate-800/50 uppercase tracking-widest">
        <div className="flex flex-wrap items-center gap-6 opacity-80">
          <span>&copy; {new Date().getFullYear()} {config.name}</span>
          <a href="https://sites.google.com/view/euro-express-travels/home?authuser=4" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Terms</a>
          <a href="https://sites.google.com/view/euroexpresstravels/home?authuser=4" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Privacy</a>
          <span className="text-slate-400 normal-case font-medium flex items-center gap-1.5 border-l border-slate-800 pl-4">
            Developed by <span className="text-blue-400 font-bold uppercase tracking-wider">Fingenix</span>
          </span>
        </div>
        <div className="flex gap-2 items-center text-blue-500">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
          Digital Systems Active
        </div>
      </div>
    </footer>
  );
}
