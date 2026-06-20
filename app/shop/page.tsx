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
          className="group bg-white border-2 border-gray-200 hover:border-purple-500 rounded-2xl p-12 transition-all hover:shadow-xl cursor-pointer"
        >
          {network.imageData ? (
            <div className="mb-6 h-32 flex items-center justify-center">
              <img
                src={network.imageData}
                alt={network.name}
                className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">📱</div>
          )}
          <h3 className="text-3xl font-black text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
            {network.name}
          </h3>
          {network.description && (
            <p className="text-gray-600 mb-6">{network.description}</p>
          )}
          <div className="text-purple-600 font-bold group-hover:text-purple-700">
            Browse Plans →
          </div>
        </Link>
      )),
    [networks]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-900 text-xl font-black">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-black">Z</span>
            </div>
            <h1 className="text-xl font-black text-gray-900">ZETA</h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-black text-gray-900 mb-4">Choose Your Network</h1>
            <p className="text-xl text-gray-600">Select a network to browse packages</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-100 rounded-2xl p-12 h-64 animate-pulse" />
              ))}
            </div>
          ) : networks.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl p-12 text-center">
              <p className="text-gray-600 text-lg">No networks available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{networkCards}</div>
          )}
        </div>
      </main>
    </div>
  );
}
