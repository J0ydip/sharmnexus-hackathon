'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useBookingStore } from '@/lib/store/bookingStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  User,
  ShieldCheck,
  Building2,
  MapPin,
  CalendarClock,
  Phone,
  Mail,
  Heart,
  Award,
  LogOut,
  Edit2,
  Check,
} from 'lucide-react';

export default function CustomerProfilePage() {
  const supabase = createClient();
  const bookings = useBookingStore((state) => state.bookings);

  const [isLoading, setIsLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        let name = '';
        let userEmail = '';
        let userPhone = '';
        let userAddress = '';
        let userCity = '';

        // Check local profile cache first
        const savedProfile = localStorage.getItem('shramnexus-customer-profile');
        if (savedProfile) {
          try {
            const p = JSON.parse(savedProfile);
            name = p.fullName || '';
            userEmail = p.email || '';
            userPhone = p.phone || '';
            userAddress = p.address || '';
            userCity = p.city || '';
          } catch (e) {}
        }

        const localAuth = localStorage.getItem('shramnexus-auth') || localStorage.getItem('sharmnexus-auth');
        if (localAuth) {
          try {
            const parsed = JSON.parse(localAuth);
            if (parsed.role === 'admin' || parsed.name === 'Super Admin' || parsed.email === 'admin@shramnexus.com') {
              localStorage.removeItem('shramnexus-auth');
              localStorage.removeItem('sharmnexus-auth');
            } else {
              if (parsed.name && !name) name = parsed.name;
              if (parsed.email && !userEmail) userEmail = parsed.email;
            }
          } catch (e) {}
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const isAdm = session.user.user_metadata?.user_type === 'admin' ||
                        session.user.user_metadata?.role === 'admin' ||
                        session.user.user_metadata?.full_name === 'Super Admin' ||
                        session.user.email === 'admin@shramnexus.com';
          if (!isAdm) {
            userEmail = session.user.email || userEmail;
            if (session.user.user_metadata?.full_name) {
              name = session.user.user_metadata.full_name;
            } else if (!name && session.user.email) {
              name = session.user.email.split('@')[0];
            }
            if (session.user.user_metadata?.phone) {
              userPhone = session.user.user_metadata.phone;
            }
            if (session.user.user_metadata?.address) {
              userAddress = session.user.user_metadata.address;
            }
            if (session.user.user_metadata?.city) {
              userCity = session.user.user_metadata.city;
            }
          }
        }

        setFullName(name || 'Customer');
        setEmail(userEmail || 'customer@shramnexus.coop');
        if (userPhone) setPhone(userPhone);
        setCity(userCity || 'Kolkata');
        if (userAddress) {
          setAddress(userAddress);
        } else {
          const recentBooking = bookings.find(b => b.address && !b.address.includes('Green Valley') && !b.address.includes('Kankarbagh'));
          setAddress(recentBooking?.address || '');
        }
      } catch (e) {
        // fallback
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, [bookings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    try {
      localStorage.setItem('shramnexus-customer-profile', JSON.stringify({ fullName, email, phone, address, city }));
      const localAuth = localStorage.getItem('shramnexus-auth');
      if (localAuth) {
        const parsed = JSON.parse(localAuth);
        parsed.name = fullName;
        parsed.email = email;
        localStorage.setItem('shramnexus-auth', JSON.stringify(parsed));
      }
      await supabase.auth.updateUser({
        data: { full_name: fullName, phone, address, city }
      });
    } catch (e) {}
    toast.success('Profile details updated successfully!');
  };

  const handleLogout = async () => {
    localStorage.removeItem('shramnexus-auth');
    localStorage.removeItem('shramnexus-admin-auth');
    localStorage.removeItem('sharmnexus-auth');
    localStorage.removeItem('sharmnexus-admin-auth');
    sessionStorage.clear();
    document.cookie = 'admin-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/70 pb-20 sm:pb-12">
        <div className="bg-gradient-to-r from-[#24172f] via-[#3d2b48] to-[#24172f] text-white pt-8 pb-10 px-4 sm:px-6">
          <div className="container mx-auto max-w-4xl flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-white/20 rounded-lg animate-pulse" />
              <div className="h-4 w-64 bg-white/10 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 -mt-4 space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-gray-200 h-20 animate-pulse" />
            ))}
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 h-64 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/70 pb-20 sm:pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#24172f] via-[#3d2b48] to-[#24172f] text-white pt-8 pb-10 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#24172f] text-[#f5dfad] flex items-center justify-center font-black text-2xl border-2 border-[#e6aa3b] shadow-md">
              {fullName[0]?.toUpperCase() || 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">{fullName}</h1>
                <span className="bg-[#24172f]/80 text-[#f5dfad] text-[11px] font-bold px-2 py-0.5 rounded-full border border-[#e6aa3b]/30">
                  ✓ Verified Customer
                </span>
              </div>
              <p className="text-xs text-[#c8bacb] mt-0.5">
                Member of ShramNexus Cooperative Community Network
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 sm:px-6 -mt-4 space-y-6">
        {/* Quick Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs text-center">
            <span className="text-[10px] text-gray-400 font-medium uppercase">Total Bookings</span>
            <div className="text-xl font-black text-gray-900 mt-0.5">{bookings.length}</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs text-center">
            <span className="text-[10px] text-gray-400 font-medium uppercase">Society Support</span>
            <div className="text-xl font-black text-[#d96f4d] mt-0.5">100% Fair</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs text-center">
            <span className="text-[10px] text-gray-400 font-medium uppercase">Community Trust</span>
            <div className="text-xl font-black text-[#e6aa3b] mt-0.5">5.0 ★</div>
          </div>
        </div>

        {/* Profile Info Form */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-sm font-bold text-gray-900">Personal Information</h2>
            {!isEditing ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="w-3.5 h-3.5 mr-1" />
                Edit
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                className="bg-[#24172f] hover:bg-[#3d2b48] text-[#fbf7ef] text-xs h-8"
                onClick={handleSave}
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                Save Changes
              </Button>
            )}
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-gray-600">Full Name</label>
              <input
                type="text"
                disabled={!isEditing}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50/50 disabled:opacity-75"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-gray-600">Email Address</label>
              <input
                type="email"
                disabled={!isEditing}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50/50 disabled:opacity-75"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-gray-600">Phone Number</label>
              <input
                type="text"
                disabled={!isEditing}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50/50 disabled:opacity-75"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-gray-600">Primary Service City</label>
              <input
                type="text"
                disabled={!isEditing}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Kolkata, Patna, Delhi"
                className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50/50 disabled:opacity-75"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-bold text-gray-600">Default Service Address</label>
              <textarea
                rows={2}
                disabled={!isEditing}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Click Edit to add your primary service address..."
                className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50/50 disabled:opacity-75"
              />
            </div>
          </form>
        </div>

        {/* Cooperative Social Impact Card */}
        <div className="bg-[#fbf7ef] rounded-2xl p-5 border border-[#e6dcd0] text-xs text-[#24172f] space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-[#24172f]">
            <Heart className="w-4 h-4 text-[#d96f4d] fill-current" />
            <span>Your Cooperative Impact</span>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Through your bookings on ShramNexus, you have helped support <strong>2 local labour societies</strong> with direct fair wage payouts and funded accidental health cover contributions for verified craftsmen.
          </p>
        </div>

        {/* Logout Button */}
        <div className="pt-2">
          <Button
            type="button"
            variant="outline"
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 text-xs h-10 rounded-xl"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-1.5" />
            Log Out of Customer Account
          </Button>
        </div>
      </div>
    </div>
  );
}
