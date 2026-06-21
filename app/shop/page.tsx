'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';

interface Network {
  id: string;
  name: string;
  description?: string;
  imageData?: string;
  packages: { id: string }[];
}

export default function ShopPage() {
  const [networks, setNetworks] = useState<Network[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        const response = await fetch('/api/admin/networks', {
          headers: { 'Cache-Control': 'max-age=300' },
        });
        if (response.ok) {
          const data = await response.json();
          setNetworks(data.networks || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNetworks();
  }, []);

  const networkCards = useMemo(
    () =>
      networks.map((network) => (
        <Link
          key={network.id}
          href={`/shop/${network.name.toLowerCase().replace(/\s+/g, '-')}?id=${network.id}`}
          className="group relative overflow-hidden rounded-3xl h-48 sm:h-56 cursor-pointer"
        >
          {/* Background Image */}
          {network.imageData ? (
            <div className="absolute inset-0">
              <img
                src={network.imageData}
                alt={network.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-6xl">
              📱
            </div>
          )}

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent opacity-80 group-hover:opacity-70 transition-opacity"></div>

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 group-hover:text-purple-300 transition-colors">
              {network.name}
            </h3>
            {network.description && (
              <p className="text-sm sm:text-base text-gray-200 mb-4 line-clamp-2">
                {network.description}
              </p>
            )}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full font-bold text-white text-sm sm:text-base w-fit group-hover:shadow-lg transition-all">
              Browse Plans
              <span className="ml-1">→</span>
            </div>
          </div>
        </Link>
      )),
    [networks]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl font-black">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-black">Z</span>
            </div>
            <h1 className="text-xl font-black text-gray-900">ZETA</h1>
          </Link>
          <Link
            href="/"
            className="text-sm font-bold text-purple-600 hover:text-purple-700 transition-colors"
          >
            ← Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-28 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-4">
              Choose Your Network
            </h1>
            <p className="text-lg sm:text-xl text-gray-600">
              Select a network to browse available data packages
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-200 rounded-3xl h-48 sm:h-56 animate-pulse" />
              ))}
            </div>
          ) : networks.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-gray-100">
              <p className="text-gray-600 text-lg">No networks available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {networkCards}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
