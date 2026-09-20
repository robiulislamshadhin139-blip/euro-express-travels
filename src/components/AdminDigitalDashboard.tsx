/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Inbox, CheckCircle2, Clock, Users, Layout, Star, 
  ArrowUpRight, Phone, MessageCircle, ExternalLink, 
  RefreshCw, Filter, ChevronRight, Check,
  Activity, PieChart, BarChart3, HelpCircle, KeyRound,
  Search, ShieldAlert, ArrowRight, Layers, FileText, FolderLock
} from 'lucide-react';
import { Service, SiteConfig, Review, TeamMember, FAQItem } from '../types';

export interface DashboardInquiry {
  id: string;
  customerName?: string;
  name?: string;
  customerMobile?: string;
  mobile?: string;
  customerEmail?: string;
  email?: string;
  userEmail?: string;
  serviceName?: string;
  serviceTitle?: string;
  serviceId?: string;
  details?: string;
  message?: string;
  type?: string;
  createdAt: any;
  status: string;
  adminReply?: string;
}

interface AdminDigitalDashboardProps {
  inquiries: DashboardInquiry[];
  services: Service[];
  reviews: Review[];
  team: TeamMember[];
  faqs: FAQItem[];
  config: SiteConfig;
  loadingInquiries: boolean;
  onNavigateTab: (tab: 'dashboard' | 'inquiries' | 'documents' | 'team' | 'services' | 'about' | 'faqs' | 'config') => void;
  onUpdateInquiryStatus: (id: string, newStatus: string) => Promise<void>;
}

type TimeRange = 'ALL' | 'MONTH' | 'WEEK' | 'TODAY';

export default function AdminDigitalDashboard({
  inquiries,
  services,
  reviews,
  team,
  faqs,
  config,
  loadingInquiries,
  onNavigateTab,
  onUpdateInquiryStatus
}: AdminDigitalDashboardProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('ALL');
  const [activeChartHover, setActiveChartHover] = useState<{ day: string; count: number } | null>(null);

  // Helper to parse date from inquiry createdAt
  const getInquiryDate = (inquiry: DashboardInquiry): Date | null => {
    if (!inquiry.createdAt) return null;
    if (inquiry.createdAt.toDate && typeof inquiry.createdAt.toDate === 'function') {
      return inquiry.createdAt.toDate();
    }
    if (inquiry.createdAt.seconds) {
      return new Date(inquiry.createdAt.seconds * 1000);
    }
    if (typeof inquiry.createdAt === 'string' || typeof inquiry.createdAt === 'number') {
      const d = new Date(inquiry.createdAt);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  };

  // Filter inquiries by selected time interval
  const timeFilteredInquiries = useMemo(() => {
    if (timeRange === 'ALL') return inquiries;
    const now = new Date();

    return inquiries.filter(item => {
      const date = getInquiryDate(item);
      if (!date) return true;

      const diffMs = now.getTime() - date.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (timeRange === 'TODAY') {
        return diffHours <= 24;
      }
      if (timeRange === 'WEEK') {
        return diffHours <= 24 * 7;
      }
      if (timeRange === 'MONTH') {
        return diffHours <= 24 * 30;
      }
      return true;
    });
  }, [inquiries, timeRange]);

  // Aggregate Metrics
  const totalInquiriesCount = timeFilteredInquiries.length;
  
  const pendingInquiries = useMemo(() => {
    return timeFilteredInquiries.filter(i => (i.status || 'PENDING').toUpperCase() === 'PENDING');
  }, [timeFilteredInquiries]);

  const processingInquiries = useMemo(() => {
    return timeFilteredInquiries.filter(i => {
      const s = (i.status || '').toUpperCase();
      return s === 'PROCESSING' || s === 'DOCUMENT_SUBMITTED' || s === 'EMBASSY_APPOINTMENT';
    });
  }, [timeFilteredInquiries]);

  const approvedInquiries = useMemo(() => {
    return timeFilteredInquiries.filter(i => {
      const s = (i.status || '').toUpperCase();
      return s === 'APPROVED' || s === 'COMPLETED';
    });
  }, [timeFilteredInquiries]);

  const contactedInquiries = useMemo(() => {
    return timeFilteredInquiries.filter(i => (i.status || '').toUpperCase() === 'CONTACTED');
  }, [timeFilteredInquiries]);

  const rejectedInquiries = useMemo(() => {
    return timeFilteredInquiries.filter(i => (i.status || '').toUpperCase() === 'REJECTED');
  }, [timeFilteredInquiries]);

  // Approval Rate Calculation
  const decidedTotal = approvedInquiries.length + rejectedInquiries.length;
  const approvalRate = decidedTotal > 0 
    ? Math.round((approvedInquiries.length / decidedTotal) * 100) 
    : (totalInquiriesCount > 0 ? Math.round((approvedInquiries.length / totalInquiriesCount) * 100) : 100);

  // Average Review Rating
  const averageRating = useMemo(() => {
    if (!reviews.length) return '5.0';
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  // Service distribution breakdown
  const serviceDistribution = useMemo(() => {
    const counts: { [serviceName: string]: number } = {};
    timeFilteredInquiries.forEach(i => {
      const name = i.serviceName || i.serviceTitle || 'General Visa Consultation';
      counts[name] = (counts[name] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalInquiriesCount > 0 ? Math.round((count / totalInquiriesCount) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);
  }, [timeFilteredInquiries, totalInquiriesCount]);

  // Timeline / Trend Data (Last 7 days volume)
  const timelineData = useMemo(() => {
    const days: { [key: string]: { label: string; count: number } } = {};
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      days[key] = { label, count: 0 };
    }

    inquiries.forEach(i => {
      const date = getInquiryDate(i);
      if (date) {
        const key = date.toISOString().split('T')[0];
        if (days[key]) {
          days[key].count += 1;
        }
      }
    });

    return Object.values(days);
  }, [inquiries]);

  const maxTimelineCount = Math.max(...timelineData.map(d => d.count), 4);
  const totalWeeklyVelocity = timelineData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* 1. Header & Live Telemetry Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Cloud Sync
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {config.name || 'EURO EXPRESS'} Operations Console
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Executive Dashboard
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Real-time telemetry of visa inquiries, application velocity, and agency performance.
            </p>
          </div>

          {/* Timeframe Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-800/90 p-1.5 rounded-xl border border-slate-700/80 self-start lg:self-center">
            <span className="text-[11px] font-semibold text-slate-400 px-2 hidden sm:inline">
              Range:
            </span>
            {(['ALL', 'MONTH', 'WEEK', 'TODAY'] as TimeRange[]).map((r) => {
              const labels: Record<TimeRange, string> = {
                ALL: 'All Time',
                MONTH: '30 Days',
                WEEK: '7 Days',
                TODAY: 'Today'
              };
              return (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    timeRange === r
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {labels[r]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Inquiries */}
        <div 
          onClick={() => onNavigateTab('inquiries')}
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Inquiries
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {loadingInquiries ? '...' : totalInquiriesCount}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {totalWeeklyVelocity} submitted in last 7 days
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:text-blue-700">
            <span>View all leads</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 2: Needs Attention (Pending) */}
        <div 
          onClick={() => onNavigateTab('inquiries')}
          className={`bg-white rounded-xl p-5 border transition-all cursor-pointer group ${
            pendingInquiries.length > 0 
              ? 'border-amber-300 ring-1 ring-amber-200 shadow-xs' 
              : 'border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Action Required
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-amber-600 tracking-tight">
              {loadingInquiries ? '...' : pendingInquiries.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Unprocessed inquiries awaiting follow-up
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-700 group-hover:text-amber-800">
            <span>Review pending queue</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 3: In Processing */}
        <div 
          onClick={() => onNavigateTab('inquiries')}
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              In Processing
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-purple-700 tracking-tight">
              {loadingInquiries ? '...' : processingInquiries.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active verification & embassy cases
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-700 group-hover:text-purple-800">
            <span>Track pipeline</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 4: Approved & Completed */}
        <div 
          onClick={() => onNavigateTab('inquiries')}
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Completed & Approved
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-emerald-600 tracking-tight">
              {loadingInquiries ? '...' : approvedInquiries.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {approvalRate}% success rate across resolved files
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:text-emerald-800">
            <span>View closed files</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* 3. Secondary Operational Quick Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigateTab('services')}
          className="bg-white p-3.5 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-all flex items-center gap-3 text-left shadow-2xs group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-blue-50 text-slate-600 group-hover:text-blue-600 flex items-center justify-center shrink-0">
            <Layout className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-bold text-slate-900">{services.length} Services</div>
            <div className="text-[11px] text-slate-500 truncate">Active catalog</div>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('team')}
          className="bg-white p-3.5 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-all flex items-center gap-3 text-left shadow-2xs group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-emerald-50 text-slate-600 group-hover:text-emerald-600 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-bold text-slate-900">{team.length} Members</div>
            <div className="text-[11px] text-slate-500 truncate">Consultant roster</div>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('faqs')}
          className="bg-white p-3.5 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-all flex items-center gap-3 text-left shadow-2xs group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-purple-50 text-slate-600 group-hover:text-purple-600 flex items-center justify-center shrink-0">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-bold text-slate-900">{faqs.length} FAQs</div>
            <div className="text-[11px] text-slate-500 truncate">Knowledge base</div>
          </div>
        </button>
      </div>

      {/* 4. Visual Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): 7-Day Application Velocity Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>Application Velocity (Last 7 Days)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Daily distribution of new inquiries from web visitors.</p>
            </div>
            {activeChartHover && (
              <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold self-start border border-blue-100">
                {activeChartHover.day}: {activeChartHover.count} {activeChartHover.count === 1 ? 'inquiry' : 'inquiries'}
              </span>
            )}
          </div>

          {/* Bar Chart Canvas */}
          <div className="h-52 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-1">
            {timelineData.map((item, idx) => {
              const heightPercent = Math.max(10, Math.round((item.count / maxTimelineCount) * 100));
              const isPeak = item.count === maxTimelineCount && item.count > 0;
              return (
                <div 
                  key={idx} 
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer"
                  onMouseEnter={() => setActiveChartHover({ day: item.label, count: item.count })}
                  onMouseLeave={() => setActiveChartHover(null)}
                >
                  <div className="text-[11px] font-semibold text-slate-600 group-hover:text-blue-600 transition-colors">
                    {item.count > 0 ? item.count : ''}
                  </div>
                  <div className="w-full max-w-[40px] bg-slate-100 rounded-t-lg overflow-hidden relative flex items-end h-full">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-lg transition-all duration-300 ${
                        isPeak 
                          ? 'bg-blue-600 group-hover:bg-blue-500' 
                          : item.count > 0 
                            ? 'bg-blue-500 group-hover:bg-blue-600' 
                            : 'bg-slate-200'
                      }`}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 group-hover:text-slate-900 transition-colors text-center whitespace-nowrap">
                    {item.label.split(',')[0]}
                  </span>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>Real-time visitor inquiries</span>
            </span>
            <button
              onClick={() => onNavigateTab('inquiries')}
              className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Inspect Inquiries CRM</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column (1 Col): Demand by Service Category */}
        <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                <PieChart className="w-4 h-4 text-emerald-600" />
                <span>Demand by Service</span>
              </h2>
              <span className="text-xs font-semibold text-slate-400">{serviceDistribution.length} Categories</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">Breakdown of inquiries across service categories.</p>

            {serviceDistribution.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                No inquiries recorded yet for this period.
              </div>
            ) : (
              <div className="space-y-3.5">
                {serviceDistribution.slice(0, 5).map((item, idx) => {
                  const colors = [
                    'bg-blue-600',
                    'bg-emerald-600',
                    'bg-purple-600',
                    'bg-amber-500',
                    'bg-indigo-500'
                  ];
                  const barColor = colors[idx % colors.length];

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 truncate max-w-[170px]" title={item.name}>
                          {item.name}
                        </span>
                        <span className="font-medium text-slate-500">
                          <strong className="text-slate-900 font-bold">{item.count}</strong> ({item.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${item.percentage}%` }}
                          className={`h-full rounded-full ${barColor}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigateTab('services')}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
            >
              <Layout className="w-3.5 h-3.5 text-slate-500" />
              <span>Manage Service Offerings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
