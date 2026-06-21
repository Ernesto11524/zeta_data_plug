'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AdminNav from '@/app/admin/components/AdminNav';

const settingsSchema = z.object({
  paystackPublicKey: z.string().min(1, 'Paystack Public Key is required'),
  paystackSecretKey: z.string().min(1, 'Paystack Secret Key is required'),
  paystackTestMode: z.boolean(),
  businessName: z.string().optional(),
  businessEmail: z.string().email().optional().or(z.literal('')),
  businessPhone: z.string().optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

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
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        reset({
          paystackPublicKey: data.settings?.paystackPublicKey || '',
          paystackSecretKey: data.settings?.paystackSecretKey || '',
          paystackTestMode: data.settings?.paystackTestMode ?? true,
          businessName: data.settings?.businessName || '',
          businessEmail: data.settings?.businessEmail || '',
          businessPhone: data.settings?.businessPhone || '',
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: SettingsFormData) => {
    setIsSaving(true);
    setSuccess(false);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <AdminNav />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
            <span className="text-2xl">✅</span>
            <span className="font-semibold text-sm sm:text-base">Settings saved successfully!</span>
          </div>
        )}

        {/* Settings Card */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gray-700 px-4 sm:px-6 py-6 sm:py-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              ⚙️ Admin Settings
            </h2>
            <p className="text-gray-400 mt-2 text-sm sm:text-base">Configure your payment gateway and business information</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-8 space-y-6 sm:space-y-8">
            {/* Paystack Section */}
            <div className="border-l-4 border-blue-500 bg-gray-700 p-4 sm:p-6 rounded">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
                💳 Paystack Payment Configuration
              </h3>

              {/* Test Mode Toggle */}
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('paystackTestMode')}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-white font-medium text-sm sm:text-base">
                    Test Mode (Use Test Keys)
                  </span>
                </label>
                <p className="text-gray-400 text-xs sm:text-sm mt-2 ml-8">
                  Enable test mode to test payments without real transactions
                </p>
              </div>

              {/* Public Key */}
              <div className="mb-6">
                <label htmlFor="paystackPublicKey" className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2">
                  Paystack Public Key *
                </label>
                <input
                  id="paystackPublicKey"
                  type="text"
                  placeholder="pk_test_... or pk_live_..."
                  {...register('paystackPublicKey')}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-600 text-white placeholder-gray-400 text-sm ${
                    errors.paystackPublicKey ? 'border-red-500' : 'border-gray-500'
                  }`}
                />
                {errors.paystackPublicKey && (
                  <p className="text-red-400 text-xs sm:text-sm mt-1">
                    {errors.paystackPublicKey.message}
                  </p>
                )}
                <p className="text-gray-400 text-xs sm:text-sm mt-2">
                  Find this in your Paystack Dashboard: Settings → API Keys & Webhooks
                </p>
              </div>

              {/* Secret Key */}
              <div className="mb-6">
                <label htmlFor="paystackSecretKey" className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2">
                  Paystack Secret Key *
                </label>
                <div className="relative">
                  <input
                    id="paystackSecretKey"
                    type={showSecret ? 'text' : 'password'}
                    placeholder="sk_test_... or sk_live_..."
                    {...register('paystackSecretKey')}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-600 text-white placeholder-gray-400 text-sm ${
                      errors.paystackSecretKey ? 'border-red-500' : 'border-gray-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  >
                    {showSecret ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.paystackSecretKey && (
                  <p className="text-red-400 text-xs sm:text-sm mt-1">
                    {errors.paystackSecretKey.message}
                  </p>
                )}
                <p className="text-gray-400 text-xs sm:text-sm mt-2">
                  ⚠️ Keep this secret! Never share it publicly
                </p>
              </div>
            </div>

            {/* Business Information Section */}
            <div className="border-l-4 border-purple-500 bg-gray-700 p-4 sm:p-6 rounded">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
                🏢 Business Information
              </h3>

              {/* Business Name */}
              <div className="mb-6">
                <label htmlFor="businessName" className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2">
                  Business Name
                </label>
                <input
                  id="businessName"
                  type="text"
                  placeholder="e.g., Zeta Data Services"
                  {...register('businessName')}
                  className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-600 text-white placeholder-gray-400 text-sm"
                />
              </div>

              {/* Business Email */}
              <div className="mb-6">
                <label htmlFor="businessEmail" className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2">
                  Business Email
                </label>
                <input
                  id="businessEmail"
                  type="email"
                  placeholder="support@example.com"
                  {...register('businessEmail')}
                  className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-600 text-white placeholder-gray-400 text-sm"
                />
              </div>

              {/* Business Phone */}
              <div className="mb-6">
                <label htmlFor="businessPhone" className="block text-xs sm:text-sm font-semibold text-gray-300 mb-2">
                  Business Phone
                </label>
                <input
                  id="businessPhone"
                  type="tel"
                  placeholder="+234 123 456 7890"
                  {...register('businessPhone')}
                  className="w-full px-4 py-3 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-600 text-white placeholder-gray-400 text-sm"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 sm:px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                {isSaving ? 'Saving...' : '💾 Save Settings'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/dashboard')}
                className="px-6 sm:px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors duration-200 text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Help Section */}
          <div className="bg-gray-700 border-t border-gray-600 px-4 sm:px-6 py-6">
            <h4 className="font-bold text-white mb-3 text-sm sm:text-base">📚 How to get your Paystack keys:</h4>
            <ol className="space-y-2 text-gray-300 text-xs sm:text-sm list-decimal list-inside">
              <li>Go to <a href="https://dashboard.paystack.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">dashboard.paystack.com</a></li>
              <li>Click on <strong>Settings</strong> in the top menu</li>
              <li>Click on <strong>API Keys & Webhooks</strong></li>
              <li>Copy your <strong>Public Key</strong> and <strong>Secret Key</strong></li>
              <li>Paste them in the fields above</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}
