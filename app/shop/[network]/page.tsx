'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CURRENCY } from '@/app/constants/theme';

interface DataPackage {
  id: string;
  name: string;
  amount: string;
  price: number;
  isActive: boolean;
}

interface Network {
  id: string;
  name: string;
  imageData?: string;
}

const GRADIENTS = [
  'from-violet-600 to-purple-600',
  'from-pink-600 to-rose-600',
  'from-blue-600 to-cyan-600',
  'from-emerald-600 to-green-600',
  'from-orange-600 to-amber-600',
  'from-indigo-600 to-blue-600',
  'from-fuchsia-600 to-pink-600',
  'from-teal-600 to-emerald-600',
];

function PackagesContent() {
  const searchParams = useSearchParams();
  const networkId = searchParams.get('id');

  const [packages, setPackages] = useState<DataPackage[]>([]);
  const [network, setNetwork] = useState<Network | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!networkId) return;
    Promise.all([
      fetch(`/api/admin/networks?id=${networkId}`).then((r) => r.json()),
      fetch(`/api/admin/packages?networkId=${networkId}`).then((r) => r.json()),
    ])
      .then(([netData, pkgData]) => {
        const found = netData.networks?.find((n: Network) => n.id === networkId) || null;
        setNetwork(found);
        setPackages(pkgData.packages?.filter((p: DataPackage) => p.isActive) || []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [networkId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-lg font-bold">Loading...</div>
      </div>
    );
  }

  if (!network) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-6">Network not found.</p>
          <Link href="/shop" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-xl">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/shop" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-semibold">
            ← Networks
          </Link>
          <div className="flex items-center gap-2">
            {network.imageData && (
              <img src={network.imageData} alt={network.name} className="h-7 w-auto object-contain rounded" />
            )}
            <span className="text-white font-black text-lg">{network.name}</span>
          </div>
          <Link href="/" className="flex items-center gap-1.5">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">Z</span>
            </div>
          </Link>
        </div>
      </header>

      {/* Hero band */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-b border-gray-800 py-10 px-4 text-center">
        {network.imageData && (
          <img
            src={network.imageData}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-10"
          />
        )}
        <div className="relative">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-1">{network.name} Data Plans</h1>
          <p className="text-gray-400 text-sm">
            {packages.length} package{packages.length !== 1 ? 's' : ''} available · Tap to buy instantly
          </p>
        </div>
      </div>

      {/* Packages */}
      <main className="max-w-5xl mx-auto px-4 py-10">
        {packages.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-6">No packages available for this network yet.</p>
            <Link href="/shop" className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all">
              Back to Networks
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {packages.map((pkg, i) => (
              <Link
                key={pkg.id}
                href={`/checkout?packageId=${pkg.id}&networkId=${networkId}`}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} p-4 sm:p-5 h-32 sm:h-36 flex flex-col justify-between cursor-pointer hover:scale-105 hover:shadow-xl hover:shadow-black/40 transition-all duration-200`}
              >
                {/* Decorative circle */}
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />

                <p className="relative text-xl sm:text-2xl font-black text-white">{pkg.amount}</p>

                <div className="relative">
                  <p className="text-lg sm:text-xl font-black text-white">{CURRENCY.symbol}{pkg.price}</p>
                  <p className="text-white/60 text-xs mt-0.5">Tap to buy</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function NetworkPackagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-lg font-bold">Loading...</div>
      </div>
    }>
      <PackagesContent />
    </Suspense>
  );
}
