'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AdminNav from '@/app/admin/components/AdminNav';

const settingsSchema = z.object({
  paystackPublicKey: z.string().min(1, 'Public key is required'),
  paystackSecretKey: z.string().optional(),
  businessName: z.string().optional(),
  businessEmail: z.string().email('Enter a valid email').optional().or(z.literal('')),
  businessPhone: z.string().optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showSecret, setShowSecret] = useState(false);
  const [secretKeyIsSet, setSecretKeyIsSet] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchSettings();
  }, [router]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        const s = data.settings;
        // Secret key is never returned from the API — show indicator instead
        setSecretKeyIsSet(!!s?.paystackSecretKey);
        reset({
          paystackPublicKey: s?.paystackPublicKey || '',
          paystackSecretKey: '',
          businessName: s?.businessName || '',
          businessEmail: s?.businessEmail || '',
          businessPhone: s?.businessPhone || '',
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: SettingsFormData) => {
    setIsSaving(true);
    setSaveStatus('idle');

    // Only send secret key if the user actually typed a new one
    const payload: Record<string, any> = {
      paystackPublicKey: data.paystackPublicKey,
      businessName: data.businessName,
      businessEmail: data.businessEmail,
      businessPhone: data.businessPhone,
    };
    if (data.paystackSecretKey && data.paystackSecretKey.trim() !== '') {
      payload.paystackSecretKey = data.paystackSecretKey;
    }

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setSaveStatus(res.ok ? 'success' : 'error');
      if (res.ok) {
        setSecretKeyIsSet(true);
        setTimeout(() => setSaveStatus('idle'), 4000);
      }
    } catch (e) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <AdminNav />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        {/* Save Status */}
        {saveStatus === 'success' && (
          <div className="mb-6 bg-green-800 border border-green-600 text-green-200 px-4 py-3 rounded-lg text-sm font-medium">
            Settings saved successfully.
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="mb-6 bg-red-800 border border-red-600 text-red-200 px-4 py-3 rounded-lg text-sm font-medium">
            Something went wrong. Please try again.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Paystack Section */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-lg font-bold text-white mb-1">Paystack Payment Keys</h2>
            <p className="text-gray-400 text-sm mb-6">
              Use <span className="text-green-400 font-mono">pk_live_</span> and <span className="text-green-400 font-mono">sk_live_</span> keys for real payments.
              Find them at <a href="https://dashboard.paystack.com/#/settings/developers" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Paystack Dashboard → Settings → API Keys</a>.
            </p>

            <div className="space-y-5">
              {/* Public Key */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Public Key <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="pk_live_..."
                  {...register('paystackPublicKey')}
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.paystackPublicKey ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
                {errors.paystackPublicKey && (
                  <p className="text-red-400 text-xs mt-1">{errors.paystackPublicKey.message}</p>
                )}
              </div>

              {/* Secret Key */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Secret Key
                  {secretKeyIsSet && (
                    <span className="ml-2 text-xs text-green-400 font-normal">✓ Already saved</span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    placeholder={secretKeyIsSet ? 'Enter new key to update...' : 'sk_live_...'}
                    {...register('paystackSecretKey')}
                    className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 text-sm"
                  >
                    {showSecret ? 'Hide' : 'Show'}
                  </button>
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  {secretKeyIsSet
                    ? 'Leave blank to keep the existing key.'
                    : 'Required for payment verification. Never share this publicly.'}
                </p>
              </div>
            </div>
          </div>

          {/* Business Info Section */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-lg font-bold text-white mb-1">Business Information</h2>
            <p className="text-gray-400 text-sm mb-6">Optional details about your business.</p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Business Name</label>
                <input
                  type="text"
                  placeholder="e.g., Zeta Data Bundles"
                  {...register('businessName')}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Business Email</label>
                <input
                  type="email"
                  placeholder="support@zetadata.com"
                  {...register('businessEmail')}
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.businessEmail ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
                {errors.businessEmail && (
                  <p className="text-red-400 text-xs mt-1">{errors.businessEmail.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Business Phone</label>
                <input
                  type="tel"
                  placeholder="0XX XXX XXXX"
                  {...register('businessPhone')}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Save */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:text-blue-400 text-white font-bold rounded-lg transition-all text-sm"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </main>
    </div>
  );
}
