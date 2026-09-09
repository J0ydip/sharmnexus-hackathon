'use client';

import React, { useState } from 'react';
import { submitSupportQueryAction } from '@/app/actions/support';
import { toast } from 'sonner';
import {
  HelpCircle,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Building2,
  User,
  Wrench,
} from 'lucide-react';

export function HelpSupportSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'Customer' | 'Worker' | 'Cooperative' | 'Other'>('Customer');
  const [subject, setSubject] = useState('Booking or Service Issue');
  const [bookingId, setBookingId] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<{ id: string; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !message.trim()) {
      toast.error('Please enter your name and describe your query.');
      return;
    }

    if (!email.trim() && !phone.trim()) {
      toast.error('Please provide either an email or phone number for our response.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitSupportQueryAction({
        name,
        email,
        phone,
        role,
        subject,
        message,
        bookingId: bookingId.trim() || undefined,
      });

      if (res.error) {
        toast.error(res.error);
      } else if (res.success && res.ticketId) {
        setSubmittedTicket({
          id: res.ticketId,
          message: res.message,
        });
        toast.success(`Support Ticket #${res.ticketId} created!`);
        // Reset form inputs
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
        setBookingId('');
      }
    } catch (err: any) {
      console.error('Error submitting support query:', err);
      toast.error('Failed to submit query. Please try again or call our helpline.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="support" className="support-section py-16 sm:py-20 bg-[#fbf7ef] border-t border-[#e6dcd0] scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f5dfad]/40 border border-[#e6aa3b]/30 text-[#24172f] text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-[#d96f4d]" />
            <span>Help &amp; Support</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#24172f] tracking-tight font-serif">
            Need assistance or have a query?<br />
            <span className="text-[#d96f4d] italic font-normal">Our support team is here to help you.</span>
          </h2>
          <p className="mt-3 text-base text-[#776e79] max-w-2xl mx-auto">
            Have a question about a booking, need help with your account, or want to report an issue? Send us your message and we will assist you right away.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Helplines & Support Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#e6dcd0] shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-[#24172f] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#8ba58b]" />
                Direct Support Channels
              </h3>
              <p className="text-xs text-[#776e79] leading-relaxed">
                We are committed to fair and prompt support. Every inquiry is reviewed directly by our team.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#fbf7ef] border border-[#e6dcd0]">
                  <div className="w-9 h-9 rounded-lg bg-[#24172f] text-white flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#776e79] block">Helpline Number</span>
                    <strong className="text-sm text-[#24172f] font-mono">+91 11 2345 6789</strong>
                    <span className="text-[11px] text-[#8ba58b] block mt-0.5">Mon – Sat, 8:00 AM – 8:00 PM IST</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#fbf7ef] border border-[#e6dcd0]">
                  <div className="w-9 h-9 rounded-lg bg-[#d96f4d] text-white flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#776e79] block">Email Support</span>
                    <strong className="text-sm text-[#24172f]">support@shramnexus.com</strong>
                    <span className="text-[11px] text-[#776e79] block mt-0.5">Response within 2 to 4 hours</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#fbf7ef] border border-[#e6dcd0]">
                  <div className="w-9 h-9 rounded-lg bg-[#8ba58b] text-white flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#776e79] block">Payment Protection</span>
                    <span className="text-xs text-[#24172f] font-medium leading-tight block">
                      If you ever have an issue with a job, your payment is held safely until the matter is resolved.
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick FAQ summary */}
              <div className="pt-4 border-t border-[#e6dcd0] space-y-2.5">
                <span className="text-[11px] font-bold text-[#776e79] uppercase tracking-wider block">Common Topics</span>
                <div className="flex flex-wrap gap-1.5 text-xs text-[#24172f]">
                  <span className="px-2.5 py-1 rounded-md bg-gray-100 border border-gray-200">OTP help</span>
                  <span className="px-2.5 py-1 rounded-md bg-gray-100 border border-gray-200">Worker verification</span>
                  <span className="px-2.5 py-1 rounded-md bg-gray-100 border border-gray-200">Tool bank questions</span>
                  <span className="px-2.5 py-1 rounded-md bg-gray-100 border border-gray-200">Refunds &amp; Payments</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Query / Request Submission Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#e6dcd0] shadow-sm">
              {submittedTicket ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-[#e2eee4] text-[#8ba58b] rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#8ba58b] uppercase tracking-wider">Query Received</span>
                    <h3 className="text-2xl font-bold text-[#24172f] font-serif mt-1">Ticket #{submittedTicket.id}</h3>
                    <p className="text-xs text-[#776e79] max-w-md mx-auto mt-2 leading-relaxed">
                      {submittedTicket.message}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#fbf7ef] border border-[#e6dcd0] text-left max-w-md mx-auto text-xs space-y-1 text-[#24172f]">
                    <div className="flex justify-between">
                      <span className="text-[#776e79]">Status:</span>
                      <strong className="text-amber-600">Under Review by Support Team</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#776e79]">Expected Response:</span>
                      <strong className="text-emerald-700">Within 2 to 4 hours</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubmittedTicket(null)}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#24172f] text-white text-xs font-bold hover:bg-[#3d2b48] transition-colors"
                  >
                    Submit Another Query
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  <div>
                    <h3 className="text-xl font-bold text-[#24172f] font-serif">Send Us a Message</h3>
                    <p className="text-xs text-[#776e79] mt-0.5">
                      Fill out the form below and our team will get back to you promptly.
                    </p>
                  </div>

                  {/* Role Selector */}
                  <div>
                    <label className="block text-xs font-bold text-[#24172f] uppercase tracking-wider mb-2">
                      I am submitting this as:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['Customer', 'Worker', 'Cooperative', 'Other'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                            role === r
                              ? 'bg-[#24172f] text-white border-[#24172f] shadow-xs'
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {r === 'Customer' && <User className="w-3.5 h-3.5" />}
                          {r === 'Worker' && <Wrench className="w-3.5 h-3.5" />}
                          {r === 'Cooperative' && <Building2 className="w-3.5 h-3.5" />}
                          {r === 'Other' && <MessageSquare className="w-3.5 h-3.5" />}
                          <span>{r}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name and Phone/Email Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-[#24172f] mb-1">
                        Your Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ramesh Chandra"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6dcd0] text-sm focus:outline-none focus:ring-2 focus:ring-[#e6aa3b] bg-[#fbf7ef]/40"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#24172f] mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6dcd0] text-sm focus:outline-none focus:ring-2 focus:ring-[#e6aa3b] bg-[#fbf7ef]/40"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-[#24172f] mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. ramesh@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6dcd0] text-sm focus:outline-none focus:ring-2 focus:ring-[#e6aa3b] bg-[#fbf7ef]/40"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#24172f] mb-1">
                        Related Booking ID <span className="text-[10px] text-[#776e79]">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={bookingId}
                        onChange={(e) => setBookingId(e.target.value)}
                        placeholder="e.g. #SNX-992 or REQ-001"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6dcd0] text-sm focus:outline-none focus:ring-2 focus:ring-[#e6aa3b] bg-[#fbf7ef]/40"
                      />
                    </div>
                  </div>

                  {/* Subject Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-[#24172f] mb-1">
                      Query Subject / Issue Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6dcd0] text-sm focus:outline-none focus:ring-2 focus:ring-[#e6aa3b] bg-[#fbf7ef]/40"
                    >
                      <option value="Booking or Service Issue">Booking or Service Quality Issue</option>
                      <option value="Payment or Escrow Dispute">Payment or Refund Help</option>
                      <option value="Worker Verification Assistance">Worker Verification &amp; Account Help</option>
                      <option value="Tool Bank Query">Tool Bank Questions</option>
                      <option value="Cooperative Onboarding Inquiry">New Cooperative Registration</option>
                      <option value="General Feedback or Other">General Inquiry or Feedback</option>
                    </select>
                  </div>

                  {/* Message Field */}
                  <div>
                    <label className="block text-xs font-semibold text-[#24172f] mb-1">
                      Describe your query or request in detail <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please describe your query or request in detail..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6dcd0] text-sm focus:outline-none focus:ring-2 focus:ring-[#e6aa3b] bg-[#fbf7ef]/40"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-6 rounded-xl bg-[#24172f] text-white font-bold text-sm shadow-md hover:bg-[#3d2b48] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Sending your message...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 text-[#e6aa3b]" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                    <span className="text-[11px] text-gray-500 text-center block mt-2">
                      🔒 Your details are kept safe and only used to assist you with your request.
                    </span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
