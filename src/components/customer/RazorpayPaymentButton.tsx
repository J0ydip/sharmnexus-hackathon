'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createPaymentOrder, verifyAndRecordPayment } from '@/app/actions/payments';
import { CreditCard, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

interface RazorpayPaymentButtonProps {
  bookingId: string;
  amount: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  serviceName?: string;
  onPaymentSuccess?: (paymentData: any) => void;
  className?: string;
  size?: 'default' | 'sm' | 'lg';
}

export function RazorpayPaymentButton({
  bookingId,
  amount,
  customerName = 'Valued Customer',
  customerPhone = '+91 99887 76655',
  customerEmail = 'customer@sharmnexus.org',
  serviceName = 'Cooperative Service',
  onPaymentSuccess,
  className = '',
  size = 'default',
}: RazorpayPaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Load Razorpay checkout script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => console.warn('Could not load live Razorpay checkout SDK');
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePayment = async () => {
    setLoading(true);

    try {
      // 1. Create order on server
      const orderRes = await createPaymentOrder(bookingId, amount);

      if (!orderRes || !orderRes.success) {
        toast.error('Could not initialize payment order');
        setLoading(false);
        return;
      }

      // 2. Check if running with real Razorpay credentials and SDK is available
      const isRealRazorpay = !orderRes.isMock && scriptLoaded && typeof (window as any).Razorpay !== 'undefined';

      if (isRealRazorpay) {
        const options = {
          key: orderRes.keyId,
          amount: orderRes.amount,
          currency: orderRes.currency || 'INR',
          name: 'SharmNexus Cooperative',
          description: `Payment for ${serviceName} (#${bookingId})`,
          image: 'https://ui-avatars.com/api/?name=SharmNexus&background=059669&color=fff',
          order_id: orderRes.orderId,
          handler: async function (response: any) {
            toast.loading('Verifying payment and cooperative settlement...');
            const recordRes = await verifyAndRecordPayment({
              bookingId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              amount,
              method: 'online',
            });

            if (recordRes.success) {
              toast.dismiss();
              toast.success('Payment verified! 85% credited to worker, 5% to welfare fund.');
              if (onPaymentSuccess) {
                onPaymentSuccess(recordRes.data);
              }
            } else {
              toast.error(recordRes.error || 'Payment verification failed');
            }
          },
          prefill: {
            name: customerName,
            email: customerEmail,
            contact: customerPhone,
          },
          theme: {
            color: '#059669',
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (resp: any) {
          toast.error(`Payment failed: ${resp.error.description}`);
        });
        rzp.open();
      } else {
        // Simulated / Sandbox Mode (Demo Environment)
        toast.info('Opening Razorpay Cooperative Checkout Sandbox...');
        
        // Simulate a brief gateway handshake
        await new Promise((resolve) => setTimeout(resolve, 800));

        const mockPaymentId = `pay_sim_${Date.now().toString().slice(-8)}`;
        const recordRes = await verifyAndRecordPayment({
          bookingId,
          razorpayOrderId: orderRes.orderId || `order_${Date.now()}`,
          razorpayPaymentId: mockPaymentId,
          amount,
          method: 'upi_mock',
        });

        if (recordRes.success) {
          toast.success(
            `₹${amount} paid successfully via UPI! 85% directly allocated to worker.`
          );
          if (onPaymentSuccess) {
            onPaymentSuccess(recordRes.data);
          }
        } else {
          toast.error('Could not settle payment');
        }
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      toast.error('An unexpected error occurred during payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handlePayment}
      disabled={loading}
      size={size}
      className={`bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 ${className}`}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Processing Payment...</span>
        </>
      ) : (
        <>
          <CreditCard className="w-4 h-4" />
          <span>Pay ₹{amount} (UPI / Card)</span>
          <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
        </>
      )}
    </Button>
  );
}
