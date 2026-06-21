'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
}

function PackagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const networkId = searchParams.get('id');

  const [packages, setPackages] = useState<DataPackage[]>([]);
  const [network, setNetwork] = useState<Network | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (networkId) {
      fetchData();
    }
  }, [networkId]);

  const fetchData = async () => {
    try {
      const netResponse = await fetch(`/api/admin/networks?id=${networkId}`);
      if (netResponse.ok) {
        const netData = await netResponse.json();
        const found = netData.networks?.find((n: Network) => n.id === networkId);
        setNetwork(found || null);
      }

      const pkgResponse = await fetch(`/api/admin/packages?networkId=${networkId}`);
      if (pkgResponse.ok) {
        const pkgData = await pkgResponse.json();
        setPackages(pkgData.packages?.filter((p: DataPackage) => p.isActive) || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-900 text-xl font-black">Loading...</div>
      </div>
    );
  }

  if (!network) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-6">Network not found</p>
          <Link href="/shop" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-black rounded-xl">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const getGradient = (index: number) => {
    const gradients = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500',
      'from-teal-500 to-blue-500',
      'from-rose-500 to-pink-500',
      'from-violet-500 to-purple-500',
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/shop" className="text-purple-600 font-bold hover:text-purple-700 mb-3 inline-block text-sm sm:text-base transition-colors">
            ← Back to Networks
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-lg">📦</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900">{network.name} Data Plans</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-28 sm:pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-3">
              Choose Your Plan
            </h2>
            <p className="text-gray-600 text-base sm:text-lg">
              Select a data package and proceed to checkout
            </p>
          </div>

          {packages.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-gray-100">
              <p className="text-gray-600 text-lg">No packages available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
              {packages.map((pkg, index) => (
                <Link
                  key={pkg.id}
                  href={`/checkout?packageId=${pkg.id}&networkId=${networkId}`}
                  className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer bg-gradient-to-br ${getGradient(index)} text-white`}
                >
                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    {/* Top */}
                    <div>
                      <p className="text-3xl sm:text-4xl font-black mb-2 group-hover:scale-110 transition-transform origin-left">
                        {pkg.amount}
                      </p>
                      {pkg.name && pkg.name !== pkg.amount && (
                        <p className="text-sm sm:text-base font-semibold opacity-90">{pkg.name}</p>
                      )}
                    </div>

                    {/* Bottom */}
                    <div>
                      <p className="text-base sm:text-sm text-white/80 mb-3">Starting from</p>
                      <div className="flex items-baseline gap-1">
                        <p className="text-4xl sm:text-5xl font-black">
                          {CURRENCY.symbol}{pkg.price}
                        </p>
                      </div>
                      <p className="text-xs sm:text-sm text-white/70 mt-2">Instant activation</p>
                    </div>
                  </div>

                  {/* Decorative circle */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-white/20 transition-all"></div>

                  {/* Button overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all rounded-2xl sm:rounded-3xl"></div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function NetworkPackagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div>Loading...</div></div>}>
      <PackagesContent />
    </Suspense>
  );
}
