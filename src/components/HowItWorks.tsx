
import { motion } from 'framer-motion';
import { ClipboardCheck, FileText, Send, MessageCircle } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: <ClipboardCheck className="w-8 h-8" />,
      title: "Choose a Service",
      description: "Browse our wide range of visa and travel services and select the one that fits your needs."
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Send a Request",
      description: "Fill out our simple request form with your details and specific requirements."
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Talk With Us",
      description: "Our experts will contact you via WhatsApp, Phone, or Email to discuss your case in detail."
    },
    {
      icon: <Send className="w-8 h-8" />,
      title: "We Handle the Process",
      description: "Relax while our professional team manages all the documentation and embassy procedures for you."
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-blue-900 mb-4">How It Works</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Your journey to a new destination starts with four simple steps. We guide you through each phase of the application.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative p-8 rounded-3xl bg-white shadow-xl shadow-slate-200/50 border border-slate-100 text-center"
            >
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-px bg-slate-200 z-10" />
              )}
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">{step.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
              <div className="absolute top-4 right-4 text-4xl font-black text-slate-50 select-none">
                0{index + 1}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
