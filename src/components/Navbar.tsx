/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Home, Grid, Info, Settings, HelpCircle, Phone, MessageCircle, LogOut, Shield, User as UserIcon, Users, Menu, X } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut, User } from 'firebase/auth';

interface NavbarProps {
  siteName: string;
  whatsappNumber: string;
  onAdminClick: () => void;
  user: User | null;
  onLoginClick: () => void;
  onUserProfileClick: () => void;
  adminEmails?: string[];
  onAIAssistantClick?: () => void;
}

export default function Navbar({ 
  siteName, 
  whatsappNumber, 
  onAdminClick, 
  user, 
  onLoginClick, 
  onUserProfileClick, 
  adminEmails = [],
  onAIAssistantClick
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout. Please try again.");
    }
  };

  const defaultAdmins = [
    'taslimaakter2904@gmail.com',
    'taslimaakterr469@gmail.com',
    'hellofingenix@gmail.com',
    'euroexpresstravels65@gmail.com',
    'robiulshadhin139@gmail.com'
  ];
  const allAdminEmails = Array.from(new Set([...defaultAdmins, ...adminEmails.map(e => e.toLowerCase().trim())]));
  const isUserAdmin = Boolean(user?.email && allAdminEmails.includes(user.email.toLowerCase().trim()));

  const navItems = [
    { label: 'Home', to: '/', icon: <Home className="w-5 h-5" /> },
    { label: 'Services', to: '/services', icon: <Grid className="w-5 h-5" /> },
    { label: 'About', to: '/about', icon: <Info className="w-5 h-5" /> },
    { label: 'How It Works', to: '/how-it-works', icon: <Settings className="w-5 h-5" /> },
    { label: 'FAQ', to: '/faq', icon: <HelpCircle className="w-5 h-5" /> },
    { label: 'Contact', to: '/contact', icon: <Phone className="w-5 h-5" /> },
    { label: 'Our Team', to: '/team', icon: <Users className="w-5 h-5" /> },
  ];

  const bottomNavItems = [
    { label: 'Home', to: '/', icon: <Home className="w-[22px] h-[22px]" /> },
    { label: 'Services', to: '/services', icon: <Grid className="w-[22px] h-[22px]" /> },
    { label: 'FAQ', to: '/faq', icon: <HelpCircle className="w-[22px] h-[22px]" /> },
    { label: 'Contact', to: '/contact', icon: <Phone className="w-[22px] h-[22px]" /> },
  ];

  const extraMobileNavItems = [
    { label: 'How It Works', to: '/how-it-works', icon: <Settings className="w-5 h-5" /> },
    { label: 'About', to: '/about', icon: <Users className="w-5 h-5" /> },
    { label: 'Our Team', to: '/team', icon: <Users className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 px-4 sm:px-8 py-2.5 sm:py-3 flex items-center shadow-sm">
        {/* Left column: Logo */}
        <div className="flex-shrink-0">
          <Link to="/" className="flex items-center">
            <img 
              src="https://res.cloudinary.com/lbbij0gf/image/upload/v1787572599/ChatGPT_Image_Aug_24_2026_05_55_44_PM.png" 
              alt={siteName} 
              fetchPriority="high"
              loading="eager"
              decoding="async"
              className="h-10 sm:h-14 md:h-16 w-auto object-contain transition-transform hover:scale-105"
            />
          </Link>
        </div>
        
        {/* Center column: Nav Links */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-6 text-sm font-semibold px-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `transition-colors relative py-1 whitespace-nowrap ${
                  isActive ? 'text-blue-700' : 'text-slate-600 hover:text-blue-700'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-700 rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
        
        {/* Right column: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto sm:ml-0">
          {/* Admin Button - ONLY visible to authorized logged in admin Gmail accounts */}
          {isUserAdmin && (
            <button 
              onClick={onAdminClick}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all shadow-xs cursor-pointer"
              title="Open Admin Panel"
            >
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Admin</span>
            </button>
          )}

          {user ? (
            <button 
              id="user-profile-btn"
              onClick={onUserProfileClick}
              className="flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto sm:p-1 sm:pl-2.5 sm:pr-1.5 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-900 transition-all shadow-xs active:scale-95 cursor-pointer"
              title="View Profile & Requests"
            >
              <span className="hidden sm:inline text-xs font-black max-w-[110px] truncate mr-2">
                {user.displayName?.split(' ')[0] || 'Account'}
              </span>
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  className="w-7 h-7 rounded-full shadow-xs border border-white ring-1 ring-blue-300 object-cover" 
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </button>
          ) : (
            <button 
              id="user-login-btn"
              onClick={onLoginClick}
              className="flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 rounded-full sm:rounded-xl text-xs font-black text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-all active:scale-95 cursor-pointer"
              title="Login"
            >
              <UserIcon className="w-5 h-5 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline ml-1.5">Login</span>
            </button>
          )}

          <a 
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full items-center gap-1.5 shadow-md transition-all font-semibold text-xs sm:text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>

          {/* Mobile Hamburger Menu Button */}
          <button 
            className="md:hidden flex items-center justify-center w-9 h-9 bg-blue-600 text-white rounded-xl shadow-sm active:scale-95 transition-transform"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Mobile Side Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[200] bg-white flex flex-col animate-in slide-in-from-right-8 duration-200">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <span className="font-bold text-slate-800 text-lg">Menu</span>
            <button 
              className="p-2 text-slate-500 bg-slate-50 rounded-full hover:bg-slate-100" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            {extraMobileNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-4 rounded-2xl transition-all font-semibold ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </NavLink>
            ))}

            {isUserAdmin && (
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onAdminClick();
                }}
                className="flex items-center gap-3 p-4 rounded-2xl transition-all font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-left"
              >
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  <Shield className="w-5 h-5 text-indigo-600" />
                </div>
                <span>Admin Panel</span>
              </button>
            )}

            {user && (
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 p-4 rounded-2xl transition-all font-semibold bg-red-50 text-red-600 hover:bg-red-100 text-left mt-4"
              >
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  <LogOut className="w-5 h-5 text-red-600" />
                </div>
                <span>Log Out</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-slate-100 px-2 flex justify-between items-center shadow-[0_-8px_20px_rgba(0,0,0,0.06)] pb-safe h-16">
        {/* Left items */}
        <div className="flex flex-1 justify-around">
          {bottomNavItems.slice(0, 2).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center pt-2 pb-1 px-3 w-16 transition-all ${
                  isActive ? 'text-blue-700 font-bold' : 'text-slate-500 font-medium'
                }`
              }
            >
              <div className="mb-1 opacity-90">{item.icon}</div>
              <span className="text-[11px] tracking-tight">{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Center Floating Action Button (WhatsApp) */}
        <div className="relative w-16 flex justify-center -top-6">
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-[52px] h-[52px] rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-[#25D366]/40 border-[4px] border-white active:scale-95 transition-transform">
              <MessageCircle className="w-7 h-7 fill-current" />
            </div>
            <span className="text-[11px] font-semibold text-slate-600 mt-1 absolute -bottom-5 whitespace-nowrap">WhatsApp</span>
          </a>
        </div>

        {/* Right items */}
        <div className="flex flex-1 justify-around">
          {bottomNavItems.slice(2, 4).map((item) => (
            item.label === 'Menu' ? (
              <button
                key="menu-btn"
                onClick={() => setIsMobileMenuOpen(true)}
                className="flex flex-col items-center justify-center pt-2 pb-1 px-3 w-16 transition-all text-slate-500 font-medium"
              >
                <div className="mb-1 opacity-90">{item.icon}</div>
                <span className="text-[11px] tracking-tight">{item.label}</span>
              </button>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center pt-2 pb-1 px-3 w-16 transition-all ${
                    isActive ? 'text-blue-700 font-bold' : 'text-slate-500 font-medium'
                  }`
                }
              >
                <div className="mb-1 opacity-90">{item.icon}</div>
                <span className="text-[11px] tracking-tight">{item.label}</span>
              </NavLink>
            )
          ))}
        </div>
      </div>
    </>
  );
}
