'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const networkSchema = z.object({
  name: z.string().min(1, 'Network name is required'),
  description: z.string().optional(),
});

type NetworkFormData = z.infer<typeof networkSchema>;

interface Network {
  id: string;
  name: string;
  description?: string;
  imageData?: string;
  createdAt: string;
}

export default function NetworksPage() {
  const router = useRouter();
  const [networks, setNetworks] = useState<Network[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<NetworkFormData>({
    resolver: zodResolver(networkSchema),
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchNetworks();
  }, [router]);

  const fetchNetworks = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/networks', {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (response.ok) {
        const data = await response.json();
        setNetworks(data.networks || []);
      }
    } catch (error) {
      console.error('Error fetching networks:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (event) => {
      const preview = event.target?.result as string;
      setImagePreview(preview);
      setImageData(preview);
    };
    reader.readAsDataURL(file);
  }, []);

  const onSubmit = useCallback(
    async (data: NetworkFormData) => {
      setIsAdding(true);
      try {
        const url = editingId ? `/api/admin/networks/${editingId}` : '/api/admin/networks';
        const method = editingId ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            imageData: imageData,
          }),
        });

        if (response.ok) {
          reset();
          setEditingId(null);
          setImageData(null);
          setImagePreview(null);
          fetchNetworks();
        }
      } catch (error) {
        console.error('Error saving network:', error);
      } finally {
        setIsAdding(false);
      }
    },
    [editingId, imageData, reset, fetchNetworks]
  );

  const deleteNetwork = useCallback(
    async (id: string) => {
      if (!confirm('Delete this network?')) return;
      try {
        const response = await fetch(`/api/admin/networks/${id}`, { method: 'DELETE' });
        if (response.ok) {
          fetchNetworks();
        }
      } catch (error) {
        console.error('Error deleting network:', error);
      }
    },
    [fetchNetworks]
  );

  const memoizedNetworksList = useMemo(
    () =>
      networks.map((network) => (
        <div
          key={network.id}
          className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 flex items-center justify-between hover:border-amber-500/50 transition-all"
        >
          <div className="flex items-center gap-4">
            {network.imageData && (
              <img
                src={network.imageData}
                alt={network.name}
                className="h-16 w-16 object-contain rounded"
              />
            )}
            <div>
              <h3 className="text-xl font-black text-white">{network.name}</h3>
              {network.description && (
                <p className="text-slate-400 text-sm mt-1">{network.description}</p>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/admin/packages?networkId=${network.id}`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg transition-all"
            >
              Packages
            </Link>
            <button
              onClick={() => {
                setEditingId(network.id);
                reset({ name: network.name, description: network.description });
                setImagePreview(network.imageData || null);
                setImageData(network.imageData || null);
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-sm rounded-lg transition-all"
            >
              Edit
            </button>
            <button
              onClick={() => deleteNetwork(network.id)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-lg transition-all"
            >
              Delete
            </button>
          </div>
        </div>
      )),
    [networks, reset, deleteNetwork]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <Link href="/admin/dashboard" className="flex items-center gap-2 hover:opacity-70">
            <h1 className="text-2xl font-bold text-white">Networks</h1>
          </Link>
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-sm text-white"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 sticky top-24">
              <h2 className="text-2xl font-black text-white mb-6">
                {editingId ? 'Edit Network' : 'Add Network'}
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-black text-blue-400 mb-2">Network Name</label>
                  <input
                    {...register('name')}
                    placeholder="e.g., MTN Ghana"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-black text-blue-400 mb-2">Description</label>
                  <input
                    {...register('description')}
                    placeholder="Optional"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-blue-400 mb-2">Logo Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 focus:border-blue-500 focus:outline-none text-sm"
                  />
                  <p className="text-gray-400 text-xs mt-2">Max 2MB • PNG, JPG, GIF</p>
                </div>

                {imagePreview && (
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-400 text-xs mb-2">Preview</p>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-20 object-contain mx-auto"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isAdding}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black rounded-lg transition-all"
                  >
                    {isAdding ? 'Saving...' : editingId ? 'Update' : 'Add'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        reset();
                        setEditingId(null);
                        setImageData(null);
                        setImagePreview(null);
                      }}
                      className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-black rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Networks List */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
              <h2 className="text-2xl font-black text-white mb-6">Networks ({networks.length})</h2>
              <div className="space-y-4">
                {networks.length === 0 ? (
                  <p className="text-gray-400">No networks yet. Add one to get started.</p>
                ) : (
                  memoizedNetworksList
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
