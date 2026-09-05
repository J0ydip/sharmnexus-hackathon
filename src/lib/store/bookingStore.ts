import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ServiceCategory,
  WorkerProfile,
  Booking,
  INITIAL_SERVICE_CATEGORIES,
  INITIAL_WORKERS,
  INITIAL_DEMO_BOOKINGS,
} from '@/lib/data/mockData';
import { calculateFairMatchScore } from '@/lib/data/matchingAlgorithm';

export interface BookingDraft {
  serviceCategoryId: string;
  serviceCategoryName: string;
  serviceIcon: string;
  basePrice: number;
  emergencyMultiplier: number;
  description: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  date: string;
  timeSlot: string;
  bookingType: 'scheduled' | 'on_demand' | 'emergency';
  urgency: 'normal' | 'urgent' | 'emergency';
  imageUrl?: string;
  selectedWorkerId?: string;
  selectedWorker?: WorkerProfile;
  estimatedPrice: number;
}

const DEFAULT_DRAFT: BookingDraft = {
  serviceCategoryId: 'cat-plumber',
  serviceCategoryName: 'Plumber',
  serviceIcon: 'Droplet',
  basePrice: 300,
  emergencyMultiplier: 1.5,
  description: 'Kitchen sink pipe is leaking.',
  address: 'Flat 402, Green Valley Apartments, Kankarbagh Main Rd',
  city: 'Patna',
  lat: 25.594,
  lng: 85.138,
  date: new Date().toISOString().split('T')[0],
  timeSlot: 'Morning (09:00 AM - 12:00 PM)',
  bookingType: 'scheduled',
  urgency: 'normal',
  imageUrl: '',
  selectedWorkerId: undefined,
  selectedWorker: undefined,
  estimatedPrice: 300,
};

interface BookingStoreState {
  categories: ServiceCategory[];
  workers: WorkerProfile[];
  bookings: Booking[];
  draft: BookingDraft;
  
  // Actions
  setDraft: (partial: Partial<BookingDraft>) => void;
  resetDraft: () => void;
  selectServiceForBooking: (category: ServiceCategory) => void;
  selectWorkerForBooking: (worker: WorkerProfile) => void;
  createBookingFromDraft: () => Booking;
  updateBookingStatus: (bookingId: string, newStatus: Booking['status']) => void;
  setBookingPaymentStatus: (bookingId: string, paymentStatus: 'pending' | 'completed', method?: string) => void;
  rateBooking: (bookingId: string, rating: number, review: string) => void;
  getBookingById: (bookingId: string) => Booking | undefined;
  getMatchedWorkers: (categoryId?: string, urgency?: 'normal' | 'urgent' | 'emergency') => WorkerProfile[];
}

export const useBookingStore = create<BookingStoreState>()(
  persist(
    (set, get) => ({
      categories: INITIAL_SERVICE_CATEGORIES,
      workers: INITIAL_WORKERS,
      bookings: INITIAL_DEMO_BOOKINGS,
      draft: DEFAULT_DRAFT,

      setDraft: (partial) => {
        set((state) => {
          const updatedDraft = { ...state.draft, ...partial };
          
          // Recompute estimated price
          let multiplier = 1.0;
          if (updatedDraft.urgency === 'urgent') {
            multiplier = 1.25;
          } else if (updatedDraft.urgency === 'emergency') {
            multiplier = updatedDraft.emergencyMultiplier || 1.5;
          }
          
          updatedDraft.estimatedPrice = Math.round(updatedDraft.basePrice * multiplier);
          return { draft: updatedDraft };
        });
      },

      resetDraft: () => {
        set({ draft: DEFAULT_DRAFT });
      },

      selectServiceForBooking: (category: ServiceCategory) => {
        set((state) => ({
          draft: {
            ...state.draft,
            serviceCategoryId: category.id,
            serviceCategoryName: category.name,
            serviceIcon: category.icon_url,
            basePrice: category.base_price,
            emergencyMultiplier: category.emergency_multiplier,
            estimatedPrice: category.base_price,
            selectedWorkerId: undefined,
            selectedWorker: undefined,
          },
        }));
      },

      selectWorkerForBooking: (worker: WorkerProfile) => {
        set((state) => ({
          draft: {
            ...state.draft,
            selectedWorkerId: worker.id,
            selectedWorker: worker,
          },
        }));
      },

      createBookingFromDraft: () => {
        const { draft, bookings } = get();
        const newBookingId = `SN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();

        const newBooking: Booking = {
          id: newBookingId,
          customer_id: 'customer-auth-user',
          customer_name: 'Priya Sharma',
          customer_phone: '+91 99887 76655',
          worker_id: draft.selectedWorkerId || 'worker-rajesh-kumar',
          worker: draft.selectedWorker || get().workers.find((w) => w.id === draft.selectedWorkerId) || get().workers[0],
          service_category_id: draft.serviceCategoryId,
          service_name: draft.serviceCategoryName,
          service_icon: draft.serviceIcon,
          booking_type: draft.bookingType,
          status: 'requested',
          urgency: draft.urgency,
          description: draft.description,
          address: draft.address,
          city: draft.city,
          lat: draft.lat,
          lng: draft.lng,
          scheduled_at: `${draft.date} ${draft.timeSlot}`,
          time_slot: draft.timeSlot,
          estimated_price: draft.estimatedPrice,
          image_url: draft.imageUrl,
          otp: randomOtp,
          payment_status: 'pending',
          payment_method: 'Pay after service (Cash / UPI)',
          created_at: new Date().toISOString(),
        };

        set({
          bookings: [newBooking, ...bookings],
        });

        return newBooking;
      },

      updateBookingStatus: (bookingId: string, newStatus: Booking['status']) => {
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === bookingId
              ? {
                  ...b,
                  status: newStatus,
                  started_at: newStatus === 'in_progress' ? new Date().toISOString() : b.started_at,
                  completed_at: newStatus === 'completed' ? new Date().toISOString() : b.completed_at,
                  final_price: newStatus === 'completed' ? b.estimated_price : b.final_price,
                }
              : b
          ),
        }));
      },

      setBookingPaymentStatus: (bookingId: string, paymentStatus: 'pending' | 'completed', method?: string) => {
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === bookingId
              ? {
                  ...b,
                  payment_status: paymentStatus,
                  payment_method: method || b.payment_method,
                }
              : b
          ),
        }));
      },

      rateBooking: (bookingId: string, rating: number, review: string) => {
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === bookingId ? { ...b, rating, review } : b
          ),
        }));
      },

      getBookingById: (bookingId: string) => {
        return get().bookings.find((b) => b.id === bookingId);
      },

      getMatchedWorkers: (categoryId?: string, urgency?: 'normal' | 'urgent' | 'emergency') => {
        const { workers, categories } = get();
        const targetCat = categories.find((c) => c.id === categoryId);
        const categoryName = targetCat ? targetCat.name : categoryId;

        return workers
          .map((worker) => {
            const match = calculateFairMatchScore(worker, {
              categoryId,
              categoryName,
              urgency,
            });
            return {
              ...worker,
              match_score: match.totalScore,
              why_recommended: match.whyHighlights,
            };
          })
          .sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
      },
    }),
    {
      name: 'sharmnexus-customer-store-v2',
    }
  )
);
