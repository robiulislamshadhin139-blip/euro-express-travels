import express from "express";
import serverless from "serverless-http";
import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(express.json({ limit: "1mb" }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

const SYSTEM_INSTRUCTION = `
You are the Official Smart AI Travel Consultant & Assistant of "Euro Express" (ইউরো এক্সপ্রেস).
You help visitors with highly accurate, friendly, and expert information in Bengali and English. 
Your goal is not just to give raw information, but to present it beautifully (using bullet points and clear paragraphs) and to offer helpful advice/guidance like a professional travel consultant.

CRITICAL RULE: You are strictly forbidden from discussing, mentioning, or acknowledging the existence of any Admin Panel, Dashboard, AI Studio, Groq API, backend systems, database, or internal operations of this website. If a user asks about admin access, passwords, or how you are built, politely decline and change the topic back to travel services.

Key Facts about Euro Express:
- Address: Mirpur Bazar, Bahubal, Hobiganj.
- Contact / WhatsApp: 01798483565
- Hours: 9:00 AM – 9:00 PM.

Guidelines for Answering:
1. Be polite, warm, and highly professional.
2. Structure your answers beautifully using bullet points for readability.
3. Act as a consultant: if someone asks about a visa, also advise them to prepare their bank statements early or ensure their passport has 6 months validity.
4. Answer user questions based ONLY on the following Knowledge Base. Do not make up fake visa rules or pricing.

### 1. Worldwide Visit Visa Processing
- Countries: Schengen, UK, USA, Canada, UAE, Saudi, Qatar, Malaysia, Singapore, Thailand, India, etc.
- Documents needed: Valid Passport, NID/Birth Certificate, Utility Bill, 6-month Bank Statement, Profession Proof (Trade license/NOC/Student ID), Photos.
- Time: Depends on the embassy (usually 2-4 weeks).
- Cost: Varies by country and embassy fees. Contact office for exact costs.
- Rejection: Embassy decisions are final. Visa fees are non-refundable.
- Family/Group: Yes, we process family and group visit visas.
- Status: You can track status online or contact our office.

### 2. Student Visa Processing
- Countries: UK, USA, Canada, Australia, Europe (Schengen countries).
- Documents: Passport, Academic Transcripts, Offer Letter/CAS, IELTS/PTE (or MOI if applicable), Financial Proof/Bank Statement, SOP, Photos, Medical Insurance, PCC.
- IELTS: Yes, possible without IELTS in some European countries with MOI (Medium of Instruction) depending on university policy.
- Services: We provide BOTH admission and visa processing assistance.
- Processing Time: 1-3 months depending on university and embassy.
- Tuition/Finances: Varies by university. Must show sufficient bank balance.
- Status/Process: We guide from university selection, admission, SOP, to final embassy application.

### 3. Work Permit
- Countries: Europe (Romania, Poland, Croatia, Hungary, Serbia, Malta, etc.) and others.
- Documents: Passport, CV, Academic/Experience Certificates, Police Clearance, Photos.
- Job Offer: Not strictly needed beforehand; we help profile processing.
- Time: Usually 4-8 months depending on country.
- Cost: Depends on the country. Call office for details.
- Employer Verification: Handled via official channels.
- Family: Dependent visa policies vary by country.

### 4. Indian Medical Visa
- Documents: Passport, Official Indian Hospital Appointment Letter, Local Doctor Prescription/Tests, NID, Utility Bill, Bank Statement/Dollar Endorsement.
- Hospital Appointment: Yes, we arrange hospital appointments in India.
- Attendants: Yes, medical attendants can travel with the patient.
- Time: Fast processing (usually a few days).
- Process: We handle complete form fill-up, appointment, and submission assistance.

### 5. Indian Double Entry Visa
- What is it: Allows entering India twice on the same visa (e.g., traveling to another country via India).
- Who can get: Tourists/Business travelers who need to transit or visit twice.
- Documents: Passport, NID, Utility Bill, Profession Proof, Bank Statement/Dollar Endorsement, Ticket/Itinerary.
- Validity: Usually based on travel dates.

### 6. Police Clearance Certificate (PCC)
- How to apply: We assist with online PCC applications via BD Police portal.
- Documents: Passport copy, NID copy, Chairman certificate/Utility bill, Photo.
- Time: Usually 7-15 days depending on police verification.
- Status: We help track the online status.

### 7. Hotel Booking
- Countries: Worldwide hotel bookings.
- Needs: Passport copy, travel dates, destination.
- Options: Both budget and premium hotels available.
- Confirmation: Provided instantly or within hours.
- Visa purpose: Yes, we provide embassy-compliant hotel reservation vouchers.

### 8. Air Ticketing
- Ticket types: Both Domestic and International, One-way and Round-trip.
- Airlines: All major airlines available.
- Needs: Passport copy and travel dates.
- Baggage & Changes: Baggage info provided. Ticket changes/cancellations subject to airline policies.
- E-ticket: Sent via email or WhatsApp instantly after booking.

### 9. Passport Application
- Services: New e-Passport, Renewal, Information Correction.
- Documents: NID/Birth Certificate, Old Passport (if renewal), Chairman Certificate.
- Process: We do the online application, generate the challan, and help book the biometric appointment.

### 10. Online GD Assistance
- What: General Diary for lost items (Passport, NID, Certificates, Mobile).
- Needs: NID copy, details of the lost item, incident details.
- Process & Status: We apply via the online police portal and provide the GD copy. Fast process.

### 11. Travel Insurance & Online Applications
- Travel Insurance: Necessary for Schengen and many other visas. Covers medical emergencies abroad.
- Countries: Worldwide coverage policies available (min €30,000 for Schengen).
- Other apps: We help with various online forms and applications accurately.
`;

function getKnowledgeResponse(message: string): string {
  const lowerMsg = message.toLowerCase().trim();

  if (lowerMsg.includes("schengen") || lowerMsg.includes("eu schengen")) {
    return "We provide professional assistance for Schengen visa applications, including document preparation, application guidance, appointment support and process updates. Please contact Euro Express to discuss your travel purpose and required documents. Final visa decisions are made by the relevant embassy or consulate.";
  }
  if (lowerMsg.includes("study in europe") || lowerMsg.includes("study in the uk")) {
    return "We provide guidance for students interested in studying in Europe and the UK, including university selection, admission application support, document preparation and student visa guidance. Contact our team with your academic qualifications and preferred study destination to discuss suitable options.";
  }
  if (lowerMsg.includes("visit visa") || lowerMsg.includes("tourist visa") || lowerMsg.includes("ভ্রমণ")) {
    return "We provide complete visit visa processing for Europe (Schengen), UK, USA, Canada, UAE (Dubai), Saudi Arabia, Qatar, Oman, Malaysia, Singapore, Thailand, and India. Our services include application form filling, travel itinerary preparation, hotel & flight bookings, cover letter drafting, bank statement guidance, and embassy appointment scheduling. Contact Euro Express (01798483565) to get started!";
  }
  if (lowerMsg.includes("documents are required for a student visa") || lowerMsg.includes("student visa docs")) {
    return "Required documents for a student visa generally include:\n• Valid Passport (min. 6 months validity)\n• Academic Certificates & Mark Sheets / Transcripts\n• University Offer Letter / CAS / Acceptance Certificate\n• Proof of English Proficiency (IELTS / PTE / Duolingo / MOI if applicable)\n• Bank Statement & Financial Solvency Proof (last 6 months)\n• Statement of Purpose (SOP) or Motivation Letter\n• Recent 35x45mm Passport-size Photographs\n• Police Clearance Certificate & Health/Medical Insurance.";
  }
  if (lowerMsg.includes("work permit") || lowerMsg.includes("work visa") || lowerMsg.includes("job visa")) {
    return "Yes! Euro Express provides expert guidance and documentation assistance for European employment & work permit visas (e.g. Romania, Poland, Croatia, Hungary, Serbia, Malta, etc.). Contact us with your CV/resume for a preliminary profile review!";
  }
  if (lowerMsg.includes("indian medical") || lowerMsg.includes("medical visa")) {
    return "To apply for an Indian Medical Visa, you will need:\n• Valid Passport (min. 6 months validity)\n• Official Doctor Appointment Letter / Medical Invitation from an accredited Indian Hospital\n• Local Doctor Diagnosis / Prescription & Test Reports\n• NID / Birth Certificate Copy & Utility Bill Copy\n• Profession Proof & 6-month Bank Statement\nWe assist with complete form filling, hospital appointment coordination, and online portal submission. Contact: 01798483565.";
  }
  if (lowerMsg.includes("double entry") || lowerMsg.includes("indian double")) {
    return "We provide complete support for Indian Tourist & Business Double Entry Visas. Required documents:\n• Original Passport (valid for at least 6 months)\n• NID / Birth Certificate copy & Utility Bill copy\n• Profession Proof (Trade License / NOC / Student ID)\n• Bank Statement or International Dollar Endorsement\n• Travel Itinerary / Booking details\nContact Euro Express at 01798483565 for quick processing.";
  }
  if (lowerMsg.includes("hotel") || lowerMsg.includes("hotel booking")) {
    return "Yes! We provide genuine hotel bookings as well as embassy-compliant hotel reservation vouchers worldwide for visa applications. Contact Euro Express at 01798483565.";
  }
  if (lowerMsg.includes("air ticket") || lowerMsg.includes("flight") || lowerMsg.includes("티켓")) {
    return "Yes! We offer instant domestic and international flight ticket bookings with guaranteed lowest fares, flexible date changes, baggage allowance assistance, and 24/7 customer support. Call/WhatsApp: 01798483565.";
  }
  if (lowerMsg.includes("police clearance") || lowerMsg.includes("pcc")) {
    return "We assist with online Police Clearance Certificate (PCC) applications in Bangladesh, including document verification, passport linking, fee payment guidance, and tracking until certificate issuance. Call/WhatsApp: 01798483565.";
  }
  if (lowerMsg.includes("passport")) {
    return "Yes, we provide step-by-step assistance for new e-Passport / MRP applications, renewals, corrections, document preparation, and online appointment booking. Contact Euro Express at 01798483565.";
  }
  if (lowerMsg.includes("online gd") || lowerMsg.includes("general diary")) {
    return "Yes! We can assist you in filing an Online General Diary (Online GD) through the official Bangladesh Police portal for lost passports, NIDs, academic certificates, or mobile phones. Call/WhatsApp: 01798483565.";
  }
  if (lowerMsg.includes("insurance") || lowerMsg.includes("travel insurance")) {
    return "Yes! Euro Express issues embassy-approved international travel and medical insurance policies with minimum €30,000 coverage required for Schengen Europe visas and global travel. Contact: 01798483565.";
  }
  if (lowerMsg.includes("required documents") || lowerMsg.includes("what documents do i need")) {
    return "Standard required documents for visa applications include:\n• Original Passport (valid for 6+ months)\n• Recent 35x45mm photos (white background)\n• NID / Birth Certificate & Utility Bill Copy\n• 6-Month Bank Statement & Solvency Certificate\n• Proof of Profession (Trade License for businessmen, NOC & Pay Slip for jobholders, Student ID for students)\n• Travel Itinerary, Hotel Booking & Travel Insurance.";
  }
  if (lowerMsg.includes("contact") || lowerMsg.includes("location") || lowerMsg.includes("address") || lowerMsg.includes("phone") || lowerMsg.includes("hours")) {
    return "Euro Express Contact Details:\n• 📞 Phone & WhatsApp: 01798483565 / +880 1798-483565\n• 📧 Email: euroexpresstravels65@gmail.com\n• 📍 Office Address: Mirpur Bazar, Bahubal, Hobiganj\n• ⏰ Office Hours: Everyday 9:00 AM – 9:00 PM.";
  }
  return "Welcome to Euro Express! We offer professional assistance for Schengen Visas, Study in Europe/UK, Work Permits, Visit Visas, Air Tickets, Hotel Bookings, Indian Visas, Police Clearance, and Passport Services. Please contact our team at 01798483565 or visit our office at Mirpur Bazar, Bahubal, Hobiganj.";
}

app.post(["/api/chat", "/chat", "/.netlify/functions/server/chat", "/.netlify/functions/server/api/chat"], async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    if (message.length > 2000) {
      res.status(400).json({ error: "Message length exceeds maximum allowable limit (2000 characters)" });
      return;
    }

    // 1. Try Groq AI first
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey) {
      try {
        const groq = new Groq({ apiKey });
        const messages = [{ role: "system", content: SYSTEM_INSTRUCTION }];

        if (Array.isArray(history) && history.length > 0) {
          const safeHistory = history.slice(-10);
          for (const item of safeHistory) {
            if (item.role === "user" || item.role === "assistant" || item.role === "model") {
              const textContent = String(item.content || item.text || "").substring(0, 1000);
              messages.push({
                role: item.role === "model" ? "assistant" : item.role,
                content: textContent,
              });
            }
          }
        }

        messages.push({ role: "user", content: message.trim() });

        const response = await groq.chat.completions.create({
          messages: messages as any,
          model: "qwen/qwen3.8-27b",
          temperature: 0.7,
        });

        const replyText = response.choices[0]?.message?.content;
        if (replyText) {
          res.json({ reply: replyText, response: replyText });
          return;
        }
      } catch (groqError) {
        console.warn("Groq API error in netlify server function, falling back to Gemini:", groqError);
      }
    }

    // 2. Try Gemini AI fallback
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (geminiApiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        let prompt = `${SYSTEM_INSTRUCTION}\n\n`;
        if (Array.isArray(history) && history.length > 0) {
          prompt += "Previous conversation:\n";
          for (const item of history.slice(-6)) {
            const role = item.role === "model" || item.role === "assistant" ? "Assistant" : "User";
            const text = String(item.content || item.text || "").substring(0, 400);
            prompt += `${role}: ${text}\n`;
          }
          prompt += "\n";
        }
        prompt += `User: ${message.trim()}\nAssistant:`;

        const geminiRes = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt
        });

        if (geminiRes.text) {
          res.json({ reply: geminiRes.text, response: geminiRes.text });
          return;
        }
      } catch (geminiError) {
        console.warn("Gemini API error in netlify server function:", geminiError);
      }
    }

    // 3. Fallback to rich knowledge response
    const fallbackReply = getKnowledgeResponse(message);
    res.json({ reply: fallbackReply, response: fallbackReply });
  } catch (error: any) {
    console.error("AI Chat error:", error);
    const fallbackReply = getKnowledgeResponse(req.body?.message || "");
    res.json({ reply: fallbackReply, response: fallbackReply });
  }
});

// Google Reviews Endpoint
app.get(["/api/google-reviews", "/google-reviews", "/.netlify/functions/server/google-reviews", "/.netlify/functions/server/api/google-reviews"], async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: "Google Places API key is not configured" });
    }
    
    const placeId = "ChIJP7ij-8t8PqsRdyBWoqh6tk8"; 
    const detailsUrl = `https://places.googleapis.com/v1/places/${placeId}?fields=id,displayName,rating,userRatingCount,reviews`;
    
    const detailsResponse = await fetch(detailsUrl, {
      method: 'GET',
      headers: {
        'X-Goog-Api-Key': apiKey,
        'Accept-Language': 'en'
      }
    });
    
    const detailsData = await detailsResponse.json();
    const fallbackReviews = [
      { id: '1', name: 'Robiul Islam', rating: 5, comment: '"Highly recommend Euro Express Travels! Their service is incredibly professional, fast, and reliable. They provided...', date: '9 mins ago' },
      { id: '2', name: 'Fokhrul Islam', rating: 5, comment: 'One of the most trusted travel agencies in Sylhet division. Their visa guidance and file processing are 100% genuine and hassle-free. Got my Schengen visa support on time!', date: '1 week ago' },
      { id: '3', name: 'josim roni', rating: 5, comment: 'Best visa processing and travel agency in Habiganj. Very professional, fast service and highly trusted consultancy for Europe and tourist visas. Highly recommended!', date: '1 week ago' }
    ];

    let formattedReviews = fallbackReviews;

    if (detailsData.reviews && detailsData.reviews.length > 0) {
      formattedReviews = detailsData.reviews.map((r: any, idx: number) => {
        let dateText = r.relativePublishTimeDescription;
        if (!dateText && r.publishTime) {
           const d = new Date(r.publishTime);
           dateText = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
        }
        return {
          id: `google_${idx}`,
          name: r.authorAttribution?.displayName || 'Google User',
          rating: r.rating || 5,
          comment: r.text?.text || r.originalText?.text || '',
          date: dateText || 'Recently'
        };
      });
    }

    return res.json({
      reviews: formattedReviews,
      rating: detailsData.rating || 5.0,
      total: detailsData.userRatingCount || 7
    });

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

export const handler = serverless(app);
