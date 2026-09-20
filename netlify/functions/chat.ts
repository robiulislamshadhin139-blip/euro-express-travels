import type { Handler, HandlerEvent } from "@netlify/functions";
import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are the Official Smart AI Travel Consultant & Assistant of "Euro Express" (ইউরো এক্সপ্রেস).
You help visitors with highly accurate, friendly, and expert information in Bengali and English. 
Your goal is not just to give raw information, but to present it beautifully (using bullet points and clear paragraphs) and to offer helpful advice/guidance like a professional travel consultant.

CRITICAL RULE: You are strictly forbidden from discussing, mentioning, or acknowledging the existence of any Admin Panel, Dashboard, AI Studio, Groq API, backend systems, database, or internal operations of this website. If a user asks about admin access, passwords, or how you are built, politely decline and change the topic back to travel services.

Key Facts about Euro Express:
- Address: Mirpur Bazar, Bahubal, Hobiganj.
- Contact / WhatsApp: 01798483565 / +880 1798-483565
- Email: euroexpresstravels65@gmail.com
- Hours: 9:00 AM – 9:00 PM (Everyday).

Guidelines for Answering:
1. Be polite, warm, and highly professional.
2. Structure your answers beautifully using bullet points for readability.
3. Act as a consultant: if someone asks about a visa, also advise them to prepare their bank statements early or ensure their passport has 6 months validity.
4. If asked your name (e.g., "apnar name ki", "who are you"), reply that you are the official Euro Express Smart AI Travel Consultant ("আমি ইউরো এক্সপ্রেস-এর অফিসিয়াল এআই ট্রাভেল কনসালট্যান্ট").
5. Answer user questions based on Euro Express services: Europe/Schengen Visas, Student Visas (UK/Europe), Work Permits (Romania, Poland, Croatia, etc.), Visit Visas, Air Tickets, Hotel Bookings, Indian Visas (Medical/Double Entry), Police Clearance, and Passport Services.
`;

function getKnowledgeResponse(message: string): string {
  const lowerMsg = message.toLowerCase().trim();

  if (
    lowerMsg.includes("name") ||
    lowerMsg.includes("naam") ||
    lowerMsg.includes("নাম") ||
    lowerMsg.includes("who are you") ||
    lowerMsg.includes("কে আপনি") ||
    lowerMsg.includes("কে তুমি")
  ) {
    return "আমি **Euro Express AI** — ইউরো এক্সপ্রেস ট্রাভেলস-এর অফিসিয়াল স্মার্ট ট্রাভেল কনসালট্যান্ট। ভিসা প্রসেসিং, এয়ার টিকিট, স্টুডেন্ট ভিসা, ওয়ার্ক পারমিটসহ ভ্রমণ সংক্রান্ত যেকোনো তথ্যে আমি আপনাকে সহায়তা করতে পারি। আজ আপনাকে কীভাবে সাহায্য করতে পারি?";
  }

  if (
    lowerMsg === "hi" ||
    lowerMsg === "hello" ||
    lowerMsg === "সালাম" ||
    lowerMsg === "salam" ||
    lowerMsg.includes("kemon") ||
    lowerMsg.includes("কেমন")
  ) {
    return "হ্যালো! ইউরো এক্সপ্রেস (Euro Express)-এ আপনাকে স্বাগতম। আমি ভালো আছি, ধন্যবাদ! আপনার ইউরোপ/শেনজেন ভিসা, স্টুডেন্ট ভিসা, ওয়ার্ক পারমিট বা এয়ার টিকিট বুকিং সংক্রান্ত যেকোনো তথ্য জানতে আমাকে প্রশ্ন করতে পারেন।";
  }

  if (lowerMsg.includes("schengen") || lowerMsg.includes("eu schengen") || lowerMsg.includes("ইউরোপ")) {
    return "আমরা ইউরোপের শেনজেন (Schengen) ভিসা প্রসেসিংয়ের জন্য সম্পূর্ণ ফাইল প্রিপারেশন, অ্যাপয়েন্টমেন্ট বুকিং, ট্রাভেল আইটিনারি, এম্বাসি-কমপ্লায়েন্ট হোটেল রিজার্ভেশন এবং ট্রাভেল ইন্স্যুরেন্স সহায়তা দিয়ে থাকি। বিস্তারিত জানতে যোগাযোগ করুন: 01798483565।";
  }

  if (lowerMsg.includes("study in europe") || lowerMsg.includes("study in the uk") || lowerMsg.includes("student")) {
    return "ইউকে এবং ইউরোপের বিভিন্ন দেশে স্টুডেন্ট ভিসার জন্য আমরা ইউনিভার্সিটি অ্যাডমিশন, অফার লেটার/CAS সংগ্রহ, স্পন্সরশিপ/ব্যাংক স্টেটমেন্ট গাইডেন্স এবং ভিসা ফাইল প্রসেসিং সহায়তা প্রদান করি। যোগাযোগ: 01798483565।";
  }

  if (lowerMsg.includes("visit visa") || lowerMsg.includes("tourist visa") || lowerMsg.includes("ভ্রমণ")) {
    return "আমরা ইউরোপ (শেনজেন), ইউকে, ইউএসএ, কানাডা, দুবাই (UAE), সৌদি আরব, কাতার, মালয়েশিয়া, সিঙ্গাপুর, থাইল্যান্ড এবং ভারতের ভিজিট ভিসা প্রসেসিং করি। যোগাযোগ: 01798483565।";
  }

  if (lowerMsg.includes("work permit") || lowerMsg.includes("work visa") || lowerMsg.includes("job visa")) {
    return "হ্যাঁ! রোমানিয়া, পোল্যান্ড, ক্রোয়েশিয়া, হাঙ্গেরি, সার্বিয়া ও মাল্টাসহ ইউরোপের বিভিন্ন দেশের ওয়ার্ক পারমিটের ফাইল প্রসেসিংয়ে আমরা সহায়তা করে থাকি। আপনার সিভি নিয়ে আমাদের অফিসে যোগাযোগ করুন বা কল করুন: 01798483565।";
  }

  if (lowerMsg.includes("indian") || lowerMsg.includes("india") || lowerMsg.includes("ভারত")) {
    return "আমরা ইন্ডিয়ান মেডিকেল ভিসা, ডাবল এন্ট্রি ও ট্যুরিস্ট ভিসা অ্যাপ্লিকেশন, হাসপাতাল ইনভাইটেশন ও অ্যাপয়েন্টমেন্ট সহায়তা দিয়ে থাকি। কল করুন: 01798483565।";
  }

  if (lowerMsg.includes("air ticket") || lowerMsg.includes("flight") || lowerMsg.includes("টিকেট")) {
    return "আমরা অভ্যন্তরীণ ও আন্তর্জাতিক সকল রুটের এয়ার টিকিট সুলভ মূল্যে বুকিং এবং ডেট চেঞ্জ সুবিধা দিয়ে থাকি। সরাসরি কল/হোয়াটসঅ্যাপ করুন: 01798483565।";
  }

  if (lowerMsg.includes("police clearance") || lowerMsg.includes("pcc")) {
    return "আমরা অনলাইনে নির্ভুলভাবে পুলিশ ক্লিয়ারেন্স সার্টিফিকেট (PCC) আবেদন ও ট্র্যাকিং সহায়তা প্রদান করি। যোগাযোগ: 01798483565।";
  }

  if (lowerMsg.includes("passport")) {
    return "ই-পাসপোর্ট / এমআরপি আবেদন, রিনিউয়াল, সংশোধন ও বায়োমেট্রিক অ্যাপয়েন্টমেন্টের সকল কাজে আমরা সহযোগিতা করি। অফিস: মিরপুর বাজার, বাহুবল, হবিগঞ্জ।";
  }

  if (lowerMsg.includes("contact") || lowerMsg.includes("location") || lowerMsg.includes("address") || lowerMsg.includes("phone")) {
    return "Euro Express Contact Details:\n• 📞 Phone & WhatsApp: 01798483565 / +880 1798-483565\n• 📧 Email: euroexpresstravels65@gmail.com\n• 📍 Office Address: Mirpur Bazar, Bahubal, Hobiganj\n• ⏰ Office Hours: Everyday 9:00 AM – 9:00 PM.";
  }

  return "Welcome to Euro Express! We offer professional assistance for Schengen Visas, Study in Europe/UK, Work Permits, Visit Visas, Air Tickets, Hotel Bookings, Indian Visas, Police Clearance, and Passport Services. Please contact our team at 01798483565 or visit our office at Mirpur Bazar, Bahubal, Hobiganj.";
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json"
};

export const handler: Handler = async (event: HandlerEvent) => {
  // Handle preflight CORS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ status: "ok" })
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  let message = "";
  let history: any[] = [];

  try {
    if (event.body) {
      const parsed = JSON.parse(event.body);
      message = (parsed.message || "").trim();
      history = Array.isArray(parsed.history) ? parsed.history : [];
    }
  } catch {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Invalid JSON body" })
    };
  }

  if (!message) {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Message is required" })
    };
  }

  // 1. Try Groq AI first if key exists
  const groqApiKey = process.env.GROQ_API_KEY;
  if (groqApiKey) {
    try {
      const groq = new Groq({ apiKey: groqApiKey });
      const messages: any[] = [{ role: "system", content: SYSTEM_INSTRUCTION }];

      if (history.length > 0) {
        const safeHistory = history.slice(-8);
        for (const item of safeHistory) {
          if (item.role === "user" || item.role === "assistant" || item.role === "model") {
            const textContent = String(item.content || item.text || "").substring(0, 800);
            messages.push({
              role: item.role === "model" ? "assistant" : item.role,
              content: textContent
            });
          }
        }
      }

      messages.push({ role: "user", content: message.substring(0, 1500) });

      const response = await groq.chat.completions.create({
        messages,
        model: "qwen/qwen3.8-27b",
        temperature: 0.7,
      });

      const replyText = response.choices[0]?.message?.content;
      if (replyText) {
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({ reply: replyText, response: replyText })
        };
      }
    } catch (groqErr) {
      console.warn("Groq failed in Netlify function, trying Gemini fallback:", groqErr);
    }
  }

  // 2. Fallback to Google Gemini AI if GEMINI_API_KEY is available
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      let prompt = `${SYSTEM_INSTRUCTION}\n\n`;

      if (history.length > 0) {
        prompt += `Previous conversation:\n`;
        for (const item of history.slice(-6)) {
          const role = item.role === "model" || item.role === "assistant" ? "Assistant" : "User";
          const text = String(item.content || item.text || "").substring(0, 400);
          prompt += `${role}: ${text}\n`;
        }
        prompt += `\n`;
      }

      prompt += `User: ${message}\nAssistant:`;

      const res = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt
      });

      if (res.text) {
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({ reply: res.text, response: res.text })
        };
      }
    } catch (geminiErr) {
      console.warn("Gemini fallback failed in Netlify function:", geminiErr);
    }
  }

  // 3. Fallback to rich knowledge response
  const fallbackReply = getKnowledgeResponse(message);
  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({ reply: fallbackReply, response: fallbackReply })
  };
};
