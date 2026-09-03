/* =========================================================
   SHARMNEXUS LANDING PAGE JAVASCRIPT
   Language: English / Hindi / Bengali
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       1. LANGUAGE TRANSLATIONS
       ===================================================== */

    const translations = {

        /* ================= ENGLISH ================= */

        en: {
            nav: [
                "Home",
                "Services",
                "How It Works",
                "For Workers",
                "For Cooperatives",
                "About"
            ],

            heroTitle: "Skilled People.<br>Trusted Services.",

            heroSubtitle:
                "Book verified local professionals for your home, business, and community needs — powered by technology and built around cooperative workers.",

            searchPlaceholder:
                "What service do you need? Try 'plumber for leaking tap'",

            location:
                "Use my location",

            findProfessional:
                "Find a Professional →",

            becomeWorker:
                "Become a SharmNexus Worker",

            servicesTitle:
                "What can we help you with?",

            services: [
                ["Electrical", "Repairs, fittings & installation"],
                ["Plumbing", "Repairs, fittings & maintenance"],
                ["Carpentry", "Furniture, repairs & installation"],
                ["Painting", "Interior & exterior services"],
                ["Cleaning", "Home & office cleaning"],
                ["Caregiving", "Elderly & childcare services"],
                ["Driving", "Transportation & delivery"],
                ["Gardening", "Landscaping & maintenance"],
                ["Technician", "Tech repair & support"]
            ],

            viewAll:
                "View All Services →",

            trustTitle:
                "People you can trust.<br>Services you can count on.",

            trust: [
                [
                    "Verified Professionals",
                    "Every worker goes through identity, skill, and certification verification to ensure quality and safety."
                ],
                [
                    "Real Ratings",
                    "Transparent ratings and reviews help customers choose confidently and workers build their reputation."
                ],
                [
                    "Cooperative Backed",
                    "Workers are connected to registered Labour Cooperatives and Federations for better support and benefits."
                ]
            ],

            howTitle:
                "How SharmNexus Works",

            steps: [
                ["Search", "Tell us what service you need"],
                ["Match", "Our AI finds suitable nearby professionals"],
                ["Book", "Choose your preferred professional & time"],
                ["Done", "Track, pay digitally, and rate"]
            ],

            flow: [
                "Search",
                "Match",
                "Book",
                "Service",
                "Pay",
                "Rate"
            ],

            aiTitle:
                "The right worker.<br>At the right place. At the right time.",

            aiSubtitle:
                "SharmNexus intelligently matches customers with available workers using location, skills, certifications, ratings, experience, availability, and workload.",

            bookNow:
                "Book Now →",

            emergencyTitle:
                "Need help right now?",

            emergencySubtitle:
                "Get connected with the nearest available verified professional for urgent service requirements.",

            emergencyButton:
                "🚨 Find Emergency Help",

            requestNow:
                "Request Now →",

            customerTitle:
                "Everything you need.<br>One simple platform.",

            customerFeatures: [
                "Find verified professionals",
                "Location-based matching",
                "Easy scheduling",
                "Secure digital payments",
                "Digital invoices",
                "Ratings & reviews",
                "Service tracking",
                "Emergency booking"
            ],

            firstService:
                "Book Your First Service →",

            workerTitle:
                "Your skills deserve more<br>opportunities.",

            workerSubtitle:
                "Build your professional identity, discover jobs, grow your reputation, and access cooperative welfare benefits — all from one platform.",

            joinWorker:
                "Join as a Worker →",

            welfareTitle:
                "More than a marketplace.<br>A better future for workers.",

            welfareSubtitle:
                "SharmNexus helps cooperatives create a stronger support system around the people who power essential services.",

            coopTitle:
                "Power your cooperative<br>with data.",

            coopSubtitle:
                "Manage your workforce, services, bookings, welfare programs, and performance from one intelligent platform.",

            coopDashboard:
                "Explore Cooperative Dashboard →",

            forecastTitle:
                "Predict demand before it happens.",

            mapTitle:
                "Services around you.",

            digitalTitle:
                "One profile.<br>A complete professional identity.",

            digitalDescription:
                "Customers can scan a worker's SharmNexus ID to verify their professional credentials and ratings.",

            languageTitle:
                "Technology that speaks<br>your language.",

            explore:
                "Explore SharmNexus →",

            testimonialTitle:
                "Trusted by the community",

            finalTitle:
                "Your next service is just<br>a few clicks away.",

            finalSubtitle:
                "Find trusted professionals. Support skilled workers. Strengthen local cooperatives.",

            findService:
                "Find a Service →",

            footerTagline:
                "Connecting Skills. Creating Opportunities."
        },


        /* ================= HINDI ================= */

        hi: {
            nav: [
                "होम",
                "सेवाएँ",
                "कैसे काम करता है",
                "कामगारों के लिए",
                "सहकारी समितियों के लिए",
                "हमारे बारे में"
            ],

            heroTitle:
                "कुशल लोग।<br>विश्वसनीय सेवाएँ।",

            heroSubtitle:
                "अपने घर, व्यवसाय और समुदाय की जरूरतों के लिए सत्यापित स्थानीय पेशेवर बुक करें — तकनीक से संचालित और सहकारी कामगारों पर आधारित।",

            searchPlaceholder:
                "आपको कौन-सी सेवा चाहिए? जैसे 'नल ठीक करने के लिए प्लंबर'",

            location:
                "मेरी लोकेशन का उपयोग करें",

            findProfessional:
                "पेशेवर खोजें →",

            becomeWorker:
                "SharmNexus कामगार बनें",

            servicesTitle:
                "हम आपकी किस तरह मदद कर सकते हैं?",

            services: [
                ["इलेक्ट्रिकल", "मरम्मत, फिटिंग और इंस्टॉलेशन"],
                ["प्लंबिंग", "मरम्मत, फिटिंग और रखरखाव"],
                ["बढ़ईगिरी", "फर्नीचर, मरम्मत और इंस्टॉलेशन"],
                ["पेंटिंग", "इंटीरियर और एक्सटीरियर सेवाएँ"],
                ["सफाई", "घर और ऑफिस की सफाई"],
                ["देखभाल", "बुजुर्ग और बच्चों की देखभाल"],
                ["ड्राइविंग", "परिवहन और डिलीवरी"],
                ["बागवानी", "लैंडस्केपिंग और रखरखाव"],
                ["तकनीशियन", "तकनीकी मरम्मत और सहायता"]
            ],

            viewAll:
                "सभी सेवाएँ देखें →",

            trustTitle:
                "विश्वसनीय लोग।<br>भरोसेमंद सेवाएँ।",

            trust: [
                [
                    "सत्यापित पेशेवर",
                    "हर कामगार की पहचान, कौशल और प्रमाणपत्र की जाँच की जाती है ताकि गुणवत्ता और सुरक्षा सुनिश्चित हो।"
                ],
                [
                    "वास्तविक रेटिंग",
                    "पारदर्शी रेटिंग और समीक्षाएँ ग्राहकों को सही चुनाव करने और कामगारों को अपनी प्रतिष्ठा बनाने में मदद करती हैं।"
                ],
                [
                    "सहकारी समर्थन",
                    "कामगार पंजीकृत श्रम सहकारी समितियों और महासंघों से जुड़े हैं, जिससे उन्हें बेहतर सहायता और लाभ मिलते हैं।"
                ]
            ],

            howTitle:
                "SharmNexus कैसे काम करता है",

            steps: [
                ["खोजें", "हमें बताएँ कि आपको कौन-सी सेवा चाहिए"],
                ["मैच", "हमारा AI आपके पास उपयुक्त पेशेवर खोजता है"],
                ["बुक करें", "अपना पसंदीदा पेशेवर और समय चुनें"],
                ["पूरा", "सेवा ट्रैक करें, डिजिटल भुगतान करें और रेटिंग दें"]
            ],

            flow: [
                "खोजें",
                "मैच",
                "बुक करें",
                "सेवा",
                "भुगतान",
                "रेटिंग"
            ],

            aiTitle:
                "सही कामगार।<br>सही जगह। सही समय।",

            aiSubtitle:
                "SharmNexus लोकेशन, कौशल, प्रमाणपत्र, रेटिंग, अनुभव, उपलब्धता और कार्यभार के आधार पर ग्राहकों को उपलब्ध कामगारों से जोड़ता है।",

            bookNow:
                "अभी बुक करें →",

            emergencyTitle:
                "अभी मदद चाहिए?",

            emergencySubtitle:
                "जरूरी सेवा के लिए निकटतम उपलब्ध सत्यापित पेशेवर से तुरंत जुड़ें।",

            emergencyButton:
                "🚨 आपातकालीन मदद खोजें",

            requestNow:
                "अभी अनुरोध करें →",

            customerTitle:
                "आपकी हर जरूरत।<br>एक आसान प्लेटफॉर्म।",

            customerFeatures: [
                "सत्यापित पेशेवर खोजें",
                "लोकेशन आधारित मैचिंग",
                "आसान शेड्यूलिंग",
                "सुरक्षित डिजिटल भुगतान",
                "डिजिटल इनवॉइस",
                "रेटिंग और समीक्षाएँ",
                "सेवा ट्रैकिंग",
                "आपातकालीन बुकिंग"
            ],

            firstService:
                "पहली सेवा बुक करें →",

            workerTitle:
                "आपके कौशल को चाहिए<br>और अधिक अवसर।",

            workerSubtitle:
                "अपनी पेशेवर पहचान बनाएँ, काम खोजें, अपनी प्रतिष्ठा बढ़ाएँ और सहकारी कल्याण लाभ प्राप्त करें — एक ही प्लेटफॉर्म पर।",

            joinWorker:
                "कामगार के रूप में जुड़ें →",

            welfareTitle:
                "सिर्फ मार्केटप्लेस नहीं।<br>कामगारों के लिए बेहतर भविष्य।",

            welfareSubtitle:
                "SharmNexus सहकारी समितियों को आवश्यक सेवाएँ देने वाले लोगों के लिए मजबूत सहायता प्रणाली बनाने में मदद करता है।",

            coopTitle:
                "डेटा के साथ अपनी सहकारी समिति<br>को सशक्त बनाएँ।",

            coopSubtitle:
                "एक स्मार्ट प्लेटफॉर्म से कामगार, सेवाएँ, बुकिंग, कल्याण कार्यक्रम और प्रदर्शन प्रबंधित करें।",

            coopDashboard:
                "सहकारी डैशबोर्ड देखें →",

            forecastTitle:
                "मांग आने से पहले उसका अनुमान लगाएँ।",

            mapTitle:
                "आपके आसपास की सेवाएँ।",

            digitalTitle:
                "एक प्रोफाइल।<br>एक पूरी पेशेवर पहचान।",

            digitalDescription:
                "ग्राहक कामगार की SharmNexus ID स्कैन करके उसकी पेशेवर योग्यता और रेटिंग सत्यापित कर सकते हैं।",

            languageTitle:
                "आपकी भाषा बोलने वाली<br>तकनीक।",

            explore:
                "SharmNexus देखें →",

            testimonialTitle:
                "समुदाय का भरोसा",

            finalTitle:
                "आपकी अगली सेवा बस<br>कुछ क्लिक दूर है।",

            finalSubtitle:
                "विश्वसनीय पेशेवर खोजें। कुशल कामगारों का समर्थन करें। स्थानीय सहकारी समितियों को मजबूत करें।",

            findService:
                "सेवा खोजें →",

            footerTagline:
                "कौशल जोड़ें। अवसर बनाएँ।"
        },


        /* ================= BENGALI ================= */

        bn: {
            nav: [
                "হোম",
                "পরিষেবা",
                "কীভাবে কাজ করে",
                "কর্মীদের জন্য",
                "সমবায়ের জন্য",
                "আমাদের সম্পর্কে"
            ],

            heroTitle:
                "দক্ষ মানুষ।<br>বিশ্বস্ত পরিষেবা।",

            heroSubtitle:
                "আপনার বাড়ি, ব্যবসা এবং সম্প্রদায়ের প্রয়োজনের জন্য যাচাইকৃত স্থানীয় পেশাদার বুক করুন — প্রযুক্তিনির্ভর এবং সমবায় কর্মীদের কেন্দ্র করে তৈরি।",

            searchPlaceholder:
                "আপনার কোন পরিষেবা দরকার? যেমন 'কলের লিক ঠিক করার জন্য প্লাম্বার'",

            location:
                "আমার অবস্থান ব্যবহার করুন",

            findProfessional:
                "পেশাদার খুঁজুন →",

            becomeWorker:
                "SharmNexus কর্মী হন",

            servicesTitle:
                "আমরা কীভাবে আপনাকে সাহায্য করতে পারি?",

            services: [
                ["ইলেকট্রিক্যাল", "মেরামত, ফিটিং ও ইনস্টলেশন"],
                ["প্লাম্বিং", "মেরামত, ফিটিং ও রক্ষণাবেক্ষণ"],
                ["কাঠমিস্ত্রি", "আসবাবপত্র, মেরামত ও ইনস্টলেশন"],
                ["পেইন্টিং", "ইন্টেরিয়র ও এক্সটেরিয়র পরিষেবা"],
                ["পরিষ্কার", "বাড়ি ও অফিস পরিষ্কার"],
                ["যত্ন পরিষেবা", "বয়স্ক ও শিশুদের যত্ন"],
                ["ড্রাইভিং", "পরিবহন ও ডেলিভারি"],
                ["বাগান", "ল্যান্ডস্কেপিং ও রক্ষণাবেক্ষণ"],
                ["টেকনিশিয়ান", "প্রযুক্তি মেরামত ও সহায়তা"]
            ],

            viewAll:
                "সব পরিষেবা দেখুন →",

            trustTitle:
                "যাদের আপনি বিশ্বাস করতে পারেন।<br>যে পরিষেবার উপর ভরসা করতে পারেন।",

            trust: [
                [
                    "যাচাইকৃত পেশাদার",
                    "প্রতিটি কর্মীর পরিচয়, দক্ষতা এবং সার্টিফিকেট যাচাই করা হয়।"
                ],
                [
                    "বাস্তব রেটিং",
                    "স্বচ্ছ রেটিং এবং পর্যালোচনা গ্রাহকদের সঠিক পেশাদার বেছে নিতে সাহায্য করে।"
                ],
                [
                    "সমবায়ের সহায়তা",
                    "কর্মীরা নিবন্ধিত শ্রম সমবায় ও ফেডারেশনের সঙ্গে যুক্ত।"
                ]
            ],

            howTitle:
                "SharmNexus কীভাবে কাজ করে",

            steps: [
                ["খুঁজুন", "আপনার কোন পরিষেবা দরকার তা জানান"],
                ["ম্যাচ", "আমাদের AI আপনার কাছের উপযুক্ত পেশাদার খুঁজে দেয়"],
                ["বুক করুন", "পছন্দের পেশাদার ও সময় বেছে নিন"],
                ["সম্পন্ন", "পরিষেবা ট্র্যাক করুন, ডিজিটাল পেমেন্ট করুন এবং রেটিং দিন"]
            ],

            flow: [
                "খুঁজুন",
                "ম্যাচ",
                "বুক করুন",
                "পরিষেবা",
                "পেমেন্ট",
                "রেটিং"
            ],

            aiTitle:
                "সঠিক কর্মী।<br>সঠিক জায়গায়। সঠিক সময়ে।",

            aiSubtitle:
                "SharmNexus লোকেশন, দক্ষতা, সার্টিফিকেট, রেটিং, অভিজ্ঞতা, উপলব্ধতা এবং কাজের চাপের ভিত্তিতে গ্রাহকদের কর্মীদের সঙ্গে যুক্ত করে।",

            bookNow:
                "এখনই বুক করুন →",

            emergencyTitle:
                "এখনই সাহায্য দরকার?",

            emergencySubtitle:
                "জরুরি পরিষেবার জন্য নিকটতম উপলব্ধ যাচাইকৃত পেশাদারের সঙ্গে যুক্ত হন।",

            emergencyButton:
                "🚨 জরুরি সাহায্য খুঁজুন",

            requestNow:
                "এখনই অনুরোধ করুন →",

            customerTitle:
                "আপনার যা দরকার।<br>একটি সহজ প্ল্যাটফর্ম।",

            customerFeatures: [
                "যাচাইকৃত পেশাদার খুঁজুন",
                "লোকেশন ভিত্তিক ম্যাচিং",
                "সহজ সময় নির্ধারণ",
                "নিরাপদ ডিজিটাল পেমেন্ট",
                "ডিজিটাল ইনভয়েস",
                "রেটিং ও পর্যালোচনা",
                "পরিষেবা ট্র্যাকিং",
                "জরুরি বুকিং"
            ],

            firstService:
                "প্রথম পরিষেবা বুক করুন →",

            workerTitle:
                "আপনার দক্ষতা আরও<br>সুযোগের যোগ্য।",

            workerSubtitle:
                "আপনার পেশাগত পরিচয় তৈরি করুন, কাজ খুঁজুন, সুনাম বাড়ান এবং সমবায় কল্যাণ সুবিধা পান — সব এক প্ল্যাটফর্মে।",

            joinWorker:
                "কর্মী হিসেবে যোগ দিন →",

            welfareTitle:
                "শুধু মার্কেটপ্লেস নয়।<br>কর্মীদের জন্য আরও ভালো ভবিষ্যৎ।",

            welfareSubtitle:
                "SharmNexus প্রয়োজনীয় পরিষেবা প্রদানকারী কর্মীদের জন্য শক্তিশালী সহায়তা ব্যবস্থা তৈরি করতে সমবায়গুলিকে সাহায্য করে।",

            coopTitle:
                "ডেটার মাধ্যমে আপনার সমবায়কে<br>শক্তিশালী করুন।",

            coopSubtitle:
                "একটি স্মার্ট প্ল্যাটফর্ম থেকে কর্মী, পরিষেবা, বুকিং, কল্যাণ কর্মসূচি এবং কর্মক্ষমতা পরিচালনা করুন।",

            coopDashboard:
                "সমবায় ড্যাশবোর্ড দেখুন →",

            forecastTitle:
                "চাহিদা আসার আগেই পূর্বাভাস দিন।",

            mapTitle:
                "আপনার আশেপাশের পরিষেবা।",

            digitalTitle:
                "একটি প্রোফাইল।<br>একটি সম্পূর্ণ পেশাগত পরিচয়।",

            digitalDescription:
                "গ্রাহকরা কর্মীর SharmNexus ID স্ক্যান করে তার পেশাগত যোগ্যতা ও রেটিং যাচাই করতে পারেন।",

            languageTitle:
                "আপনার ভাষায় কথা বলে এমন<br>প্রযুক্তি।",

            explore:
                "SharmNexus দেখুন →",

            testimonialTitle:
                "সম্প্রদায়ের বিশ্বাস",

            finalTitle:
                "আপনার পরবর্তী পরিষেবা মাত্র<br>কয়েক ক্লিক দূরে।",

            finalSubtitle:
                "বিশ্বস্ত পেশাদার খুঁজুন। দক্ষ কর্মীদের সমর্থন করুন। স্থানীয় সমবায়কে শক্তিশালী করুন।",

            findService:
                "পরিষেবা খুঁজুন →",

            footerTagline:
                "দক্ষতা সংযোগ করুন। সুযোগ তৈরি করুন।"
        }
    };


    /* =====================================================
       2. HELPER FUNCTIONS
       ===================================================== */

    function setText(selector, value) {
        document.querySelectorAll(selector).forEach(function (element) {
            element.textContent = value;
        });
    }


    function setHTML(selector, value) {
        document.querySelectorAll(selector).forEach(function (element) {
            element.innerHTML = value;
        });
    }


    /* =====================================================
       3. CHANGE LANGUAGE
       ===================================================== */

    function changeLanguage(language) {

        const t = translations[language];

        if (!t) {
            console.error("Language not found:", language);
            return;
        }


        /* ---------- NAVIGATION ---------- */

        const navLinks = document.querySelectorAll(".nav-link");

        navLinks.forEach(function (link, index) {

            if (t.nav[index]) {
                link.textContent = t.nav[index];
            }

        });


        /* ---------- HERO ---------- */

        setHTML(".hero-title", t.heroTitle);

        setText(".hero-subtitle", t.heroSubtitle);


        const searchInput = document.querySelector(".search-input");

        if (searchInput) {
            searchInput.placeholder = t.searchPlaceholder;
        }


        const locationButton =
            document.querySelector(".btn-location");

        if (locationButton) {

            const icon = locationButton.querySelector("svg");

            if (icon) {
                locationButton.innerHTML = "";
                locationButton.appendChild(icon);
                locationButton.appendChild(
                    document.createTextNode(" " + t.location)
                );
            } else {
                locationButton.textContent = t.location;
            }

        }


        const findProfessional =
            document.querySelector(".search-component .btn-large");

        if (findProfessional) {
            findProfessional.textContent =
                t.findProfessional;
        }


        const becomeWorker =
            document.querySelector(".hero-content > .btn-outline");

        if (becomeWorker) {
            becomeWorker.textContent =
                t.becomeWorker;
        }


        /* =================================================
           SERVICES
           ================================================= */

        setText(
            ".services-categories .section-title",
            t.servicesTitle
        );


        const serviceCards =
            document.querySelectorAll(".service-card");


        serviceCards.forEach(function (card, index) {

            if (!t.services[index]) return;

            const heading =
                card.querySelector("h3");

            const paragraph =
                card.querySelector("p");


            if (heading) {
                heading.textContent =
                    t.services[index][0];
            }


            if (paragraph) {
                paragraph.textContent =
                    t.services[index][1];
            }

        });


        setText(
            ".view-all-cta .link-arrow",
            t.viewAll
        );


        /* =================================================
           TRUST
           ================================================= */

        setHTML(
            ".trust-section .section-title",
            t.trustTitle
        );


        document
            .querySelectorAll(".trust-card")
            .forEach(function (card, index) {

                if (!t.trust[index]) return;

                const heading =
                    card.querySelector("h3");

                const paragraph =
                    card.querySelector("p");


                if (heading) {
                    heading.textContent =
                        t.trust[index][0];
                }


                if (paragraph) {
                    paragraph.textContent =
                        t.trust[index][1];
                }

            });


        /* =================================================
           HOW IT WORKS
           ================================================= */

        setText(
            ".how-it-works .section-title",
            t.howTitle
        );


        document
            .querySelectorAll(".timeline-step")
            .forEach(function (step, index) {

                if (!t.steps[index]) return;

                const heading =
                    step.querySelector("h3");

                const paragraph =
                    step.querySelector("p");


                if (heading) {
                    heading.textContent =
                        t.steps[index][0];
                }


                if (paragraph) {
                    paragraph.textContent =
                        t.steps[index][1];
                }

            });


        document
            .querySelectorAll(".flow-step")
            .forEach(function (step, index) {

                if (t.flow[index]) {
                    step.textContent =
                        t.flow[index];
                }

            });


        /* =================================================
           AI MATCHING
           ================================================= */

        setHTML(
            ".ai-matching .section-title",
            t.aiTitle
        );


        setText(
            ".ai-matching .section-subtitle",
            t.aiSubtitle
        );


        setText(
            ".recommendation-card .btn",
            t.bookNow
        );


        /* =================================================
           EMERGENCY
           ================================================= */

        setText(
            ".emergency-services .section-title",
            t.emergencyTitle
        );


        setText(
            ".emergency-services .section-subtitle",
            t.emergencySubtitle
        );


        const emergencyButton =
            document.querySelector(".btn-emergency");


        if (emergencyButton) {

            const icon =
                emergencyButton.querySelector(".emergency-icon");

            if (icon) {

                icon.textContent = "🚨";

                emergencyButton.innerHTML = "";

                emergencyButton.appendChild(icon);

                emergencyButton.appendChild(
                    document.createTextNode(
                        " " + t.emergencyButton.replace("🚨 ", "")
                    )
                );

            } else {

                emergencyButton.textContent =
                    t.emergencyButton;

            }

        }


        setText(
            ".emergency-card .btn",
            t.requestNow
        );


        /* =================================================
           CUSTOMER
           ================================================= */

        setHTML(
            ".for-customers .section-title",
            t.customerTitle
        );


        document
            .querySelectorAll(".feature-box h3")
            .forEach(function (heading, index) {

                if (t.customerFeatures[index]) {

                    heading.textContent =
                        t.customerFeatures[index];

                }

            });


        const firstServiceButton =
            document.querySelector(
                ".for-customers .btn-large"
            );


        if (firstServiceButton) {
            firstServiceButton.textContent =
                t.firstService;
        }


        /* =================================================
           WORKERS
           ================================================= */

        setHTML(
            ".for-workers .section-title",
            t.workerTitle
        );


        setText(
            ".for-workers .section-subtitle",
            t.workerSubtitle
        );


        const joinWorkerButton =
            document.querySelector(
                ".for-workers .btn-large"
            );


        if (joinWorkerButton) {
            joinWorkerButton.textContent =
                t.joinWorker;
        }


        /* =================================================
           WELFARE
           ================================================= */

        setHTML(
            ".worker-welfare .section-title",
            t.welfareTitle
        );


        setText(
            ".worker-welfare .section-subtitle",
            t.welfareSubtitle
        );


        /* =================================================
           COOPERATIVES
           ================================================= */

        setHTML(
            ".for-cooperatives .section-title",
            t.coopTitle
        );


        setText(
            ".for-cooperatives .section-subtitle",
            t.coopSubtitle
        );


        const coopButton =
            document.querySelector(
                ".for-cooperatives .btn-large"
            );


        if (coopButton) {
            coopButton.textContent =
                t.coopDashboard;
        }


        /* =================================================
           FORECAST
           ================================================= */

        setText(
            ".demand-forecasting .section-title",
            t.forecastTitle
        );


        /* =================================================
           MAP
           ================================================= */

        setText(
            ".service-map .section-title",
            t.mapTitle
        );


        /* =================================================
           DIGITAL ID
           ================================================= */

        setHTML(
            ".digital-id .section-title",
            t.digitalTitle
        );


        setText(
            ".id-description",
            t.digitalDescription
        );


        /* =================================================
           MULTILINGUAL
           ================================================= */

        setHTML(
            ".multilingual .section-title",
            t.languageTitle
        );


        setText(
            ".multilingual .btn-large",
            t.explore
        );


        /* =================================================
           TESTIMONIALS
           ================================================= */

        setText(
            ".testimonials .section-title",
            t.testimonialTitle
        );


        /* =================================================
           FINAL CTA
           ================================================= */

        setHTML(
            ".final-cta-title",
            t.finalTitle
        );


        setText(
            ".final-cta-subtitle",
            t.finalSubtitle
        );


        const finalButtons =
            document.querySelectorAll(
                ".final-cta-buttons .btn"
            );


        if (finalButtons[0]) {
            finalButtons[0].textContent =
                t.findService;
        }


        if (finalButtons[1]) {
            finalButtons[1].textContent =
                t.joinWorker;
        }


        /* =================================================
           FOOTER
           ================================================= */

        setText(
            ".footer-tagline",
            t.footerTagline
        );


        /* =================================================
           SAVE LANGUAGE
           ================================================= */

        try {

            localStorage.setItem(
                "sharmnexusLanguage",
                language
            );

        } catch (error) {

            console.log(
                "Could not save language preference."
            );

        }


        /* Change HTML language */

        document.documentElement.lang =
            language;


        console.log(
            "SharmNexus language changed to:",
            language
        );

    }


    /* =====================================================
       4. LANGUAGE SELECTOR
       ===================================================== */

    const languageSelect =
        document.getElementById("languageSelect");


    if (languageSelect) {

        languageSelect.addEventListener(
            "change",
            function () {

                changeLanguage(
                    this.value
                );

            }
        );


        /* Get saved language */

        let savedLanguage = "en";


        try {

            savedLanguage =
                localStorage.getItem(
                    "sharmnexusLanguage"
                ) || "en";

        } catch (error) {

            savedLanguage = "en";

        }


        /* Check language exists */

        if (!translations[savedLanguage]) {
            savedLanguage = "en";
        }


        /* Set selector */

        languageSelect.value =
            savedLanguage;


        /* Apply language */

        changeLanguage(
            savedLanguage
        );

    } else {

        console.error(
            "ERROR: languageSelect not found."
        );

    }


    /* =====================================================
       5. HAMBURGER MENU
       ===================================================== */

    const hamburger =
        document.getElementById("hamburger");

    const navbarMenu =
        document.getElementById("navbarMenu");


    if (hamburger && navbarMenu) {

        hamburger.addEventListener(
            "click",
            function () {

                navbarMenu.classList.toggle(
                    "active"
                );

                hamburger.classList.toggle(
                    "active"
                );

            }
        );


        document
            .querySelectorAll(".nav-link")
            .forEach(function (link) {

                link.addEventListener(
                    "click",
                    function () {

                        navbarMenu.classList.remove(
                            "active"
                        );

                        hamburger.classList.remove(
                            "active"
                        );

                    }
                );

            });

    }


    /* =====================================================
       6. SMOOTH SCROLL
       ===================================================== */

    document
        .querySelectorAll('a[href^="#"]')
        .forEach(function (link) {

            link.addEventListener(
                "click",
                function (event) {

                    const id =
                        this.getAttribute("href");


                    if (!id || id === "#") {
                        return;
                    }


                    const target =
                        document.querySelector(id);


                    if (target) {

                        event.preventDefault();


                        target.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });

                    }

                }
            );

        });


    /* =====================================================
       7. SEARCH
       ===================================================== */

    const searchInput =
        document.querySelector(".search-input");

    const searchButton =
        document.querySelector(".btn-search");


    if (searchInput && searchButton) {

        searchButton.addEventListener(
            "click",
            function () {

                const query =
                    searchInput.value.trim();


                if (query.length === 0) {

                    alert(
                        "Please enter the service you need."
                    );

                    searchInput.focus();

                    return;

                }


                alert(
                    "Searching for: " + query
                );

            }
        );


        searchInput.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {

                    event.preventDefault();

                    searchButton.click();

                }

            }
        );

    }


    /* =====================================================
       8. LOCATION
       ===================================================== */

    const locationButton =
        document.querySelector(".btn-location");


    if (locationButton) {

        locationButton.addEventListener(
            "click",
            function () {

                if (!navigator.geolocation) {

                    alert(
                        "Geolocation is not supported by your browser."
                    );

                    return;

                }


                navigator.geolocation.getCurrentPosition(

                    function (position) {

                        const latitude =
                            position.coords.latitude
                                .toFixed(4);


                        const longitude =
                            position.coords.longitude
                                .toFixed(4);


                        if (searchInput) {

                            searchInput.value =
                                "Services near " +
                                latitude +
                                ", " +
                                longitude;

                        }


                        alert(
                            "Location found successfully!"
                        );

                    },


                    function () {

                        alert(
                            "Unable to get your location. Please allow location permission."
                        );

                    }

                );

            }
        );

    }


    /* =====================================================
       9. STATISTICS ANIMATION
       ===================================================== */

    const statistics =
        document.querySelectorAll(
            ".stat-number"
        );


    if (
        statistics.length > 0 &&
        "IntersectionObserver" in window
    ) {

        const observer =
            new IntersectionObserver(

                function (entries) {

                    entries.forEach(
                        function (entry) {

                            if (!entry.isIntersecting) {
                                return;
                            }


                            const element =
                                entry.target;


                            if (
                                element.dataset.animated
                            ) {
                                return;
                            }


                            element.dataset.animated =
                                "true";


                            const target =
                                parseFloat(
                                    element.dataset.target
                                );


                            if (isNaN(target)) {
                                return;
                            }


                            const duration =
                                1500;


                            const startTime =
                                performance.now();


                            function animate(currentTime) {

                                const progress =
                                    Math.min(
                                        (currentTime -
                                            startTime) /
                                            duration,
                                        1
                                    );


                                const value =
                                    target *
                                    progress;


                                if (target >= 1000) {

                                    element.textContent =
                                        Math.floor(
                                            value
                                        ).toLocaleString() +
                                        "+";

                                } else {

                                    element.textContent =
                                        value.toFixed(1) +
                                        "★";

                                }


                                if (progress < 1) {

                                    requestAnimationFrame(
                                        animate
                                    );

                                }

                            }


                            requestAnimationFrame(
                                animate
                            );


                            observer.unobserve(
                                element
                            );

                        }
                    );

                },

                {
                    threshold: 0.5
                }

            );


        statistics.forEach(
            function (element) {

                observer.observe(
                    element
                );

            }
        );

    }


    /* =====================================================
       10. STICKY NAVBAR SHADOW
       ===================================================== */

    const navbar =
        document.querySelector(".navbar");


    if (navbar) {

        window.addEventListener(
            "scroll",
            function () {

                if (window.scrollY > 50) {

                    navbar.style.boxShadow =
                        "0 10px 25px rgba(0,0,0,0.10)";

                } else {

                    navbar.style.boxShadow =
                        "none";

                }

            }
        );

    }


    /* =====================================================
       11. PAGE LOADED
       ===================================================== */

    console.log(
        "✅ SharmNexus JavaScript loaded successfully."
    );

});