import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Send, Bot, Sparkles, MessageCircle, RotateCcw, 
  ChevronDown, Globe, Plane, GraduationCap, MapPin, CheckCircle2 
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  time: string;
}

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber: string;
  onRequestService?: () => void;
}

const AI_AVATAR = "https://res.cloudinary.com/lbbij0gf/image/upload/v1789533394/ChatGPT_Image_Sep_16_2026_10_36_17_AM.png";

const SUGGESTIONS = [
  { label: "🇪🇺 Schengen Visa", query: "How can I apply for an EU Schengen visa?" },
  { label: "🎓 Study in Europe / UK", query: "How can I study in Europe or the UK?" },
  { label: "🌍 Visit Visa", query: "How can I apply for a visit visa?" },
  { label: "🎓 Student Visa Docs", query: "What documents are required for a student visa?" },
  { label: "💼 Work Permit", query: "Do you provide work permit assistance?" },
  { label: "🇮🇳 Indian Medical Visa", query: "How can I apply for an Indian medical visa?" },
  { label: "🇮🇳 Indian Double Entry", query: "How can I apply for an Indian double entry visa?" },
  { label: "🏨 Hotel Booking", query: "Can you help me book a hotel?" },
  { label: "✈️ Air Ticketing", query: "Can you help me book an air ticket?" },
  { label: "📄 Police Clearance", query: "How can I apply for a Police Clearance Certificate?" },
  { label: "🛂 Passport Help", query: "Can you help with passport applications?" },
  { label: "📱 Online GD", query: "Can you help me with an Online GD application?" },
  { label: "🛡️ Travel Insurance", query: "Do you provide travel insurance assistance?" },
  { label: "📑 Required Documents", query: "What documents do I need for my application?" },
  { label: "💬 Contact Details", query: "How can I contact Euro Express?" }
];

export default function AIAssistantModal({ 
  isOpen, 
  onClose, 
  whatsappNumber,
  onRequestService 
}: AIAssistantModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'model',
      text: "Welcome to **Euro Express Smart AI Assistant**! 🌍\n\nI am here to guide you with Schengen Visas, Study in Europe/UK, Work Permits, Air Tickets, Indian Visas, Hotel Bookings, Police Clearance & more. \n\nHow can I help you today? Feel free to ask or click any topic below!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Lock body scroll when modal is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen, messages, loading]);

  const getLocalKnowledgeAnswer = (query: string): string => {
    const q = query.toLowerCase().trim();
    if (q.includes("schengen") || q.includes("eu schengen")) {
      return "We provide professional assistance for Schengen visa applications, including document preparation, application guidance, appointment support and process updates. Please contact Euro Express to discuss your travel purpose and required documents. Final visa decisions are made by the relevant embassy or consulate.";
    }
    if (q.includes("study in europe") || q.includes("study in the uk") || q.includes("study")) {
      return "We provide guidance for students interested in studying in Europe and the UK, including university selection, admission application support, document preparation and student visa guidance. Contact our team with your academic qualifications and preferred study destination to discuss suitable options.";
    }
    if (q.includes("visit visa") || q.includes("tourist visa") || q.includes("ভ্রমণ")) {
      return "We provide complete visit visa processing for Europe (Schengen), UK, USA, Canada, UAE (Dubai), Saudi Arabia, Qatar, Oman, Malaysia, Singapore, Thailand, and India. Our services include application form filling, travel itinerary preparation, hotel & flight bookings, cover letter drafting, bank statement guidance, and embassy appointment scheduling. Contact Euro Express (01798483565) to get started!";
    }
    if (q.includes("documents are required for a student visa") || q.includes("student visa docs") || q.includes("student visa")) {
      return `Required documents for a student visa generally include:
• Valid Passport (min. 6 months validity)
• Academic Certificates & Mark Sheets / Transcripts
• University Offer Letter / CAS / Acceptance Certificate
• Proof of English Proficiency (IELTS / PTE / Duolingo / MOI if applicable)
• Bank Statement & Financial Solvency Proof (last 6 months)
• Statement of Purpose (SOP) or Motivation Letter
• Recent 35x45mm Passport-size Photographs
• Police Clearance Certificate & Health/Medical Insurance.`;
    }
    if (q.includes("work permit") || q.includes("work visa")) {
      return "Yes! Euro Express provides expert guidance and documentation assistance for European employment & work permit visas (e.g. Romania, Poland, Croatia, Hungary, Serbia, Malta, etc.). Contact us with your CV/resume for profile assessment!";
    }
    if (q.includes("indian medical") || q.includes("medical visa")) {
      return `To apply for an Indian Medical Visa, you will need:
• Valid Passport (min. 6 months validity)
• Official Doctor Appointment Letter / Medical Invitation from an accredited Indian Hospital
• Local Doctor Diagnosis / Prescription & Test Reports
• NID / Birth Certificate Copy & Utility Bill Copy
• Profession Proof & 6-month Bank Statement
We assist with complete form filling, hospital appointment coordination, and online portal submission. Contact: 01798483565.`;
    }
    if (q.includes("double entry") || q.includes("indian double")) {
      return `We provide complete support for Indian Tourist & Business Double Entry Visas. Required documents:
• Original Passport (valid for at least 6 months)
• NID / Birth Certificate copy & Utility Bill copy
• Profession Proof (Trade License / NOC / Student ID)
• Bank Statement or International Dollar Endorsement
• Travel Itinerary / Booking details
Contact Euro Express at 01798483565 for quick processing.`;
    }
    if (q.includes("hotel")) {
      return "Yes! We provide genuine hotel bookings as well as embassy-compliant hotel reservation vouchers worldwide for visa applications. Contact Euro Express at 01798483565.";
    }
    if (q.includes("ticket") || q.includes("flight")) {
      return "Yes! We offer instant domestic and international flight ticket bookings with guaranteed lowest fares, flexible date changes, baggage allowance assistance, and 24/7 customer support. Call/WhatsApp: 01798483565.";
    }
    if (q.includes("police clearance") || q.includes("pcc")) {
      return "We assist with online Police Clearance Certificate (PCC) applications in Bangladesh, including document verification, passport linking, fee payment guidance, and tracking until certificate issuance. Call/WhatsApp: 01798483565.";
    }
    if (q.includes("passport")) {
      return "Yes, we provide step-by-step assistance for new e-Passport / MRP applications, renewals, corrections, document preparation, and online appointment booking. Contact Euro Express at 01798483565.";
    }
    if (q.includes("online gd") || q.includes("general diary")) {
      return "Yes! We can assist you in filing an Online General Diary (Online GD) through the official Bangladesh Police portal for lost passports, NIDs, academic certificates, or mobile phones. Call/WhatsApp: 01798483565.";
    }
    if (q.includes("insurance")) {
      return "Yes! Euro Express issues embassy-approved international travel and medical insurance policies with minimum €30,000 coverage required for Schengen Europe visas and global travel. Contact: 01798483565.";
    }
    if (q.includes("required documents") || q.includes("documents")) {
      return `Standard required documents for visa applications include:
• Original Passport (valid for 6+ months)
• Recent 35x45mm photos (white background)
• NID / Birth Certificate & Utility Bill Copy
• 6-Month Bank Statement & Solvency Certificate
• Proof of Profession (Trade License for businessmen, NOC & Pay Slip for jobholders, Student ID for students)
• Travel Itinerary, Hotel Booking & Travel Insurance.`;
    }
    if (
      q.includes("name") ||
      q.includes("naam") ||
      q.includes("নাম") ||
      q.includes("who are you") ||
      q.includes("কে আপনি") ||
      q.includes("কে তুমি")
    ) {
      return "আমি **Euro Express AI** — ইউরো এক্সপ্রেস ট্রাভেলস-এর অফিসিয়াল স্মার্ট ট্রাভেল কনসালট্যান্ট। ইউরোপ/শেনজেন ভিসা, স্টুডেন্ট ভিসা, ওয়ার্ক পারমিট, এয়ার টিকিট ও পাসপোর্ট সংক্রান্ত যেকোনো তথ্যে আমি আপনাকে সহায়তা করতে পারি। আজ আপনাকে কীভাবে সাহায্য করতে পারি?";
    }
    if (
      q === "hi" ||
      q === "hello" ||
      q === "সালাম" ||
      q === "salam" ||
      q.includes("kemon") ||
      q.includes("কেমন")
    ) {
      return "হ্যালো! ইউরো এক্সপ্রেস (Euro Express)-এ আপনাকে স্বাগতম। আমি ভালো আছি, ধন্যবাদ! আপনার ইউরোপ/শেনজেন ভিসা, স্টুডেন্ট ভিসা, ওয়ার্ক পারমিট বা এয়ার টিকিট বুকিং সংক্রান্ত যেকোনো তথ্য জানতে আমাকে প্রশ্ন করতে পারেন।";
    }
    if (q.includes("contact") || q.includes("location") || q.includes("address") || q.includes("phone")) {
      return `Euro Express Contact Details:
• 📞 Phone & WhatsApp: 01798483565 / +880 1798-483565
• 📧 Email: euroexpresstravels65@gmail.com
• 📍 Office Address: Mirpur Bazar, Bahubal, Hobiganj
• ⏰ Office Hours: Everyday 9:00 AM – 9:00 PM.`;
    }
    return "Welcome to Euro Express! For any queries regarding Europe Schengen Visas, Student Visas, Work Permits, or Air Ticketing, please call or WhatsApp us at: **01798483565**.";
  };

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Format chat history for context
      const history = messages.map(m => ({
        role: m.role,
        text: m.text
      }));

      // Candidate API endpoints with resilient fallback
      const candidateEndpoints = window.location.hostname.includes('netlify.app')
        ? ['/.netlify/functions/chat', '/api/chat', '/.netlify/functions/server/chat']
        : ['/api/chat', '/.netlify/functions/chat', '/.netlify/functions/server/chat'];

      let replyText = '';
      for (const endpoint of candidateEndpoints) {
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: textToSend,
              history: history
            })
          });

          if (res.ok) {
            const data = await res.json().catch(() => null);
            if (data && (data.reply || data.response)) {
              replyText = data.reply || data.response;
              break;
            }
          }
        } catch (fetchErr) {
          console.warn(`Endpoint ${endpoint} failed, trying next...`, fetchErr);
        }
      }

      if (!replyText) {
        replyText = getLocalKnowledgeAnswer(textToSend);
      }

      const modelReply: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, modelReply]);
    } catch (err) {
      console.error("AI chat error:", err);
      const fallbackReply: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: getLocalKnowledgeAnswer(textToSend),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackReply]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        text: "The chat has been reset. Feel free to ask me any questions regarding your travel or visa!",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const renderFormattedText = (text: string) => {
    // Process markdown bolding and bullet points nicely
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1.5" />;
          
          let parsedLine = line;
          // Format bold **text**
          const parts = parsedLine.split(/(\*\*.*?\*\*)/g);

          const renderedParts = parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
            }
            return part;
          });

          if (line.trim().startsWith('- ') || line.trim().startsWith('• ') || line.trim().startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-blue-500 font-bold mt-1 text-xs">•</span>
                <span className="flex-1">{renderedParts}</span>
              </div>
            );
          }

          if (/^\d+\./.test(line.trim())) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-blue-600 font-bold text-xs mt-0.5">{line.trim().match(/^\d+\./)?.[0]}</span>
                <span className="flex-1">{line.replace(/^\d+\.\s*/, '')}</span>
              </div>
            );
          }

          return <p key={idx}>{renderedParts}</p>;
        })}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[250] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs transition-opacity">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.96 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col h-[100dvh] sm:h-[640px] max-h-[100dvh] sm:max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 p-4 text-white flex items-center justify-between shadow-md relative">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src={AI_AVATAR} 
                  alt="AI Assistant" 
                  className="w-11 h-11 rounded-2xl object-cover border-2 border-white/40 shadow-md bg-white p-0.5"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-blue-900 rounded-full animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-base text-white tracking-wide">Euro Express AI</h3>
                  <span className="bg-amber-400/30 text-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300/40 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> 24/7 Smart
                  </span>
                </div>
                <p className="text-xs text-blue-100 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span> Online • Visa & Travel Guide
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                title="Clear Chat History"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-white hover:bg-white/20 rounded-xl transition-all active:scale-95 cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Notice Bar */}
          <div className="bg-blue-50/80 px-4 py-2 border-b border-blue-100/60 flex items-center justify-between text-xs text-blue-900 font-medium">
            <span className="flex items-center gap-1.5 truncate">
              <Globe className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <span className="truncate">Ask in Bangla or English • Europe, Tickets, Visas</span>
            </span>
            <a 
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 hover:underline flex-shrink-0 ml-2"
            >
              <MessageCircle className="w-3 h-3 text-emerald-600" /> WhatsApp
            </a>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <img 
                    src={AI_AVATAR} 
                    alt="AI" 
                    className="w-8 h-8 rounded-xl object-cover flex-shrink-0 mt-0.5 border border-blue-200 shadow-xs bg-white"
                  />
                )}

                <div className={`max-w-[85%] rounded-2xl p-3.5 shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                }`}>
                  {msg.role === 'user' ? (
                    <p className="text-sm font-medium whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    renderFormattedText(msg.text)
                  )}

                  <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                    msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'
                  }`}>
                    <span>{msg.time}</span>
                  </div>
                </div>
              </motion.div>
            ))}

            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-slate-500 bg-white p-3 rounded-2xl w-fit border border-slate-200 shadow-xs"
              >
                <img 
                  src={AI_AVATAR} 
                  alt="AI" 
                  className="w-6 h-6 rounded-lg object-cover"
                />
                <div className="flex items-center gap-1 px-1">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0.4s]"></span>
                </div>
                <span className="text-xs font-semibold text-slate-600">AI Assistant is thinking...</span>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 py-2 bg-slate-100/80 border-t border-slate-200 flex gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {SUGGESTIONS.map((sugg, i) => (
              <button
                key={i}
                onClick={() => handleSend(sugg.query)}
                className="whitespace-nowrap text-xs font-bold px-3 py-1.5 rounded-full bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 shadow-2xs transition-all active:scale-95 flex-shrink-0 cursor-pointer"
              >
                {sugg.label}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 sm:p-4 bg-white border-t border-slate-200 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about visas, flights, countries..."
                disabled={loading}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>

            <div className="flex flex-col sm:flex-row items-center justify-between mt-2 px-1 text-[11px] text-slate-500 font-medium gap-1 text-center sm:text-left">
              <span>Euro Express • Mirpur Bazar, Bahubal, Hobiganj</span>
              <a 
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1 font-bold"
              >
                Direct WhatsApp Support
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
