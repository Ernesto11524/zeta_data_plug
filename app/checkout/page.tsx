'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CURRENCY } from '@/app/constants/theme';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

const checkoutSchema = z.object({
  customerPhone: z.string()
    .regex(/^\d{10}$/, 'Phone must be 10 digits'),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface DataPackage {
  id: string;
  name: string;
  amount: string;
  price: number;
}

interface Network {
  id: string;
  name: string;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageId = searchParams.get('packageId');
  const networkId = searchParams.get('networkId');

  const [pkg, setPkg] = useState<DataPackage | null>(null);
  const [network, setNetwork] = useState<Network | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paystackKey, setPaystackKey] = useState<string>('');
  const [error, setError] = useState<string>('');
  const errorRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const phoneNumber = watch('customerPhone');

  // Auto-scroll to error/status message whenever it changes
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [error]);

  useEffect(() => {
    if (packageId && networkId) {
      fetchData();
    }
  }, [packageId, networkId]);

  useEffect(() => {
    // Load Paystack script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    document.body.appendChild(script);

    // Fetch Paystack settings
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        if (response.ok) {
          const data = await response.json();
          if (data.settings?.paystackPublicKey) {
            setPaystackKey(data.settings.paystackPublicKey);
          }
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);

  const fetchData = async () => {
    try {
      const pkgResponse = await fetch(`/api/admin/packages?networkId=${networkId}`);
      if (pkgResponse.ok) {
        const pkgData = await pkgResponse.json();
        const found = pkgData.packages?.find((p: DataPackage) => p.id === packageId);
        setPkg(found || null);
      }

      const netResponse = await fetch(`/api/admin/networks?id=${networkId}`);
      if (netResponse.ok) {
        const netData = await netResponse.json();
        const found = netData.networks?.find((n: Network) => n.id === networkId);
        setNetwork(found || null);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (!pkg || !network || !paystackKey) {
      setError('❌ Payment system not configured. Please try again later.');
      return;
    }
    setError('');
    setIsProcessing(true);

    try {
      // Initialize Paystack payment
      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: 'customer@zetadata.com',
        amount: Math.round(pkg.price * 100), // Convert to cents
        currency: 'GHS',
        ref: `ZETA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        onClose: () => {
          setIsProcessing(false);
          setError('Payment cancelled. You can try again.');
        },
        callback: (response: any) => {
          // Paystack V1 uses "callback" not "onSuccess" — wrong name = function never called
          setError('✅ Payment confirmed! Saving your order...');

          fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customerPhone: data.customerPhone,
              networkId: network.id,
              packageId: pkg.id,
              amount: pkg.price,
              paymentReference: response.reference,
              paymentStatus: 'completed',
              status: 'processing',
            }),
          })
            .then((res) => {
              if (res.ok || res.status === 409) {
                setIsProcessing(false);
                setError('✅ Order placed successfully! Redirecting...');
                setTimeout(() => router.push('/shop'), 2000);
              } else {
                return res.json().then((errData) => {
                  setIsProcessing(false);
                  setError(`❌ Could not save order: ${errData.message || 'Unknown error'}`);
                });
              }
            })
            .catch((err) => {
              setIsProcessing(false);
              setError(
                `❌ Network error saving order. Your payment went through — please note your reference: ${response.reference} and contact support.`
              );
              console.error('Order save error:', err);
            });
        },
      });

      handler.openIframe();
    } catch (error) {
      console.error('Error:', error);
      setError('❌ Payment system error. Please try again.');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-900 text-xl font-black">Loading...</div>
      </div>
    );
  }

  if (!pkg || !network) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Link href="/shop" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-black rounded-xl">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/shop" className="text-purple-600 font-bold hover:text-purple-700 mb-4 inline-block">
            ← Back
          </Link>
          <h1 className="text-3xl font-black text-gray-900">Complete Your Order</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 sticky top-24">
              <h2 className="text-2xl font-black text-gray-900 mb-8">Order Summary</h2>

              <div className="space-y-8">
                <div>
                  <p className="text-gray-600 text-sm font-bold uppercase mb-2">Network</p>
                  <p className="text-2xl font-black text-gray-900">{network.name}</p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm font-bold uppercase mb-2">Package</p>
                  <p className="text-2xl font-black text-gray-900">{pkg.name}</p>
                  <p className="text-gray-600">{pkg.amount}</p>
                </div>

                <div className="border-t border-purple-200 pt-8">
                  <p className="text-gray-600 text-sm font-bold uppercase mb-2">Total</p>
                  <p className="text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {CURRENCY.symbol}{pkg.price}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-12 border-2 border-gray-200">
              <h2 className="text-3xl font-black text-gray-900 mb-8">Enter Phone Number</h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Error/Status Message */}
                {error && (
                  <div
                    ref={errorRef}
                    className={`rounded-2xl p-4 text-base font-bold ${
                      error.includes('❌')
                        ? 'bg-red-50 border-2 border-red-200 text-red-700'
                        : 'bg-green-50 border-2 border-green-200 text-green-700'
                    }`}
                  >
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-lg font-black text-gray-900 mb-4">
                    Recipient Phone
                  </label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 transform -translate-y-1/2 text-2xl">📱</span>
                    <input
                      {...register('customerPhone')}
                      type="tel"
                      placeholder="0551234567"
                      maxLength={10}
                      className="w-full pl-16 pr-6 py-4 bg-gray-50 border-2 border-gray-200 focus:border-purple-500 rounded-2xl text-gray-900 font-bold text-lg focus:outline-none transition-all"
                    />
                  </div>
                  <p className="text-gray-600 text-sm mt-3">
                    10-digit Ghana number (no country code)
                  </p>

                  {phoneNumber && phoneNumber.length === 10 && !errors.customerPhone && (
                    <p className="text-green-600 font-bold mt-2">✅ Valid phone number</p>
                  )}
                  {errors.customerPhone && (
                    <p className="text-red-600 font-bold mt-2">❌ {errors.customerPhone.message}</p>
                  )}
                </div>

                {/* How it works */}
                <div className="bg-gray-50 rounded-2xl p-8">
                  <h3 className="font-black text-gray-900 mb-4">How it works</h3>
                  <ol className="space-y-3 text-gray-700">
                    <li className="flex gap-3">
                      <span className="font-black text-purple-600 flex-shrink-0">1.</span>
                      <span>Confirm phone number and proceed</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-black text-purple-600 flex-shrink-0">2.</span>
                      <span>Complete payment via Paystack</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-black text-purple-600 flex-shrink-0">3.</span>
                      <span>Instant activation confirmation</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-black text-purple-600 flex-shrink-0">4.</span>
                      <span>Data on phone immediately</span>
                    </li>
                  </ol>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isProcessing || !!errors.customerPhone || !paystackKey}
                    className="flex-1 px-8 py-5 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-black text-lg rounded-2xl transition-all disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Processing...' : paystackKey ? '💳 Pay with Paystack' : 'Payment Unavailable'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      reset();
                    }}
                    className="px-8 py-5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-black rounded-2xl transition-all"
                  >
                    Clear
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
