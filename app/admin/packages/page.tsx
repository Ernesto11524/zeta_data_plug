'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CURRENCY } from '@/app/constants/theme';
import AdminNav from '@/app/admin/components/AdminNav';

const packageSchema = z.object({
  name: z.string().min(1, 'Package name is required'),
  amount: z.string().min(1, 'Data amount is required'),
  price: z.number().positive('Price must be positive'),
  description: z.string().optional(),
  isActive: z.boolean(),
});

type PackageFormData = z.infer<typeof packageSchema>;

interface DataPackage {
  id: string;
  name: string;
  amount: string;
  price: number;
  description?: string;
  isActive: boolean;
}

interface Network {
  id: string;
  name: string;
}

function PackagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const networkId = searchParams.get('networkId') || '';

  const [packages, setPackages] = useState<DataPackage[]>([]);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: { isActive: true },
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchNetworks();
  }, [router]);

  useEffect(() => {
    if (networkId && networks.length > 0) {
      const network = networks.find((n) => n.id === networkId);
      if (network) {
        setSelectedNetwork(network);
        fetchPackages(networkId);
      }
    }
  }, [networkId, networks]);

  const fetchNetworks = async () => {
    try {
      const response = await fetch('/api/admin/networks');
      if (response.ok) {
        const data = await response.json();
        setNetworks(data.networks || []);
      }
    } catch (error) {
      console.error('Error fetching networks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPackages = async (nId: string) => {
    try {
      const response = await fetch(`/api/admin/packages?networkId=${nId}`);
      if (response.ok) {
        const data = await response.json();
        setPackages(data.packages || []);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const onSubmit = async (data: PackageFormData) => {
    if (!selectedNetwork) return;
    setIsAdding(true);
    try {
      const url = editingId ? `/api/admin/packages/${editingId}` : '/api/admin/packages';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          networkId: selectedNetwork.id,
        }),
      });

      if (response.ok) {
        reset();
        setEditingId(null);
        fetchPackages(selectedNetwork.id);
      }
    } catch (error) {
      console.error('Error saving package:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const deletePackage = async (id: string) => {
    if (!confirm('Delete this package?')) return;
    try {
      const response = await fetch(`/api/admin/packages/${id}`, { method: 'DELETE' });
      if (response.ok && selectedNetwork) {
        fetchPackages(selectedNetwork.id);
      }
    } catch (error) {
      console.error('Error deleting package:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-amber-400 text-xl font-black">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <AdminNav />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Network Selector */}
        {!selectedNetwork && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 sm:p-8 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-white mb-6">Select a Network</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {networks.map((network) => (
                <button
                  key={network.id}
                  onClick={() => {
                    setSelectedNetwork(network);
                    fetchPackages(network.id);
                  }}
                  className="p-3 sm:p-6 bg-blue-600 hover:bg-blue-700 border border-blue-500 hover:border-blue-400 rounded-lg transition-all font-black text-white text-sm sm:text-base"
                >
                  {network.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedNetwork && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Form Section */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 sm:p-8 sticky top-24">
                <button
                  onClick={() => {
                    setSelectedNetwork(null);
                    reset();
                    setEditingId(null);
                  }}
                  className="mb-6 text-sm font-black text-amber-400 hover:text-amber-300"
                >
                  ← Change Network
                </button>
                <h2 className="text-2xl font-black text-white mb-6">
                  {editingId ? 'Edit Package' : 'Add Package'} for {selectedNetwork.name}
                </h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-black text-amber-400 mb-2">Package Name</label>
                    <input
                      {...register('name')}
                      placeholder="e.g., 500MB"
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-black text-amber-400 mb-2">Data Amount</label>
                    <input
                      {...register('amount')}
                      placeholder="e.g., 500MB, 1GB"
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-black text-amber-400 mb-2">Price ({CURRENCY.code})</label>
                    <input
                      {...register('price', { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      placeholder="10.00"
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                    />
                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-black text-amber-400 mb-2">Description</label>
                    <input
                      {...register('description')}
                      placeholder="Optional"
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('isActive')}
                      className="w-5 h-5 rounded"
                    />
                    <span className="text-white font-bold">Active</span>
                  </label>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={isAdding}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-black rounded-lg transition-all disabled:opacity-50"
                    >
                      {isAdding ? 'Saving...' : editingId ? 'Update' : 'Add'}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        onClick={() => {
                          reset();
                          setEditingId(null);
                        }}
                        className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-black rounded-lg transition-all"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Packages List */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-black text-white mb-6">Packages ({packages.length})</h2>
                <div className="space-y-3 sm:space-y-4">
                  {packages.length === 0 ? (
                    <p className="text-slate-400">No packages for this network. Add one!</p>
                  ) : (
                    packages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="bg-gray-700 border border-gray-600 rounded-lg p-4 sm:p-6 space-y-3 sm:space-y-0 hover:border-blue-400 transition-all"
                      >
                        <div className="flex justify-between items-start gap-3 sm:gap-0 sm:items-center">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg sm:text-xl font-black text-white truncate">{pkg.name}</h3>
                            <p className="text-gray-400 text-xs sm:text-sm">
                              {pkg.amount} • {CURRENCY.symbol}{pkg.price}
                            </p>
                            {!pkg.isActive && (
                              <p className="text-red-400 text-xs sm:text-sm font-bold">Inactive</p>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-shrink-0">
                            <button
                              onClick={() => {
                                setEditingId(pkg.id);
                                reset({
                                  name: pkg.name,
                                  amount: pkg.amount,
                                  price: pkg.price,
                                  description: pkg.description,
                                  isActive: pkg.isActive,
                                });
                              }}
                              className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs sm:text-sm rounded-lg transition-all"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deletePackage(pkg.id)}
                              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-lg transition-all"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function PackagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-amber-400 text-xl font-black">Loading...</div>
      </div>
    }>
      <PackagesContent />
    </Suspense>
  );
}
