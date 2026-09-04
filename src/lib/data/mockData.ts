export interface ServiceCategory {
  id: string;
  name: string;
  name_hi: string;
  description: string;
  icon_url: string; // Lucide icon name e.g. 'Zap', 'Droplet'
  base_price: number;
  emergency_multiplier: number;
  is_active: boolean;
  popular?: boolean;
}

export interface CooperativeSociety {
  id: string;
  name: string;
  registration_number: string;
  district: string;
  state: string;
  address: string;
  member_count: number;
  rating: number;
}

export interface WorkerReview {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  date: string;
  service_name: string;
}

export interface WorkerSkill {
  service_category_id: string;
  service_name: string;
  certification_name?: string;
  years_experience: number;
  is_verified: boolean;
}

export interface WorkerProfile {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  profile_photo_url: string;
  society_id: string;
  society_name: string;
  primary_skill: string;
  skills: WorkerSkill[];
  years_experience: number;
  is_verified: boolean;
  is_available: boolean;
  verification_status: 'verified' | 'pending';
  avg_rating: number;
  total_jobs_completed: number;
  address: string;
  lat: number;
  lng: number;
  approx_distance_km: number;
  hourly_rate: number;
  workload_score: number; // 0 to 100 (lower means less overloaded, higher fairness score)
  response_time_mins: number;
  match_score?: number;
  why_recommended?: string[];
  reviews: WorkerReview[];
  bio: string;
  service_radius_km: number;
}

export interface Booking {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  worker_id: string;
  worker?: WorkerProfile;
  service_category_id: string;
  service_name: string;
  service_icon: string;
  booking_type: 'scheduled' | 'on_demand' | 'emergency';
  status: 'requested' | 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  urgency: 'normal' | 'urgent' | 'emergency';
  description: string;
  address: string;
  city: string;
  lat?: number;
  lng?: number;
  scheduled_at: string;
  time_slot: string;
  estimated_price: number;
  final_price?: number;
  image_url?: string;
  otp?: string;
  payment_status?: 'pending' | 'completed';
  payment_method?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  rating?: number;
  review?: string;
}

export const INITIAL_SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'cat-plumber',
    name: 'Plumber',
    name_hi: 'प्लम्बर',
    description: 'Pipe repairs, leak fixing, bathroom fittings & drainage solutions',
    icon_url: 'Droplet',
    base_price: 300,
    emergency_multiplier: 1.5,
    is_active: true,
    popular: true,
  },
  {
    id: 'cat-electrician',
    name: 'Electrician',
    name_hi: 'इलेक्ट्रीशियन',
    description: 'Wiring, circuit repair, switchboards, fan & appliance installations',
    icon_url: 'Zap',
    base_price: 350,
    emergency_multiplier: 1.5,
    is_active: true,
    popular: true,
  },
  {
    id: 'cat-carpenter',
    name: 'Carpenter',
    name_hi: 'बढ़ई',
    description: 'Furniture repair, door/window fittings, locks & custom woodwork',
    icon_url: 'Hammer',
    base_price: 400,
    emergency_multiplier: 1.5,
    is_active: true,
    popular: true,
  },
  {
    id: 'cat-painter',
    name: 'Painter',
    name_hi: 'पेंटर',
    description: 'Interior/exterior wall painting, waterproofing & surface priming',
    icon_url: 'Paintbrush',
    base_price: 500,
    emergency_multiplier: 1.5,
    is_active: true,
  },
  {
    id: 'cat-cleaner',
    name: 'Cleaner',
    name_hi: 'सफाई कर्मचारी',
    description: 'Deep home cleaning, kitchen & bathroom sanitation, sofa cleaning',
    icon_url: 'Sparkles',
    base_price: 250,
    emergency_multiplier: 1.5,
    is_active: true,
    popular: true,
  },
  {
    id: 'cat-technician',
    name: 'Technician',
    name_hi: 'तकनीशियन',
    description: 'AC servicing, refrigerator, washing machine & microwave repairs',
    icon_url: 'Wrench',
    base_price: 450,
    emergency_multiplier: 1.5,
    is_active: true,
    popular: true,
  },
  {
    id: 'cat-driver',
    name: 'Driver',
    name_hi: 'ड्राइवर',
    description: 'On-demand personal driver, outstation trips & hourly car driving',
    icon_url: 'Car',
    base_price: 300,
    emergency_multiplier: 1.5,
    is_active: true,
  },
  {
    id: 'cat-gardener',
    name: 'Gardener',
    name_hi: 'माली',
    description: 'Lawn trimming, plant pruning, landscaping & organic pest control',
    icon_url: 'Leaf',
    base_price: 200,
    emergency_multiplier: 1.5,
    is_active: true,
  },
  {
    id: 'cat-caregiver',
    name: 'Caregiver',
    name_hi: 'देखभाल करने वाला',
    description: 'Elderly assistance, post-operative nursing care & patient support',
    icon_url: 'Heart',
    base_price: 600,
    emergency_multiplier: 1.5,
    is_active: true,
  },
  {
    id: 'cat-domestic-helper',
    name: 'Domestic Helper',
    name_hi: 'घरेलू सहायक',
    description: 'Daily household chores, meal cooking & general home assistance',
    icon_url: 'Home',
    base_price: 250,
    emergency_multiplier: 1.5,
    is_active: true,
  },
];

export const INITIAL_SOCIETIES: CooperativeSociety[] = [
  {
    id: 'soc-1',
    name: 'Patna District Labour Society',
    registration_number: 'PDLS-BR-01',
    district: 'Patna',
    state: 'Bihar',
    address: 'Gandhi Maidan, Patna, Bihar',
    member_count: 420,
    rating: 4.8,
  },
  {
    id: 'soc-2',
    name: 'Pune Gig Workers Cooperative',
    registration_number: 'PGWC-MH-12',
    district: 'Pune',
    state: 'Maharashtra',
    address: 'Shivaji Nagar, Pune, Maharashtra',
    member_count: 310,
    rating: 4.7,
  },
  {
    id: 'soc-3',
    name: 'Delhi Labour Welfare Federation',
    registration_number: 'DLWF-DL-05',
    district: 'New Delhi',
    state: 'Delhi',
    address: 'Connaught Place, New Delhi',
    member_count: 580,
    rating: 4.9,
  },
  {
    id: 'soc-4',
    name: 'Bangalore Artisans Cooperative',
    registration_number: 'BAC-KA-09',
    district: 'Bangalore',
    state: 'Karnataka',
    address: 'Jayanagar, Bangalore, Karnataka',
    member_count: 275,
    rating: 4.8,
  },
];

export const INITIAL_WORKERS: WorkerProfile[] = [
  {
    id: 'worker-rajesh-kumar',
    full_name: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    email: 'rajesh.kumar@sharmnexus.coop',
    profile_photo_url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
    society_id: 'soc-1',
    society_name: 'Patna District Labour Society',
    primary_skill: 'Plumber',
    skills: [
      {
        service_category_id: 'cat-plumber',
        service_name: 'Plumber',
        certification_name: 'NSDC Level 4 Certified Master Plumber',
        years_experience: 8,
        is_verified: true,
      },
      {
        service_category_id: 'cat-technician',
        service_name: 'Technician',
        certification_name: 'Water Heater & Geyser Specialist',
        years_experience: 4,
        is_verified: true,
      },
    ],
    years_experience: 8,
    is_verified: true,
    is_available: true,
    verification_status: 'verified',
    avg_rating: 4.8,
    total_jobs_completed: 126,
    address: 'Kankarbagh, Patna, Bihar',
    lat: 25.5941,
    lng: 85.1376,
    approx_distance_km: 2.4,
    hourly_rate: 300,
    workload_score: 35, // Well balanced
    response_time_mins: 20,
    match_score: 94,
    why_recommended: [
      'Strong plumbing skill match (8 yrs experience)',
      'Verified NSDC Level 4 Certification',
      'Nearby (2.4 km away, ~20 min ETA)',
      'Consistently high rating (4.8★ from 126 jobs)',
      'Balanced cooperative workload allocation',
    ],
    bio: 'Certified master plumber with 8 years of experience in residential, commercial leak repairs, bathroom fittings, and piping installations. Member of Patna District Labour Society.',
    service_radius_km: 10,
    reviews: [
      {
        id: 'rev-1',
        customer_name: 'Amit Sharma',
        rating: 5,
        comment: 'Rajesh fixed our kitchen pipe leak in 30 minutes. Very professional, polite, and cooperative-verified rates!',
        date: '3 days ago',
        service_name: 'Plumbing',
      },
      {
        id: 'rev-2',
        customer_name: 'Sunita Verma',
        rating: 5,
        comment: 'Arrived promptly during an emergency leak. Transparent charges without any hidden fees.',
        date: '1 week ago',
        service_name: 'Plumbing',
      },
      {
        id: 'rev-3',
        customer_name: 'Rohan Gupta',
        rating: 4.5,
        comment: 'Great plumbing work and clean finishing. Highly recommended through SharmNexus.',
        date: '2 weeks ago',
        service_name: 'Plumbing',
      },
    ],
  },
  {
    id: 'worker-priya-das',
    full_name: 'Priya Das',
    phone: '+91 98765 43211',
    email: 'priya.das@sharmnexus.coop',
    profile_photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    society_id: 'soc-1',
    society_name: 'Patna District Labour Society',
    primary_skill: 'Electrician',
    skills: [
      {
        service_category_id: 'cat-electrician',
        service_name: 'Electrician',
        certification_name: 'State Electrical Board Grade B Licensed Wireman',
        years_experience: 6,
        is_verified: true,
      },
    ],
    years_experience: 6,
    is_verified: true,
    is_available: true,
    verification_status: 'verified',
    avg_rating: 4.9,
    total_jobs_completed: 98,
    address: 'Boring Road, Patna, Bihar',
    lat: 25.6093,
    lng: 85.1235,
    approx_distance_km: 3.1,
    hourly_rate: 350,
    workload_score: 40,
    response_time_mins: 25,
    match_score: 92,
    why_recommended: [
      'Licensed Electrical Board Wireman Grade B',
      'High rating of 4.9★ with 98 completed tasks',
      'Within 3.1 km radius',
      'Cooperative member in good standing',
    ],
    bio: 'Professional certified electrician specializing in household wiring, inverter installation, MCB tripping resolution, and safety audits.',
    service_radius_km: 12,
    reviews: [
      {
        id: 'rev-4',
        customer_name: 'Meera Sen',
        rating: 5,
        comment: 'Priya resolved a complex short-circuit issue swiftly. Very knowledgeable and thorough with safety checks.',
        date: '5 days ago',
        service_name: 'Electrical',
      },
    ],
  },
  {
    id: 'worker-amit-roy',
    full_name: 'Amit Roy',
    phone: '+91 98765 43212',
    email: 'amit.roy@sharmnexus.coop',
    profile_photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    society_id: 'soc-2',
    society_name: 'Pune Gig Workers Cooperative',
    primary_skill: 'Carpenter',
    skills: [
      {
        service_category_id: 'cat-carpenter',
        service_name: 'Carpenter',
        certification_name: 'Master Modular Woodwork Specialist',
        years_experience: 10,
        is_verified: true,
      },
    ],
    years_experience: 10,
    is_verified: true,
    is_available: true,
    verification_status: 'verified',
    avg_rating: 4.7,
    total_jobs_completed: 142,
    address: 'Kothrud, Pune, Maharashtra',
    lat: 18.5074,
    lng: 73.8077,
    approx_distance_km: 4.2,
    hourly_rate: 400,
    workload_score: 50,
    response_time_mins: 35,
    match_score: 89,
    why_recommended: [
      '10 years seasoned woodworking experience',
      'Specialist in modular furniture and lock repairs',
      'Solid 4.7★ track record over 142 bookings',
    ],
    bio: 'Veteran carpenter with extensive experience in furniture design, hinge adjustments, door installations, and bespoke woodwork repairs.',
    service_radius_km: 15,
    reviews: [
      {
        id: 'rev-5',
        customer_name: 'Kavita Joshi',
        rating: 5,
        comment: 'Repaired our antique wardrobe and fitted new hydraulic kitchen hinges flawlessly.',
        date: '1 week ago',
        service_name: 'Carpentry',
      },
    ],
  },
  {
    id: 'worker-sanjay-shaw',
    full_name: 'Sanjay Shaw',
    phone: '+91 98765 43213',
    email: 'sanjay.shaw@sharmnexus.coop',
    profile_photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    society_id: 'soc-1',
    society_name: 'Patna District Labour Society',
    primary_skill: 'Painter',
    skills: [
      {
        service_category_id: 'cat-painter',
        service_name: 'Painter',
        certification_name: 'Waterproofing & Texture Coating Certified',
        years_experience: 5,
        is_verified: true,
      },
    ],
    years_experience: 5,
    is_verified: true,
    is_available: true,
    verification_status: 'verified',
    avg_rating: 4.6,
    total_jobs_completed: 64,
    address: 'Rajendra Nagar, Patna, Bihar',
    lat: 25.601,
    lng: 85.154,
    approx_distance_km: 1.8,
    hourly_rate: 500,
    workload_score: 25,
    response_time_mins: 20,
    match_score: 88,
    why_recommended: [
      'Close proximity (1.8 km)',
      'Waterproofing certified painter',
      'Fresh capacity available for immediate scheduling',
    ],
    bio: 'Specialist in wall priming, dampness waterproofing, stencil designs, and premium finish painting with safe, low-VOC materials.',
    service_radius_km: 10,
    reviews: [],
  },
  {
    id: 'worker-mousumi-sen',
    full_name: 'Mousumi Sen',
    phone: '+91 98765 43214',
    email: 'mousumi.sen@sharmnexus.coop',
    profile_photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    society_id: 'soc-3',
    society_name: 'Delhi Labour Welfare Federation',
    primary_skill: 'Cleaner',
    skills: [
      {
        service_category_id: 'cat-cleaner',
        service_name: 'Cleaner',
        certification_name: 'Deep Sanitation & Hospital Grade Hygiene Certified',
        years_experience: 4,
        is_verified: true,
      },
    ],
    years_experience: 4,
    is_verified: true,
    is_available: true,
    verification_status: 'verified',
    avg_rating: 4.9,
    total_jobs_completed: 110,
    address: 'Lajpat Nagar, New Delhi',
    lat: 28.5677,
    lng: 77.2433,
    approx_distance_km: 2.0,
    hourly_rate: 250,
    workload_score: 30,
    response_time_mins: 15,
    match_score: 95,
    why_recommended: [
      'Top rated cleaner (4.9★ over 110 homes)',
      'Hospital grade deep sanitation training',
      'Rapid 15-minute response in local zone',
    ],
    bio: 'Dedicated deep cleaning specialist trained in kitchen degreasing, bathroom descaling, sofa extraction, and move-in/move-out sanitation.',
    service_radius_km: 8,
    reviews: [
      {
        id: 'rev-6',
        customer_name: 'Deepak Malhotra',
        rating: 5,
        comment: 'Mousumi did a phenomenal deep clean before Diwali. Everything was sparkling!',
        date: '4 days ago',
        service_name: 'Cleaning',
      },
    ],
  },
  {
    id: 'worker-vikram-singh',
    full_name: 'Vikram Singh',
    phone: '+91 98765 43215',
    email: 'vikram.singh@sharmnexus.coop',
    profile_photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    society_id: 'soc-2',
    society_name: 'Pune Gig Workers Cooperative',
    primary_skill: 'Driver',
    skills: [
      {
        service_category_id: 'cat-driver',
        service_name: 'Driver',
        certification_name: 'Commercial Heavy & Light Transport License + Defensive Driving',
        years_experience: 7,
        is_verified: true,
      },
    ],
    years_experience: 7,
    is_verified: true,
    is_available: true,
    verification_status: 'verified',
    avg_rating: 4.8,
    total_jobs_completed: 215,
    address: 'Baner, Pune, Maharashtra',
    lat: 18.559,
    lng: 73.7868,
    approx_distance_km: 1.5,
    hourly_rate: 300,
    workload_score: 45,
    response_time_mins: 15,
    match_score: 93,
    why_recommended: [
      'Clean driving record with defensive driving badge',
      'Over 215 completed on-demand trips',
      'Very close proximity (1.5 km)',
    ],
    bio: 'Professional driver with manual & automatic transmission expertise. Punctual, familiar with all city routes and expressway navigation.',
    service_radius_km: 25,
    reviews: [],
  },
  {
    id: 'worker-ramesh-patel',
    full_name: 'Ramesh Patel',
    phone: '+91 98765 43216',
    email: 'ramesh.patel@sharmnexus.coop',
    profile_photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    society_id: 'soc-1',
    society_name: 'Patna District Labour Society',
    primary_skill: 'Gardener',
    skills: [
      {
        service_category_id: 'cat-gardener',
        service_name: 'Gardener',
        certification_name: 'Urban Horticulture & Organic Pest Management',
        years_experience: 9,
        is_verified: true,
      },
    ],
    years_experience: 9,
    is_verified: true,
    is_available: true,
    verification_status: 'verified',
    avg_rating: 4.7,
    total_jobs_completed: 83,
    address: 'Bailey Road, Patna, Bihar',
    lat: 25.612,
    lng: 85.098,
    approx_distance_km: 3.5,
    hourly_rate: 200,
    workload_score: 20,
    response_time_mins: 30,
    match_score: 87,
    why_recommended: [
      '9 years experienced gardener',
      'Organic fertilization & terrace garden specialist',
      'Opportunity fairness balance priority',
    ],
    bio: 'Passionate gardener offering lawn mowing, bonsai care, terrace garden setup, and chemical-free pest treatments.',
    service_radius_km: 12,
    reviews: [],
  },
  {
    id: 'worker-manoj-verma',
    full_name: 'Manoj Verma',
    phone: '+91 98765 43217',
    email: 'manoj.verma@sharmnexus.coop',
    profile_photo_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
    society_id: 'soc-3',
    society_name: 'Delhi Labour Welfare Federation',
    primary_skill: 'Technician',
    skills: [
      {
        service_category_id: 'cat-technician',
        service_name: 'Technician',
        certification_name: 'Inverter AC & Smart Appliance Certified Technician',
        years_experience: 8,
        is_verified: true,
      },
    ],
    years_experience: 8,
    is_verified: true,
    is_available: true,
    verification_status: 'verified',
    avg_rating: 4.8,
    total_jobs_completed: 134,
    address: 'Saket, New Delhi',
    lat: 28.5244,
    lng: 77.2167,
    approx_distance_km: 2.8,
    hourly_rate: 450,
    workload_score: 35,
    response_time_mins: 25,
    match_score: 91,
    why_recommended: [
      'Certified AC & Refrigerator specialist',
      '8 years technical diagnosing experience',
      'Genuine spare parts guarantee via cooperative society',
    ],
    bio: 'Expert repair technician for Inverter AC gas refilling, PCB diagnostics, washing machine tub cleaning, and microwave repairs.',
    service_radius_km: 15,
    reviews: [],
  },
  {
    id: 'worker-anita-rao',
    full_name: 'Dr. Anita Rao',
    phone: '+91 98765 43218',
    email: 'anita.rao@sharmnexus.coop',
    profile_photo_url: 'https://images.unsplash.com/photo-1594824813583-0599a0709f19?w=400&auto=format&fit=crop&q=80',
    society_id: 'soc-4',
    society_name: 'Bangalore Artisans Cooperative',
    primary_skill: 'Caregiver',
    skills: [
      {
        service_category_id: 'cat-caregiver',
        service_name: 'Caregiver',
        certification_name: 'Certified Geriatric Nursing & Emergency First Aid',
        years_experience: 6,
        is_verified: true,
      },
    ],
    years_experience: 6,
    is_verified: true,
    is_available: true,
    verification_status: 'verified',
    avg_rating: 5.0,
    total_jobs_completed: 72,
    address: 'Indiranagar, Bangalore, Karnataka',
    lat: 12.9784,
    lng: 77.6408,
    approx_distance_km: 2.2,
    hourly_rate: 600,
    workload_score: 25,
    response_time_mins: 20,
    match_score: 96,
    why_recommended: [
      'Flawless 5.0★ rating over 72 patient care assignments',
      'Certified Nurse & Geriatric Specialist',
      'Compassionate, verified cooperative caregiver',
    ],
    bio: 'Dedicated nursing professional and elderly caregiver trained in mobility assistance, medication monitoring, vital checks, and post-surgery care.',
    service_radius_km: 10,
    reviews: [],
  },
  {
    id: 'worker-sunita-devi',
    full_name: 'Sunita Devi',
    phone: '+91 98765 43219',
    email: 'sunita.devi@sharmnexus.coop',
    profile_photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    society_id: 'soc-1',
    society_name: 'Patna District Labour Society',
    primary_skill: 'Domestic Helper',
    skills: [
      {
        service_category_id: 'cat-domestic-helper',
        service_name: 'Domestic Helper',
        certification_name: 'Certified Household Management & Food Hygiene',
        years_experience: 5,
        is_verified: true,
      },
    ],
    years_experience: 5,
    is_verified: true,
    is_available: true,
    verification_status: 'verified',
    avg_rating: 4.8,
    total_jobs_completed: 155,
    address: 'Ashok Nagar, Patna, Bihar',
    lat: 25.589,
    lng: 85.148,
    approx_distance_km: 1.2,
    hourly_rate: 250,
    workload_score: 30,
    response_time_mins: 15,
    match_score: 94,
    why_recommended: [
      'Very close (1.2 km away)',
      '155 successfully completed household service requests',
      'Verified background & cooperative society backing',
    ],
    bio: 'Experienced household assistant skilled in daily cooking, utensil sanitation, dust dusting, and home organization.',
    service_radius_km: 8,
    reviews: [],
  },
  // Extra Plumber for comparison
  {
    id: 'worker-mahesh-yadav',
    full_name: 'Mahesh Yadav',
    phone: '+91 98765 43220',
    email: 'mahesh.yadav@sharmnexus.coop',
    profile_photo_url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80',
    society_id: 'soc-1',
    society_name: 'Patna District Labour Society',
    primary_skill: 'Plumber',
    skills: [
      {
        service_category_id: 'cat-plumber',
        service_name: 'Plumber',
        certification_name: 'Sanitary Pipeline Technician',
        years_experience: 4,
        is_verified: true,
      },
    ],
    years_experience: 4,
    is_verified: true,
    is_available: true,
    verification_status: 'verified',
    avg_rating: 4.6,
    total_jobs_completed: 58,
    address: 'Patliputra Colony, Patna, Bihar',
    lat: 25.623,
    lng: 85.112,
    approx_distance_km: 4.1,
    hourly_rate: 300,
    workload_score: 20,
    response_time_mins: 35,
    match_score: 86,
    why_recommended: [
      'Plumbing Sanitary Specialist',
      '4 years verified experience',
      'Available for immediate assignment',
    ],
    bio: 'Reliable sanitary plumber for tap repairs, tank cleaning, drainage blockage removal, and pipe fittings.',
    service_radius_km: 10,
    reviews: [],
  },
];

export const INITIAL_DEMO_BOOKINGS: Booking[] = [
  {
    id: 'SN-2026-8941',
    customer_id: 'demo-customer-1',
    customer_name: 'Priya Sharma',
    customer_phone: '+91 99887 76655',
    worker_id: 'worker-rajesh-kumar',
    worker: INITIAL_WORKERS[0],
    service_category_id: 'cat-plumber',
    service_name: 'Plumber',
    service_icon: 'Droplet',
    booking_type: 'emergency',
    status: 'completed',
    urgency: 'emergency',
    description: 'Kitchen sink pipe is leaking heavily under the counter. Water is dripping onto the floor.',
    address: 'Flat 402, Green Valley Apartments, Kankarbagh Main Rd',
    city: 'Patna',
    lat: 25.594,
    lng: 85.138,
    scheduled_at: new Date(Date.now() - 86400000).toISOString(),
    time_slot: 'Immediate (Emergency)',
    estimated_price: 450,
    otp: '4829',
    payment_status: 'completed',
    payment_method: 'UPI / Cash after service',
    created_at: new Date(Date.now() - 86400000 - 3600000).toISOString(),
  },
  {
    id: 'SN-2026-7812',
    customer_id: 'demo-customer-1',
    customer_name: 'Priya Sharma',
    customer_phone: '+91 99887 76655',
    worker_id: 'worker-priya-das',
    worker: INITIAL_WORKERS[1],
    service_category_id: 'cat-electrician',
    service_name: 'Electrician',
    service_icon: 'Zap',
    booking_type: 'scheduled',
    status: 'completed',
    urgency: 'normal',
    description: 'Install new ceiling fan in living room and fix master bedroom switch board.',
    address: 'Flat 402, Green Valley Apartments, Kankarbagh Main Rd',
    city: 'Patna',
    lat: 25.594,
    lng: 85.138,
    scheduled_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    time_slot: '10:00 AM - 12:00 PM',
    estimated_price: 350,
    final_price: 350,
    otp: '1192',
    payment_status: 'completed',
    payment_method: 'Online UPI',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    completed_at: new Date(Date.now() - 86400000 * 3 + 7200000).toISOString(),
    rating: 5,
    review: 'Priya was extremely polite and finished the fan installation within 45 minutes. Super clean job!',
  },
];
