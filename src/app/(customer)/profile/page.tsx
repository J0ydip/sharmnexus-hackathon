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

  const [fullName, setFullName] = useState('Priya Sharma');
  const [email, setEmail] = useState('priya.sharma@example.com');
  const [phone, setPhone] = useState('+91 99887 76655');
  const [address, setAddress] = useState('Flat 402, Green Valley Apartments, Kankarbagh Main Rd, Patna, Bihar');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setEmail(session.user.email || 'priya.sharma@example.com');
          if (session.user.user_metadata?.full_name) {
            setFullName(session.user.user_metadata.full_name);
          }
        }
      } catch (e) {
        // fallback
      }
    }
    loadUser();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
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

  return (
    <div className="min-h-screen bg-gray-50/70 pb-20 sm:pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white pt-8 pb-10 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-2xl border-2 border-emerald-400 shadow-md">
              {fullName[0]?.toUpperCase() || 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">{fullName}</h1>
                <span className="bg-emerald-500/30 text-emerald-200 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/40">
                  ✓ Verified Customer
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
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
            <div className="text-xl font-black text-emerald-700 mt-0.5">100% Fair</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs text-center">
            <span className="text-[10px] text-gray-400 font-medium uppercase">Community Trust</span>
            <div className="text-xl font-black text-amber-600 mt-0.5">5.0 ★</div>
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
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
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
                defaultValue="Patna, Bihar"
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
                className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50/50 disabled:opacity-75"
              />
            </div>
          </form>
        </div>

        {/* Cooperative Social Impact Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-200/80 text-xs text-emerald-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Heart className="w-4 h-4 text-emerald-600 fill-current" />
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
