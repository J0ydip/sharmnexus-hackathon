'use client';

import { useState, useEffect } from 'react';

export type CustomerLanguage = 'en' | 'hi' | 'bn' | 'mr' | 'ta' | 'te';

export interface CategoryItem {
  id: string;
  price: number;
  icon: string;
  names: Record<CustomerLanguage, string>;
}

export interface RecommendedWorker {
  name: string;
  skill: string;
  exp: number;
  rating: number;
  jobs: number;
  dist: number;
  society: string;
  match: number;
  img: string;
}

export const categoriesData = [
      { id: 'Plumber', price: 300, icon: 'droplet', names: { 
        en: 'Plumber', hi: 'प्लम्बर', bn: 'প্লাম্বার', mr: 'प्लंबर', ta: 'பிளம்பர்', te: 'ప్లంబర్' 
      } },
      { id: 'Electrician', price: 350, icon: 'zap', names: { 
        en: 'Electrician', hi: 'इलेक्ट्रीशियन', bn: 'ইলেকট্রিশিয়ান', mr: 'इलेक्ट्रिशियन', ta: 'எலக்ட்ரீஷியன்', te: 'ఎలక్ట్రీషియన్' 
      } },
      { id: 'Carpenter', price: 400, icon: 'hammer', names: { 
        en: 'Carpenter', hi: 'बढ़ई', bn: 'ছুতোর', mr: 'सुतार', ta: 'தச்சர்', te: 'వడ్రంగి' 
      } },
      { id: 'Painter', price: 500, icon: 'paintbrush', names: { 
        en: 'Painter', hi: 'पेंटर', bn: 'রংমিস্ত্রি', mr: 'पेंटर', ta: 'பெயிண்டர்', te: 'పెయింటర్' 
      } },
      { id: 'Cleaner', price: 250, icon: 'sparkles', names: { 
        en: 'Cleaner', hi: 'सफाई', bn: 'পরিচ্ছন্নতাকর্মী', mr: 'सफाई कामगार', ta: 'துப்புரவாளர்', te: 'క్లీనర్' 
      } },
      { id: 'Technician', price: 450, icon: 'wrench', names: { 
        en: 'Technician', hi: 'तकनीशियन', bn: 'টেকনিশিয়ান', mr: 'तंत्रज्ञ', ta: 'தொழில்நுட்ப வல்லுநர்', te: 'టెక్నీషియన్' 
      } },
      { id: 'Driver', price: 300, icon: 'car', names: { 
        en: 'Driver', hi: 'ड्राइवर', bn: 'ড্রাইভার', mr: 'चालक', ta: 'டிரைவர்', te: 'డ్రైవర్' 
      } },
      { id: 'Gardener', price: 200, icon: 'leaf', names: { 
        en: 'Gardener', hi: 'माली', bn: 'মালী', mr: 'माळी', ta: 'தோட்டக்காரர்', te: 'తోటమాలి' 
      } },
      { id: 'Caregiver', price: 600, icon: 'heart', names: { 
        en: 'Caregiver', hi: 'देखभाल', bn: 'কেয়ারগিভার', mr: 'काळजीवाहू', ta: 'பராமரிப்பாளர்', te: 'సంరక్షకుడు' 
      } },
      { id: 'Domestic Helper', price: 250, icon: 'home', names: { 
        en: 'Domestic Helper', hi: 'घरेलू सहायक', bn: 'গৃহকর্মী', mr: 'घरगुती मदतनीस', ta: 'வீட்டு உதவியாளர்', te: 'ఇంటి సహాయకుడు' 
      } }
    ];

export const workersData = [
      {
        name: 'Rajesh Kumar', skill: 'Plumber', exp: 8, rating: 4.8, jobs: 126, dist: 2.4,
        society: 'Patna District Labour Society', match: 94,
        img: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80'
      },
      {
        name: 'Priya Das', skill: 'Electrician', exp: 6, rating: 4.9, jobs: 98, dist: 3.1,
        society: 'Patna District Labour Society', match: 92,
        img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'
      },
      {
        name: 'Dr. Anita Rao', skill: 'Caregiver', exp: 6, rating: 5.0, jobs: 72, dist: 2.2,
        society: 'Bangalore Artisans Cooperative', match: 96,
        img: 'https://images.unsplash.com/photo-1594824813583-0599a0709f19?w=400&auto=format&fit=crop&q=80'
      }
    ];

export const translations = {
      en: {
        navHome: "Home", navServices: "Services", navBooking: "Booking Flow", navTracker: "Status Tracker", navSOS: "⚡ Emergency SOS",
        badge: "Cooperative-Owned Verified Gig Workforce",
        heroTitle: "ShramNexus",
        heroSub: "A story of verified craftsmanship.\nCooperative-Owned Gig Workforce.",
        searchPlaceholder: "What service do you need today?",
        bookBtn: "Book Service",
        activeBadge: "Active Request", activeStatus: "Worker Assigned", activeTrack: "Track Live Status →",
        activeTitle: "Plumber • Booking SN-2026-8941",
        activeDesc: "Assigned to Rajesh Kumar (Patna District Labour Society)",
        tradesTitle: "10 Verified Trades", recommendedTitle: "Recommended Verified Craftsmen", viewAll: "View All ↗",
        recomAlgo: "SIH 26089 Algorithm",
        
        // Services tab
        servPageTitle: "All 10 Cooperative Service Trades",
        servPageSub: "Browse trade rates, background certifications, and instant booking.",
        baseText: "base",
        bookServiceBtn: "Book Service",
        verifiedBadge: "✓ Verified",
        bookNowBtn: "Book Now",

        // Booking flow
        bookingFlowTitle: "Service Booking Journey",
        stepPill1: "1. Request Form", stepPill2: "2. Match Workers", stepPill3: "3. Confirmation",
        reqFormHeading: "1. Tell us what you need",
        lblSelService: "Selected Service",
        lblProbDesc: "Problem Description",
        lblServAddr: "Service Address",
        lblUrgency: "Urgency",
        urgNormal: "Normal (Base Rate)", urgUrgent: "Urgent (+25%)", urgEmergency: "Emergency (1.5x)",
        btnFindWorkers: "Find Verified Workers →",
        transAlgoBadge: "Transparent Matching Algorithm",
        matchHeading: "Verified Plumbers Near You (Ranked by Fair Allocation)",
        matchSub: "Skills (35%), Proximity (20%), Availability (15%), Rating (10%), Workload (10%), Fairness (10%)",
        selectAndConfirm: "Select & Confirm",
        confirmDetailsTitle: "Confirm Your Booking Details",
        confLblService: "Service:", confLblWorker: "Assigned Worker:", confLblAddr: "Address:", confLblPrice: "Total Price:",
        btnConfirmOrder: "Confirm Booking & Generate Order",
        successTitle: "Booking Confirmed!",
        successIdText: "Booking ID: SN-2026-8941 | OTP Code: 4829",
        btnDownloadSlip: "📄 Download Slip",
        btnTrackTimeline: "Track Live Status Timeline →",
        btnReturnDash: "Return to Dashboard",

        // Tracker tab
        trackHeaderTitle: "Booking Status: SN-2026-8941",
        trackHeaderSub: "Assigned Craftsman: Rajesh Kumar (Patna District Labour Society)",
        btnSimulateStatus: "Simulate Next Status",
        trackProgressionTitle: "SIH 26089 Status Progression",
        tstep1: "1. Requested ✓ (Broadcasted to cooperative network)",
        tstep2: "2. Assigned ✓ (Worker assigned by society)",
        tstep3: "3. Accepted (Worker confirmed appointment)",
        tstep4: "4. On the Way / Started (Worker en route)",
        tstep5: "5. Completed & Verified by OTP",
        secVerifyTitle: "Security Verification",
        secOtpLbl: "SHARE OTP ON ARRIVAL",
        secPhoneLbl: "Worker Phone:",

        // SOS tab
        sosBadgeLbl: "⚡ Immediate SOS Dispatch",
        sosTitle: "Emergency Service Dispatch",
        sosSub: "15–25 minute guaranteed arrival with 1.5x emergency rate.",
        sosBoxTitle: "Need Immediate Emergency Plumber / Electrician?",
        sosPlumberTitle: "Emergency Plumber",
        sosPlumberEta: "ETA: ~15 mins • 2.4 km away",
        sosElecTitle: "Emergency Electrician",
        sosElecEta: "ETA: ~20 mins • 3.1 km away",
        sosDispatch: "Dispatch Now",

        footerText: "ShramNexus © 2026. Built for SIH Problem Statement 26089 (Cooperative Gig Services Platform)."
      },
      hi: {
        navHome: "होम", navServices: "सेवाएं", navBooking: "बुकिंग", navTracker: "ट्रैकर", navSOS: "⚡ आपातकालीन SOS",
        badge: "सहकारी-स्वामित्व वाली सत्यापित कार्यबल",
        heroTitle: "श्रमनेक्सस",
        heroSub: "सत्यापित शिल्प कौशल की एक कहानी।\nसहकारी-स्वामित्व वाला कार्यबल।",
        searchPlaceholder: "आज आपको किस सेवा की आवश्यकता है?",
        bookBtn: "सेवा बुक करें",
        activeBadge: "सक्रिय अनुरोध", activeStatus: "कार्यकर्ता नियुक्त", activeTrack: "लाइव स्थिति देखें →",
        activeTitle: "प्लंबर • बुकिंग SN-2026-8941",
        activeDesc: "राजेश कुमार को सौंपा गया (पटना जिला श्रम सोसायटी)",
        tradesTitle: "10 सत्यापित ट्रेड्स", recommendedTitle: "अनुशंसित सत्यापित कारीगर", viewAll: "सभी देखें ↗",
        recomAlgo: "SIH 26089 एल्गोरिथम",

        servPageTitle: "सभी 10 सहकारी सेवा ट्रेड्स",
        servPageSub: "ट्रेड दरें, पृष्ठभूमि प्रमाणपत्र और त्वरित बुकिंग ब्राउज़ करें।",
        baseText: "मूल",
        bookServiceBtn: "सेवा बुक करें",
        verifiedBadge: "✓ सत्यापित",
        bookNowBtn: "अभी बुक करें",

        bookingFlowTitle: "सेवा बुकिंग प्रक्रिया",
        stepPill1: "1. अनुरोध फॉर्म", stepPill2: "2. मिलान कार्यकर्ता", stepPill3: "3. पुष्टि",
        reqFormHeading: "1. हमें बताएं कि आपको क्या चाहिए",
        lblSelService: "चयनित सेवा",
        lblProbDesc: "समस्या का विवरण",
        lblServAddr: "सेवा का पता",
        lblUrgency: "प्राथमिकता (अत्यावश्यकता)",
        urgNormal: "सामान्य (मूल दर)", urgUrgent: "तत्काल (+25%)", urgEmergency: "आपातकालीन (1.5x)",
        btnFindWorkers: "सत्यापित कार्यकर्ता खोजें →",
        transAlgoBadge: "पारदर्शी मिलान एल्गोरिथम",
        matchHeading: "आपके निकट सत्यापित प्लंबर (निष्पक्ष आवंटन द्वारा)",
        matchSub: "कौशल (35%), निकटता (20%), उपलब्धता (15%), रेटिंग (10%), कार्यभार (10%), निष्पक्षता (10%)",
        selectAndConfirm: "चुनें और पुष्टि करें",
        confirmDetailsTitle: "अपने बुकिंग विवरण की पुष्टि करें",
        confLblService: "सेवा:", confLblWorker: "नियुक्त कार्यकर्ता:", confLblAddr: "पता:", confLblPrice: "कुल मूल्य:",
        btnConfirmOrder: "बुकिंग की पुष्टि करें और ऑर्डर जेनरेट करें",
        successTitle: "बुकिंग की पुष्टि हो गई!",
        successIdText: "बुकिंग आईडी: SN-2026-8941 | ओटीपी कोड: 4829",
        btnDownloadSlip: "📄 रसीद डाउनलोड करें",
        btnTrackTimeline: "लाइव स्थिति समयरेखा ट्रैक करें →",
        btnReturnDash: "डैशबोर्ड पर लौटें",

        trackHeaderTitle: "बुकिंग स्थिति: SN-2026-8941",
        trackHeaderSub: "नियुक्त कारीगर: राजेश कुमार (पटना जिला श्रम सोसायटी)",
        btnSimulateStatus: "अगली स्थिति सिमुलेट करें",
        trackProgressionTitle: "SIH 26089 स्थिति प्रगति",
        tstep1: "1. अनुरोध किया गया ✓ (सहकारी नेटवर्क पर प्रसारित)",
        tstep2: "2. नियुक्त ✓ (सोसायटी द्वारा कार्यकर्ता नियुक्त)",
        tstep3: "3. स्वीकृत (कार्यकर्ता ने अपॉइंटमेंट की पुष्टि की)",
        tstep4: "4. रास्ते में / शुरू हो गया (कार्यकर्ता रास्ते में)",
        tstep5: "5. पूर्ण और ओटीपी द्वारा सत्यापित",
        secVerifyTitle: "सुरक्षा सत्यापन",
        secOtpLbl: "आगमन पर ओटीपी साझा करें",
        secPhoneLbl: "कार्यकर्ता फोन:",

        sosBadgeLbl: "⚡ तत्काल SOS प्रेषण",
        sosTitle: "आपातकालीन सेवा प्रेषण",
        sosSub: "1.5x आपातकालीन दर के साथ 15-25 मिनट में गारंटीड आगमन।",
        sosBoxTitle: "तत्काल आपातकालीन प्लंबर / इलेक्ट्रीशियन चाहिए?",
        sosPlumberTitle: "आपातकालीन प्लंबर",
        sosPlumberEta: "ETA: ~15 मिनट • 2.4 किमी दूर",
        sosElecTitle: "आपातकालीन इलेक्ट्रीशियन",
        sosElecEta: "ETA: ~20 मिनट • 3.1 किमी दूर",
        sosDispatch: "अभी प्रेषित करें",

        footerText: "श्रमनेक्सस © 2026. SIH समस्या विवरण 26089 (सहकारी गिग सर्विसेज प्लेटफॉर्म) के लिए निर्मित।"
      },
      bn: {
        navHome: "হোম", navServices: "সেবাসমূহ", navBooking: "বুকিং", navTracker: "ট্র্যাকার", navSOS: "⚡ জরুরি এসওএস",
        badge: "সমবায়-মালিকানাধীন যাচাইকৃত গিগ কর্মী",
        heroTitle: "শর্মনেক্সাস",
        heroSub: "যাচাইকৃত কারুকার্যের গল্প।\nসমবায়-মালিকানাধীন গিগ কর্মী।",
        searchPlaceholder: "আজ আপনার কোন সেবার প্রয়োজন?",
        bookBtn: "সেবা বুক করুন",
        activeBadge: "চলমান অনুরোধ", activeStatus: "কর্মী নিযুক্ত", activeTrack: "লাইভ স্ট্যাটাস দেখুন →",
        activeTitle: "প্লাম্বার • বুকিং SN-2026-8941",
        activeDesc: "রাজেশ কুমারের কাছে নির্ধারিত (পাটনা জেলা লেবার সোসাইটি)",
        tradesTitle: "১০টি যাচাইকৃত ট্রেড", recommendedTitle: "সুপারিশকৃত দক্ষ কারিগর", viewAll: "সব দেখুন ↗",
        recomAlgo: "SIH 26089 অ্যালগরিদম",

        servPageTitle: "সমস্ত ১০টি সমবায় সেবা ট্রেড",
        servPageSub: "ট্রেডের হার, ব্যাকগ্রাউন্ড সার্টিফিকেশন এবং তাত্ক্ষণিক বুকিং ব্রাউজ করুন।",
        baseText: "মূল",
        bookServiceBtn: "সেবা বুক করুন",
        verifiedBadge: "✓ যাচাইকৃত",
        bookNowBtn: "এখনই বুক করুন",

        bookingFlowTitle: "সেবা বুকিং প্রক্রিয়া",
        stepPill1: "1. অনুরোধ ফর্ম", stepPill2: "2. কর্মী মিল", stepPill3: "3. নিশ্চিতকরণ",
        reqFormHeading: "1. আপনার কী প্রয়োজন তা আমাদের জানান",
        lblSelService: "নির্বাচিত সেবা",
        lblProbDesc: "সমস্যার বিবরণ",
        lblServAddr: "সেবার ঠিকানা",
        lblUrgency: "জরুরী অবস্থা",
        urgNormal: "সাধারণ (মূল হার)", urgUrgent: "জরুরী (+25%)", urgEmergency: "জরুরীকালীন (1.5x)",
        btnFindWorkers: "যাচাইকৃত কর্মী খুঁজুন →",
        transAlgoBadge: "স্বচ্ছ ম্যাচিং অ্যালগরিদম",
        matchHeading: "আপনার কাছাকাছি যাচাইকৃত প্লাম্বার (ন্যায্য বরাদ্দের ভিত্তিতে)",
        matchSub: "দক্ষতা (35%), দূরত্ব (20%), প্রাপ্যতা (15%), রেটিং (10%), কাজের চাপ (10%), ন্যায্যতা (10%)",
        selectAndConfirm: "নির্বাচন করুন এবং নিশ্চিত করুন",
        confirmDetailsTitle: "আপনার বুকিং বিবরণ নিশ্চিত করুন",
        confLblService: "সেবা:", confLblWorker: "নিযুক্ত কর্মী:", confLblAddr: "ঠিকানা:", confLblPrice: "মোট মূল্য:",
        btnConfirmOrder: "বুকিং নিশ্চিত করুন এবং অর্ডার তৈরি করুন",
        successTitle: "বুকিং নিশ্চিত হয়েছে!",
        successIdText: "বুকিং আইডি: SN-2026-8941 | ওটিপি কোড: 4829",
        btnDownloadSlip: "📄 রসিদ ডাউনলোড করুন",
        btnTrackTimeline: "লাইভ স্ট্যাটাস টাইমলাইন ট্র্যাক করুন →",
        btnReturnDash: "ড্যাশবোর্ডে ফিরে যান",

        trackHeaderTitle: "বুকিং স্ট্যাটাস: SN-2026-8941",
        trackHeaderSub: "নিযুক্ত কারিগর: রাজেশ কুমার (পাটনা জেলা লেবার সোসাইটি)",
        btnSimulateStatus: "পরবর্তী স্ট্যাটাস সিমুলেট করুন",
        trackProgressionTitle: "SIH 26089 স্ট্যাটাস অগ্রগতি",
        tstep1: "1. অনুরোধ করা হয়েছে ✓ (সমবায় নেটওয়ার্কে সম্প্রচারিত)",
        tstep2: "2. নির্ধারিত ✓ (সোসাইটি দ্বারা কর্মী নির্ধারিত)",
        tstep3: "3. গৃহীত (কর্মী অ্যাপয়েন্টমেন্ট নিশ্চিত করেছেন)",
        tstep4: "4. পথে আছে / শুরু হয়েছে (কর্মী যাতায়াত করছেন)",
        tstep5: "5. সম্পূর্ণ এবং ওটিপি দ্বারা যাচাইকৃত",
        secVerifyTitle: "নিরাপত্তা যাচাইকরণ",
        secOtpLbl: "আগমনকালে ওটিপি শেয়ার করুন",
        secPhoneLbl: "কর্মীর ফোন:",

        sosBadgeLbl: "⚡ তাত্ক্ষণিক SOS প্রেরণ",
        sosTitle: "জরুরি সেবা প্রেরণ",
        sosSub: "1.5x জরুরি হারে 15-25 মিনিটের মধ্যে নিশ্চিত আগমন।",
        sosBoxTitle: "জরুরি প্লাম্বার / ইলেকট্রিশিয়ান প্রয়োজন?",
        sosPlumberTitle: "জরুরি প্লাম্বার",
        sosPlumberEta: "ETA: ~15 মিনিট • 2.4 কিমি দূরে",
        sosElecTitle: "জরুরি ইলেকট্রিশিয়ান",
        sosElecEta: "ETA: ~20 মিনিট • 3.1 কিমি দূরে",
        sosDispatch: "এখনই প্রেরণ করুন",

        footerText: "শর্মনেক্সাস © 2026. SIH সমস্যা বিবৃতি 26089 (কোঅপারেটিভ গিগ সার্ভিসেস প্ল্যাটফর্ম) এর জন্য নির্মিত।"
      },
      mr: {
        navHome: "मुख्यपृष्ठ", navServices: "सेवा", navBooking: "बुकिंग", navTracker: "ट्रॅकर", navSOS: "⚡ आपत्कालीन SOS",
        badge: "सहकारी-मालकीचे पडताळणी केलेले कर्मचारी",
        heroTitle: "श्रमनेक्सस",
        heroSub: "पडताळणी केलेल्या कारागिरीची कथा.\nसहकारी मालकीचे कामगार.",
        searchPlaceholder: "आज तुम्हाला कोणत्या सेवेची आवश्यकता आहे?",
        bookBtn: "सेवा बुक करा",
        activeBadge: "सक्रिय विनंती", activeStatus: "कर्मचारी नियुक्त", activeTrack: "स्थिती ट्रॅक करा →",
        activeTitle: "प्लंबर • बुकिंग SN-2026-8941",
        activeDesc: "राजेश कुमार यांना नेमले (पाटणा जिल्हा श्रम सोसायटी)",
        tradesTitle: "१० पडताळणी केलेले ट्रेड्स", recommendedTitle: "शिफारस केलेले कारागीर", viewAll: "सर्व पहा ↗",
        recomAlgo: "SIH 26089 अल्गोरिदम",

        servPageTitle: "सर्व १० सहकारी सेवा ट्रेड्स",
        servPageSub: "ट्रेड दर, पार्श्वभूमी प्रमाणपत्रे आणि त्वरित बुकिंग ब्राउझ करा.",
        baseText: "मूळ",
        bookServiceBtn: "सेवा बुक करा",
        verifiedBadge: "✓ पडताळणी केली",
        bookNowBtn: "आत्ता बुक करा",

        bookingFlowTitle: "सेवा बुकिंग प्रक्रिया",
        stepPill1: "1. विनंती फॉर्म", stepPill2: "2. कामगार जुळणी", stepPill3: "3. पुष्टीकरण",
        reqFormHeading: "1. तुम्हाला काय हवे आहे ते आम्हाला सांगा",
        lblSelService: "निवडलेली सेवा",
        lblProbDesc: "समस्येचे वर्णन",
        lblServAddr: "सेवेचा पत्ता",
        lblUrgency: "तातडीची वेळ",
        urgNormal: "सामान्य (मूळ दर)", urgUrgent: "तातडीचे (+25%)", urgEmergency: "आपत्कालीन (1.5x)",
        btnFindWorkers: "पडताळणी केलेले कामगार शोधा →",
        transAlgoBadge: "पारदर्शक जुळणी अल्गोरिदम",
        matchHeading: "तुमच्या जवळील पडताळणी केलेले प्लंबर",
        matchSub: "कौशल्य (35%), अंतर (20%), उपलब्धता (15%), रेटिंग (10%), कामाचा भार (10%), निष्पक्षता (10%)",
        selectAndConfirm: "निवडा आणि पुष्टी करा",
        confirmDetailsTitle: "तुमच्या बुकिंग तपशीलाची पुष्टी करा",
        confLblService: "सेवा:", confLblWorker: "नियुक्त कामगार:", confLblAddr: "पत्ता:", confLblPrice: "एकूण किंमत:",
        btnConfirmOrder: "बुकिंग पुष्टी करा आणि ऑर्डर तयार करा",
        successTitle: "बुकिंग पुष्टी झाली!",
        successIdText: "बुकिंग आयडी: SN-2026-8941 | ओटीपी कोड: 4829",
        btnDownloadSlip: "📄 पावती डाउनलोड करा",
        btnTrackTimeline: "थेट स्थिती ट्रॅक करा →",
        btnReturnDash: "डॅशबोर्डवर परतजा",

        trackHeaderTitle: "बुकिंग स्थिती: SN-2026-8941",
        trackHeaderSub: "नियुक्त कारागीर: राजेश कुमार (पाटणा जिल्हा श्रम सोसायटी)",
        btnSimulateStatus: "पुढील स्थिती सि्युलेट करा",
        trackProgressionTitle: "SIH 26089 स्थिती प्रगती",
        tstep1: "1. विनंती केली ✓ (सहकारी नेटवर्कवर प्रसारित)",
        tstep2: "2. नेमले ✓ (सोसायटीद्वारे कामगार नेमला)",
        tstep3: "3. स्वीकारले (कामगाराने भेटीची पुष्टी केली)",
        tstep4: "4. वाटेत / सुरू झाले (कामगार प्रवासात)",
        tstep5: "5. पूर्ण आणि ओटीपी द्वारे पडताळणी",
        secVerifyTitle: "सुरक्षा पडताळणी",
        secOtpLbl: "आगमनवर ओटीपी सामायिक करा",
        secPhoneLbl: "कामगाराचा फोन:",

        sosBadgeLbl: "⚡ त्वरित SOS प्रेषण",
        sosTitle: "आपत्कालीन सेवा प्रेषण",
        sosSub: "1.5x आपत्कालीन दरासह 15-25 मिनिटांत हमीचे आगमन.",
        sosBoxTitle: "तातडीचे प्लंबर / इलेक्ट्रीशियन हवे आहेत का?",
        sosPlumberTitle: "आपत्कालीन प्लंबर",
        sosPlumberEta: "ETA: ~15 मिनिटे • 2.4 किमी दूर",
        sosElecTitle: "आपत्कालीन इलेक्ट्रीशियन",
        sosElecEta: "ETA: ~20 मिनिटे • 3.1 किमी दूर",
        sosDispatch: "आत्ता पाठवा",

        footerText: "श्रमनेक्सस © 2026. SIH समस्या विधान 26089 (सहकारी गिग सर्व्हिसेस प्लॅटफॉर्म) साठी तयार केलेले."
      },
      ta: {
        navHome: "முகப்பு", navServices: "சேவைகள்", navBooking: "முன்பதிவு", navTracker: "கண்காணிப்பு", navSOS: "⚡ அவசர SOS",
        badge: "கூட்டுறவு ஆதரவு சரிபார்க்கப்பட்ட தொழிலாளர்கள்",
        heroTitle: "ஷர்ம்நெக்ஸஸ்",
        heroSub: "சரிபார்க்கப்பட்ட கைவினைத்திறனின் கதை.\nகூட்டுறவு கிக் பணியாளர்கள்.",
        searchPlaceholder: "இன்று உங்களுக்கு என்ன சேவை தேவை?",
        bookBtn: "சேவை முன்பதிவு",
        activeBadge: "செயலில் உள்ள கோரிக்கை", activeStatus: "பணியாளர் நியமனம்", activeTrack: "நிலையை கண்காணிக்கவும் →",
        activeTitle: "பிளம்பர் • முன்பதிவு SN-2026-8941",
        activeDesc: "ராஜேஷ் குமார் ஒதுக்கப்பட்டுள்ளார் (பாட்னா மாவட்ட தொழிலாளர் சங்கம்)",
        tradesTitle: "10 சரிபார்க்கப்பட்ட தொழில்கள்", recommendedTitle: "பரிந்துரைக்கப்பட்ட கைவினைஞர்கள்", viewAll: "அனைத்தையும் காண்க ↗",
        recomAlgo: "SIH 26089 வழிமுறை",

        servPageTitle: "அனைத்து 10 கூட்டுறவு சேவை தொழில்கள்",
        servPageSub: "வணிக கட்டணங்கள், பின்னணி சான்றிதழ்கள் மற்றும் உடனடி முன்பதிவை உலாவுக.",
        baseText: "அடிப்படை",
        bookServiceBtn: "சேவை முன்பதிவு",
        verifiedBadge: "✓ சரிபார்க்கப்பட்டது",
        bookNowBtn: "இப்போது முன்பதிவு செய்",

        bookingFlowTitle: "சேவை முன்பதிவு பயணம்",
        stepPill1: "1. கோரிக்கை படிவம்", stepPill2: "2. பணியாளர் பொருத்தம்", stepPill3: "3. உறுதிப்படுத்தல்",
        reqFormHeading: "1. உங்களுக்கு என்ன தேவை என்பதை எங்களிடம் கூறுங்கள்",
        lblSelService: "தேர்ந்தெடுக்கப்பட்ட சேவை",
        lblProbDesc: "சிக்கல் விவரம்",
        lblServAddr: "சேவை முகவரி",
        lblUrgency: "அவசரம்",
        urgNormal: "சாதாரண (அடிப்படை கட்டணம்)", urgUrgent: "அவசரம் (+25%)", urgEmergency: "அவசரகாலம் (1.5x)",
        btnFindWorkers: "சரிபார்க்கப்பட்ட பணியாளர்களைக் கண்டறியவும் →",
        transAlgoBadge: "வெளிப்படையான பொருத்தம் வழிமுறை",
        matchHeading: "உங்களுக்கு அருகிலுள்ள சரிபார்க்கப்பட்ட பிளம்பர்கள்",
        matchSub: "திறன்கள் (35%), அருகாமை (20%), கிடைக்கும் தன்மை (15%), மதிப்பீடு (10%), பணிச்சுமை (10%), நியாயம் (10%)",
        selectAndConfirm: "தேர்ந்தெடுத்து உறுதிப்படுத்தவும்",
        confirmDetailsTitle: "உங்கள் முன்பதிவு விவரங்களை உறுதிப்படுத்தவும்",
        confLblService: "சேவை:", confLblWorker: "ஒதுக்கப்பட்ட பணியாளர்:", confLblAddr: "முகவரி:", confLblPrice: "மொத்த விலை:",
        btnConfirmOrder: "முன்பதிவை உறுதிசெய்து ஆர்டரை உருவாக்கவும்",
        successTitle: "முன்பதிவு உறுதிப்படுத்தப்பட்டது!",
        successIdText: "முன்பதிவு ஐடி: SN-2026-8941 | OTP குறியீடு: 4829",
        btnDownloadSlip: "📄 ரசீதைப் பதிவிறக்கவும்",
        btnTrackTimeline: "நேரலை நிலை காலவரிசையைக் கண்காணிக்கவும் →",
        btnReturnDash: "முகப்புக்குத் திரும்பு",

        trackHeaderTitle: "முன்பதிவு நிலை: SN-2026-8941",
        trackHeaderSub: "ஒதுக்கப்பட்ட கைவினைஞர்: ராஜேஷ் குமார் (பாட்னா மாவட்ட தொழிலாளர் சங்கம்)",
        btnSimulateStatus: "அடுத்த நிலையை உருவகப்படுத்து",
        trackProgressionTitle: "SIH 26089 நிலை முன்னேற்றம்",
        tstep1: "1. கோரப்பட்டது ✓ (கூட்டுறவு வலையமைப்பில் பரப்பப்பட்டது)",
        tstep2: "2. ஒதுக்கப்பட்டது ✓ (சங்கத்தால் பணியாளர் ஒதுக்கப்பட்டார்)",
        tstep3: "3. ஏற்றுக்கொள்ளப்பட்டது (பணியாளர் சந்திப்பை உறுதிப்படுத்தினார்)",
        tstep4: "4. வழியில் / தொடங்கப்பட்டது (பணியாளர் பயணத்தில் உள்ளார்)",
        tstep5: "5. முடிந்தது மற்றும் OTP மூலம் சரிபார்க்கப்பட்டது",
        secVerifyTitle: "பாதுகாப்பு சரிபார்ப்பு",
        secOtpLbl: "வருகையின்போது OTP ஐப் பகிரவும்",
        secPhoneLbl: "பணியாளர் தொலைபேசி:",

        sosBadgeLbl: "⚡ உடனடி SOS அனுப்புதல்",
        sosTitle: "அவசர சேவை அனுப்புதல்",
        sosSub: "1.5x அவசர கட்டணத்துடன் 15-25 நிமிடங்களில் உறுதிப்படுத்தப்பட்ட வருகை.",
        sosBoxTitle: "உடனடி அவசர பிளம்பர் / எலக்ட்ரீஷியன் தேவையா?",
        sosPlumberTitle: "அவசர பிளம்பர்",
        sosPlumberEta: "ETA: ~15 நிமிடங்கள் • 2.4 கிமீ தொலைவில்",
        sosElecTitle: "அவசர எலக்ட்ரீஷியன்",
        sosElecEta: "ETA: ~20 நிமிடங்கள் • 3.1 கிமீ தொலைவில்",
        sosDispatch: "இப்போது அனுப்பவும்",

        footerText: "ஷர்ம்நெக்ஸஸ் © 2026. SIH சிக்கல் அறிக்கை 26089 (கூட்டுறவு கிக் சேவைகள் தளம்) க்காக உருவாக்கப்பட்டது."
      },
      te: {
        navHome: "హోమ్", navServices: "సేవలు", navBooking: "బుకింగ్", navTracker: "ట్రాకర్", navSOS: "⚡ ఎమర్జెన్సీ SOS",
        badge: "సహకార యాజమాన్య ధృవీకృత కార్మికులు",
        heroTitle: "షర్మ్‌నెక్సస్",
        heroSub: "ధృవీకరించబడిన నైపుణ్యం యొక్క కథ.\nసహకార యాజమాన్య గిగ్ వర్క్‌ఫోర్స్.",
        searchPlaceholder: "ఈరోజు మీకు ఏ సేవ కావాలి?",
        bookBtn: "సర్వీస్ బుక్ చేయండి",
        activeBadge: "యాక్టివ్ అభ్యర్థన", activeStatus: "వర్కర్ కేటాయించబడ్డారు", activeTrack: "స్థితిని ట్రాక్ చేయండి →",
        activeTitle: "ప్లంబర్ • బుకింగ్ SN-2026-8941",
        activeDesc: "రాజేష్ కుమార్‌కు కేటాయించబడింది (పాట్నా జిల్లా లేబర్ సొసైటీ)",
        tradesTitle: "10 ధృవీకరించబడిన ట్రేడ్స్", recommendedTitle: "సిఫార్సు చేయబడిన నిపుణులు", viewAll: "అన్నీ చూడండి ↗",
        recomAlgo: "SIH 26089 అల్గారిథమ్",

        servPageTitle: "అన్ని 10 సహకార సేవా ట్రేడ్స్",
        servPageSub: "ట్రేడ్ రేట్లు, నేపథ్య ధృవీకరణ పత్రాలు మరియు తక్షణ బుకింగ్‌ను బ్రౌజ్ చేయండి.",
        baseText: "బేస్",
        bookServiceBtn: "సర్వీస్ బుక్ చేయండి",
        verifiedBadge: "✓ ధృవీకరించబడింది",
        bookNowBtn: "ఇప్పుడే బుక్ చేయండి",

        bookingFlowTitle: "సేవా బుకింగ్ ప్రయాణం",
        stepPill1: "1. అభ్యర్థన ఫారమ్", stepPill2: "2. వర్కర్ మ్యాచింగ్", stepPill3: "3. నిర్ధారణ",
        reqFormHeading: "1. మీకు ఏమి కావాలో మాకు చెప్పండి",
        lblSelService: "ఎంచుకున్న సేవ",
        lblProbDesc: "సమస్య వివరణ",
        lblServAddr: "సేవా చిరునామా",
        lblUrgency: "అత్యవసర పరిస్థితి",
        urgNormal: "సాధారణ (బేస్ రేట్)", urgUrgent: "అత్యవసర (+25%)", urgEmergency: "ఎమర్జెన్సీ (1.5x)",
        btnFindWorkers: "ధృవీకరించబడిన కార్మికులను కనుగొనండి →",
        transAlgoBadge: "పారదర్శక మ్యాచింగ్ అల్గారిథమ్",
        matchHeading: "మీకు సమీపంలో ఉన్న ధృవీకరించబడిన ప్లంబర్లు",
        matchSub: "నైపుణ్యాలు (35%), దూరం (20%), లభ్యత (15%), రేటింగ్ (10%), వర్క్‌లోడ్ (10%), న్యాయం (10%)",
        selectAndConfirm: "ఎంచుకోండి & నిర్ధారించండి",
        confirmDetailsTitle: "మీ బుకింగ్ వివరాలను నిర్ధారించండి",
        confLblService: "సేవ:", confLblWorker: "కేటాయించిన వర్కర్:", confLblAddr: "చిరునామా:", confLblPrice: "మొత్తం ధర:",
        btnConfirmOrder: "బుకింగ్‌ని నిర్ధారించండి & ఆర్డర్‌ని రూపొందించండి",
        successTitle: "బుకింగ్ నిర్ధారించబడింది!",
        successIdText: "బుకింగ్ ఐడి: SN-2026-8941 | OTP కోడ్: 4829",
        btnDownloadSlip: "📄 స్లిప్‌ని డౌన్‌లోడ్ చేయండి",
        btnTrackTimeline: "లైవ్ స్టేటస్ టైమ్‌లైన్‌ని ట్రాక్ చేయండి →",
        btnReturnDash: "డ్యాష్‌బోర్డ్‌కి తిరిగి వెళ్లు",

        trackHeaderTitle: "బుకింగ్ స్థితి: SN-2026-8941",
        trackHeaderSub: "కేటాయించిన నిపుణుడు: రాజేష్ కుమార్ (పాట్నా జిల్లా లేబర్ సొసైటీ)",
        btnSimulateStatus: "తదుపరి స్థితిని అనుకరించండి",
        trackProgressionTitle: "SIH 26089 స్థితి పురోగతి",
        tstep1: "1. అభ్యర్థించబడింది ✓ (సహకార నెట్‌వర్క్‌కి ప్రసారం చేయబడింది)",
        tstep2: "2. కేటాయించబడింది ✓ (సొసైటీ ద్వారా వర్కర్ కేటాయించబడ్డారు)",
        tstep3: "3. ఆమోదించబడింది (వర్కర్ అపాయింట్‌మెంట్‌ని నిర్ధారించారు)",
        tstep4: "4. మార్గంలో ఉంది / ప్రారంభించబడింది (వర్కర్ ప్రయాణంలో ఉన్నారు)",
        tstep5: "5. పూర్తయింది & OTP ద్వారా ధృవీకరించబడింది",
        secVerifyTitle: "భద్రతా ధృవీకరణ",
        secOtpLbl: "వచ్చినప్పుడు OTPని షేర్ చేయండి",
        secPhoneLbl: "వర్కర్ ఫోన్:",

        sosBadgeLbl: "⚡ తక్షణ SOS డిస్పాచ్",
        sosTitle: "అత్యవసర సేవా డిస్పాచ్",
        sosSub: "1.5x అత్యవసర రేటుతో 15-25 నిమిషాల్లో హామీతో కూడిన రాక.",
        sosBoxTitle: "తక్షణ అత్యవసర ప్లంబర్ / ఎలక్ట్రీషియన్ కావలసి ఉందా?",
        sosPlumberTitle: "ఎమర్జెన్సీ ప్లంబర్",
        sosPlumberEta: "ETA: ~15 నిమిషాలు • 2.4 కి.మీ దూరంలో",
        sosElecTitle: "ఎమర్జెన్సీ ఎలక్ట్రీషియన్",
        sosElecEta: "ETA: ~20 నిమిషాలు • 3.1 కి.మీ దూరంలో",
        sosDispatch: "ఇప్పుడే డిస్పాచ్ చేయండి",

        footerText: "షర్మ్‌నెక్సస్ © 2026. SIH సమస్య స్టేట్‌మెంట్ 26089 (కోఆపరేటివ్ గిగ్ సర్వీసెస్ ప్లాట్‌ఫారమ్) కోసం రూపొందించబడింది."
      }
    };

export type TranslationKey = keyof typeof translations.en;

export function getCustomerTranslation(lang: CustomerLanguage = 'en') {
  return (translations as any)[lang] || translations.en;
}

export function useCustomerI18n() {
  const [lang, setLang] = useState<CustomerLanguage>('en');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('shramnexus-lang') as CustomerLanguage;
      if (saved && (translations as any)[saved]) {
        setLang(saved);
      }

      const handler = (e: any) => {
        if (e.detail && (translations as any)[e.detail]) {
          setLang(e.detail);
        }
      };

      window.addEventListener('shramnexus-lang-change', handler);
      return () => window.removeEventListener('shramnexus-lang-change', handler);
    }
  }, []);

  const changeLang = (newLang: CustomerLanguage) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('shramnexus-lang', newLang);
      setLang(newLang);
      window.dispatchEvent(new CustomEvent('shramnexus-lang-change', { detail: newLang }));
    }
  };

  const t = (translations as any)[lang] || translations.en;

  return { lang, changeLang, t, categoriesData, workersData };
}
