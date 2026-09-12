import { NextResponse } from 'next/server';
import { getChatRateLimiter, checkRateLimit } from '@/lib/rateLimit';

interface ChatRequestPayload {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  context?: {
    pathname?: string;
    role?: 'customer' | 'worker' | 'cooperative' | 'admin' | 'guest';
    userName?: string;
    userEmail?: string;
    language?: 'en' | 'hi' | 'bn' | 'mr' | 'ta' | 'te';
    pageTitle?: string;
    pageSummary?: string;
    activeBookingsCount?: number;
  };
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  hi: 'Hindi (हिन्दी)',
  bn: 'Bengali (বাংলা)',
  mr: 'Marathi (मराठी)',
  ta: 'Tamil (தமிழ்)',
  te: 'Telugu (తెలుగు)',
};

export async function POST(req: Request) {
  try {
    // --- Rate Limiting ---
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
    const limiter = getChatRateLimiter();
    const rateResult = await checkRateLimit(limiter, ip);

    if (!rateResult.success) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please slow down.',
          retryAfterMs: rateResult.resetMs,
        },
        { status: 429 }
      );
    }

    const body: ChatRequestPayload = await req.json();
    const { messages = [], context = {} } = body;

    const apiKey = process.env.GROQ_API_KEY?.trim();
    const model = process.env.GROQ_MODEL?.trim() || 'llama-3.3-70b-versatile';

    const currentLang = context.language || 'en';
    const langName = LANGUAGE_NAMES[currentLang] || 'English';
    const userRole = context.role || 'guest';
    const currentPath = context.pathname || '/';

    // If no Groq API Key is supplied yet, provide an intelligent fallback response
    if (!apiKey) {
      return NextResponse.json({
        reply: getFallbackResponse(messages[messages.length - 1]?.content || '', context, currentLang),
        model: 'offline-fallback',
        isFallback: true,
        notice: 'GROQ_API_KEY is not configured in .env.local yet. Running on intelligent context-aware fallback mode.',
      });
    }

    // Build the system prompt with rich ShramNexus knowledge
    const systemPrompt = `You are "ShramNexus Sahayak" (श्रम सहायक), the intelligent, friendly, and empowering AI Personal Assistant & Navigator for the ShramNexus platform.
ShramNexus (Smart India Hackathon project) is India's premier Cooperative-Owned Digital Workforce & Service Marketplace.

=== KEY MISSION & VALUES ===
1. Unlike corporate aggregators (e.g., Urban Company) that take 25-30% cuts and use opaque algorithms:
   - Workers receive an immediate 85% DIRECT PAYOUT.
   - 10% goes directly to the Cooperative Welfare & Tool Bank Fund.
   - 5% is the platform maintenance fee.
   - 1-Worker-1-Vote democratic governance for cooperative members.
2. Verified Artisans: Every worker is desk-verified by their registered local cooperative society.
3. Escrow & Dual OTP Handshake: Customer payments are held in escrow. On job completion, the customer provides a 4-digit OTP from their dashboard to the artisan to release instant payment.
4. Emergency SOS: Instant priority dispatch (/emergency) for electrical hazards, severe plumbing leaks, and urgent repairs.

=== AVAILABLE APP ROUTES & ROLES ===
Guide the user to anywhere they want to go. When recommending a page or action, ALWAYS format the destination as a markdown link using this EXACT syntax: [Action Name](/path)
The UI converts this into an interactive, clickable 1-click navigation button!

Key routes:
- Customer Portal:
  * [Browse All Services](/services) - Explore trades: Plumber, Electrician, Carpenter, Painter, Cleaner, Technician, Driver, Gardener, Caregiver, Domestic Helper.
  * [Emergency SOS Booking](/emergency) - Fast priority dispatch for urgent electrical or water hazards.
  * [Track Active Booking](/track) - Live worker GPS status, ETA, and 4-digit completion OTP.
  * [My Bookings & History](/history) - View all previous and active bookings, receipts, and OTPs.
  * [Customer Profile](/profile) - Manage address, contact info, and preferences.
  * [Home Page](/) - Platform highlights, service search, customer reviews, and cooperative benefits.

- Worker (Artisan) Portal:
  * [Worker Dashboard](/worker-dashboard) - Overview of duty status (Online/Offline), incoming requests, and active jobs.
  * [Incoming & Active Jobs](/jobs) - Accept or decline requests, navigate to client location, and enter completion OTP.
  * [Earnings Passbook](/earnings) - Real-time earnings breakdown (85% net payout, 10% welfare, 5% fee), daily passbook, and instant bank transfer.
  * [Artisan Digital ID & Profile](/worker-profile) - View verified skills, trade badges, QR code, and cooperative society membership.
  * [Worker Registration](/auth/worker-register) - Sign up as a new artisan with trade certification and cooperative affiliation.

- Cooperative Society Portal:
  * [Cooperative Society Portal](/cooperative) - Desk verification of new artisans, tool bank inventory management, district dispatch clusters, welfare fund overview, and democratic voting.

- Federation & Admin:
  * [Admin Dashboard](/admin) - Statutory audit logs, dispute resolution, service categories, and support tickets.
  * [Login / Switch Account](/auth/login) - Sign in as Customer, Worker, Cooperative Society Admin, or Federation Admin.

=== CURRENT USER CONTEXT ===
- Pathname: ${currentPath}
- Active User Role: ${userRole.toUpperCase()}
- User Name: ${context.userName || 'Valued User'}
- Page Title: ${context.pageTitle || 'Current Page'}
- Page Context / Purpose: ${context.pageSummary || 'Browsing ShramNexus platform'}
- Active Bookings Count: ${context.activeBookingsCount ?? 0}
- Preferred Language: ${langName} (${currentLang})

=== CRITICAL BEHAVIOR GUIDELINES ===
1. TONE: Warm, respectful, helpful, concise, and empowering. Speak like a knowledgeable, polite local guide.
2. LANGUAGE: You MUST respond in ${langName} (${currentLang}). If the user asks in another Indian language, respond fluently in that language.
3. CONTEXT AWARENESS: Use the user's current route and role to give hyper-relevant advice. If they are on a worker route, speak with solidarity for artisans. If on customer routes, help them book and track. If on cooperative, guide verification.
4. NAVIGATION BUTTONS: Always include 1 to 3 clickable markdown links [Action Name](/path) in your response so the user can navigate immediately in 1 click!
5. CONCISENESS: Keep answers clear, well-structured with short bullet points, and avoid walls of text.
6. CLEAN FORMATTING: Use simple standard markdown bullets ('- **Term:** Description'). Never output unclosed asterisks or awkward syntax.`;

    // Format chat messages
    const formattedMessages = messages.map((m) => ({
      role: m.role === 'system' ? 'system' : m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

    // Candidate models in priority order
    const candidateModels = Array.from(
      new Set([
        model,
        'groq/compound-mini',
        'openai/gpt-oss-120b',
        'qwen/qwen3.6-27b',
        'llama-3.3-70b-versatile',
      ])
    );

    let groqResponse: Response | null = null;
    let selectedModel = model;

    for (const candidate of candidateModels) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: candidate,
            messages: [
              { role: 'system', content: systemPrompt },
              ...formattedMessages,
            ],
            temperature: 0.6,
            max_tokens: 1024,
          }),
        });

        if (res.ok) {
          groqResponse = res;
          selectedModel = candidate;
          break;
        } else if (res.status === 404) {
          // Model not found on this account tier, try next candidate
          continue;
        } else {
          // Other error (e.g. 401 invalid key, rate limit)
          groqResponse = res;
          break;
        }
      } catch (e) {
        console.warn(`Attempt failed for model ${candidate}:`, e);
      }
    }

    if (!groqResponse || !groqResponse.ok) {
      const errorText = groqResponse ? await groqResponse.text() : 'No response from Groq';
      console.error('Groq API Error:', groqResponse?.status, errorText);

      return NextResponse.json({
        reply: getFallbackResponse(
          messages[messages.length - 1]?.content || '',
          context,
          currentLang,
          `Groq API note: ${groqResponse?.status || 'network'}. Using intelligent fallback.`
        ),
        model: 'fallback-on-error',
        isFallback: true,
      });
    }

    const data = await groqResponse.json();
    let reply = data.choices?.[0]?.message?.content || 'I am ready to help you navigate ShramNexus!';

    // Strip reasoning think tags if generated by any reasoning models
    reply = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    return NextResponse.json({
      reply,
      model: selectedModel,
      isFallback: false,
    });
  } catch (error: any) {
    console.error('Chat API Handler Exception:', error);
    return NextResponse.json(
      {
        reply: 'I encountered a brief connection error, but I am here to help! You can explore services, track bookings, or check your dashboard using the quick buttons below:\n\n- [Browse All Services](/services)\n- [Emergency SOS](/emergency)\n- [Worker Dashboard](/worker-dashboard)',
        isFallback: true,
        error: error?.message || 'Internal Server Error',
      },
      { status: 200 }
    );
  }
}

/**
 * Intelligent context-aware fallback generator when GROQ_API_KEY is not yet added
 */
function getFallbackResponse(
  query: string,
  context: any,
  lang: string,
  extraNote?: string
): string {
  const q = query.toLowerCase();
  const path = context?.pathname || '/';
  const role = context?.role || 'guest';

  // Check language-specific greetings
  const greetings: Record<string, string> = {
    en: 'Namaste! I am your **ShramNexus Sahayak**.',
    hi: 'नमस्ते! मैं आपका **श्रमनेक्सस सहायक (ShramNexus Sahayak)** हूँ।',
    bn: 'নমস্কার! আমি আপনার **শ্রমনেক্সাস সহায়ক (ShramNexus Sahayak)**।',
    mr: 'नमस्ते! मी आपला **श्रमनेक्सस सहायक (ShramNexus Sahayak)** आहे.',
    ta: 'வணக்கம்! நான் உங்கள் **ஷ்ரம்நெக்ஸஸ் உதவியாளர் (ShramNexus Sahayak)**.',
    te: 'నమస్కారం! నేను మీ **శ్రమ్‌నెక్సస్ సహాయక్ (ShramNexus Sahayak)**.',
  };

  const greeting = greetings[lang] || greetings.en;

  // Specific intents
  if (q.includes('otp') || q.includes('complete') || q.includes('code')) {
    if (lang === 'hi') {
      return `${greeting}\n\n**OTP सत्यापन कैसे काम करता है:**\n1. जब आप कोई सेवा बुक करते हैं, तो 4-अंकों का सुरक्षित OTP आपके ट्रैकिंग डैशबोर्ड पर दिखाई देता है।\n2. काम पूरा होने के बाद, यह OTP कारीगर (Worker) को दें।\n3. कारीगर द्वारा OTP दर्ज करने पर ही भुगतान (85% सीधा कारीगर को) सुरक्षित एस्क्रो से जारी होता है।\n\n- [अपनी बुकिंग व OTP देखें](/history)\n- [लाइव ट्रैकिंग खोलें](/track)`;
    }
    if (lang === 'bn') {
      return `${greeting}\n\n**OTP যাচাইকরণ প্রক্রিয়া:**\n1. বুকিং করার পর ৪-সংখ্যার নিরাপদ OTP আপনার ট্র্যাকিং ড্যাশবোর্ডে দেখা যাবে।\n2. কাজ শেষ হলে এই OTP কারিগরকে দিন।\n3. কারিগর OTP জমা দিলেই সাথে সাথে ৮৫% পেমেন্ট রিলিজ হবে।\n\n- [আপনার বুকিং ও OTP দেখুন](/history)\n- [লাইভ ট্র্যাকিং খুলুন](/track)`;
    }
    return `${greeting}\n\n**How OTP Handshake Works:**\n1. When you book a service, a secure **4-digit completion OTP** is generated on your tracking dashboard.\n2. Once the artisan completes the physical job, share this OTP with them.\n3. The artisan enters the OTP in their portal to instantly release their 85% direct payout from escrow!\n\n- [View Active Bookings & OTP](/history)\n- [Track Live Service](/track)`;
  }

  if (q.includes('payout') || q.includes('earning') || q.includes('money') || q.includes('commission') || q.includes('split')) {
    if (lang === 'hi') {
      return `${greeting}\n\n**श्रमनेक्सस की पारदर्शी 85/10/5 आय व्यवस्था:**\n- **85% सीधी कमाई:** सीधे कारीगर के बैंक खाते में बिना किसी बिचौलिए के।\n- **10% कल्याण कोष (Welfare & Tool Bank):** औजार, बीमा और पेंशन सहायता के लिए।\n- **5% रखरखाव शुल्क:** केवल डिजिटल प्लेटफॉर्म और सर्वर चलाने के लिए।\n\n- [कारीगर कमाई पासबुक देखें](/earnings)\n- [कारीगर डैशबोर्ड](/worker-dashboard)`;
    }
    return `${greeting}\n\n**ShramNexus Fair Revenue Split (85 / 10 / 5):**\n- **85% Direct Worker Payout:** Transferred immediately upon job OTP completion.\n- **10% Cooperative Welfare Fund:** Directly allocated for worker emergency relief, tool banks, and skill development.\n- **5% Platform Maintenance:** Transparent, minimal fee to run the digital platform.\n\n- [Open Earnings Passbook](/earnings)\n- [Go to Worker Dashboard](/worker-dashboard)`;
  }

  if (q.includes('emergency') || q.includes('urgent') || q.includes('sos') || q.includes('fire') || q.includes('leak')) {
    return `${greeting}\n\n🚨 **Emergency Priority Dispatch:**\nFor rapid assistance with electrical short circuits, major pipe bursts, or gas leaks, use our dedicated SOS flow.\n\n- [Launch Emergency SOS Booking](/emergency)\n- [Browse All Emergency Trades](/services)`;
  }

  if (q.includes('cooperative') || q.includes('society') || q.includes('verify') || q.includes('desk') || q.includes('tool')) {
    return `${greeting}\n\n🏢 **Cooperative Society Desk:**\nCooperative administrators can verify artisan registrations, approve skill badges, manage the shared tool bank, and monitor the district welfare balance.\n\n- [Open Cooperative Portal](/cooperative)\n- [Worker Registration](/auth/worker-register)`;
  }

  if (q.includes('where am i') || q.includes('what can i do') || q.includes('current page') || q.includes('help')) {
    return `${greeting}\n\n📍 **Current Location:** \`${path}\`\n👤 **Role:** **${role.toUpperCase()}**\n\nHere is how I can guide you:\n- If you need household services: [Browse 10 Verified Trades](/services)\n- If you need immediate help: [Emergency SOS](/emergency)\n- For artisans: [Worker Dashboard](/worker-dashboard) & [Check Earnings](/earnings)\n- For societies: [Cooperative Admin Desk](/cooperative)\n\n*(Tip: Add your \`GROQ_API_KEY\` to \`.env.local\` to enable conversational AI with Meta Llama 3.3 70B!)*`;
  }

  // Default helpful navigator response
  return `${greeting}\n\nI can help you navigate any part of ShramNexus, answer questions about bookings, emergency services, cooperative verification, or worker earnings.\n\nWhere would you like to go?\n- [Browse All 10 Services](/services)\n- [Emergency SOS Dispatch](/emergency)\n- [Track Active Order & View OTP](/track)\n- [Worker Jobs & Dashboard](/worker-dashboard)\n- [Cooperative Society Portal](/cooperative)\n\n*(Note: To unlock conversational AI with Groq, set your \`GROQ_API_KEY\` in \`.env.local\`)*`;
}
