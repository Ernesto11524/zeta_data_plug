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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/shop" className="text-purple-600 font-bold hover:text-purple-700 mb-4 inline-block">
            ← Back
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-3xl">📱</span>
            <h1 className="text-2xl font-black text-gray-900">{network.name} Plans</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {packages.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl p-12 text-center">
              <p className="text-gray-600">No packages available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <Link
                  key={pkg.id}
                  href={`/checkout?packageId=${pkg.id}&networkId=${networkId}`}
                  className="group bg-white border-2 border-gray-200 hover:border-purple-500 rounded-3xl p-8 transition-all hover:shadow-2xl"
                >
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📊</div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                    {pkg.name}
                  </h3>
                  <p className="text-gray-600 text-lg mb-6">{pkg.amount}</p>

                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-6">
                    <p className="text-gray-600 text-sm font-bold mb-1">Price</p>
                    <p className="text-4xl font-black text-purple-600">
                      {CURRENCY.symbol}{pkg.price}
                    </p>
                  </div>

                  <button className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-black rounded-xl group-hover:shadow-lg transition-all">
                    Select →
                  </button>
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
