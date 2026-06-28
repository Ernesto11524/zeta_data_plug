'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Network {
  id: string;
  name: string;
  description?: string;
  imageData?: string;
}

export default function ShopPage() {
  const [networks, setNetworks] = useState<Network[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/networks')
      .then((r) => r.json())
      .then((d) => setNetworks(d.networks || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-black">Z</span>
            </div>
            <span className="text-lg font-black text-white">ZETA</span>
          </Link>
          <Link href="/" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors">
            ← Home
          </Link>
        </div>
      </header>

      {/* Hero band */}
      <div className="bg-gradient-to-r from-purple-900/60 to-pink-900/60 border-b border-gray-800 py-10 px-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Choose Your Network</h1>
        <p className="text-gray-400 text-sm sm:text-base">Select a network to see available data packages</p>
      </div>

      {/* Network Grid */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-52 rounded-2xl bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : networks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No networks available yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {networks.map((network) => (
              <Link
                key={network.id}
                href={`/shop/${network.name.toLowerCase().replace(/\s+/g, '-')}?id=${network.id}`}
                className="group relative overflow-hidden rounded-2xl h-52 cursor-pointer"
              >
                {/* Background */}
                {network.imageData ? (
                  <img
                    src={network.imageData}
                    alt={network.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600" />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 group-hover:from-black/80 transition-all duration-300" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <h3 className="text-2xl font-black text-white mb-2 group-hover:text-purple-300 transition-colors">
                    {network.name}
                  </h3>
                  {network.description && (
                    <p className="text-gray-300 text-sm mb-3 line-clamp-1">{network.description}</p>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-white/15 hover:bg-white/25 border border-white/25 px-4 py-1.5 rounded-full w-fit transition-all">
                    Browse Plans <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
