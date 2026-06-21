'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { CURRENCY } from '@/app/constants/theme';

interface DataPackage {
  id: string;
  name: string;
  amount: string;
  price: number;
  isActive: boolean;
  networkId: string;
}

interface Network {
  id: string;
  name: string;
}

interface NetworkPackage {
  networkName: string;
  amount: string;
  price: number;
}

interface Network {
  id: string;
  name: string;
  description?: string;
  imageData?: string;
  packages: { id: string }[];
}

function PricingDisplay() {
  const [packages, setPackages] = useState<NetworkPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        // Fetch all networks
        const networksRes = await fetch('/api/admin/networks', {
          headers: { 'Cache-Control': 'max-age=300' },
        });
        const networksData = await networksRes.json();
        const networks: Network[] = networksData.networks || [];

        // Fetch all packages
        const packagesRes = await fetch('/api/admin/packages', {
          headers: { 'Cache-Control': 'max-age=300' },
        });
        const packagesData = await packagesRes.json();
        const allPackages: DataPackage[] = packagesData.packages || [];

        // Get first (smallest) package from each network
        const networkPackages: NetworkPackage[] = networks
          .map((network) => {
            // Find all active packages for this network
            const networkPkgs = allPackages.filter(
              (pkg) => pkg.networkId === network.id && pkg.isActive
            );
            // Sort by price and get the cheapest/first one
            const firstPkg = networkPkgs.sort((a, b) => a.price - b.price)[0];
            return firstPkg
              ? {
                  networkName: network.name,
                  amount: firstPkg.amount,
                  price: firstPkg.price,
                }
              : null;
          })
          .filter((pkg) => pkg !== null) as NetworkPackage[];

        setPackages(networkPackages);
      } catch (error) {
        console.error('Error fetching packages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackages();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-100 rounded-lg p-4 h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="bg-gray-50 rounded-2xl p-12 text-center">
        <p className="text-gray-600">No packages available yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
      {packages.map((pkg) => (
        <Link
          key={pkg.networkName}
          href="/shop"
          className="group bg-white rounded-lg p-4 sm:p-5 border-2 border-purple-100 hover:border-purple-500 transition-all text-center hover:shadow-lg cursor-pointer"
        >
          <p className="text-xs sm:text-sm text-gray-600 mb-2 truncate font-semibold">
            {pkg.networkName}
          </p>
          <p className="text-2xl sm:text-3xl font-black text-purple-600 mb-2 group-hover:scale-110 transition-transform">
            {pkg.amount}
          </p>
          <p className="text-lg sm:text-xl font-black text-gray-900 group-hover:text-purple-600">
            {CURRENCY.symbol}{pkg.price}
          </p>
        </Link>
      ))}
    </div>
  );
}

function NetworksDisplay() {
  const [networks, setNetworks] = useState<Network[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch with caching strategy
    const fetchNetworks = async () => {
      try {
        const response = await fetch('/api/admin/networks', {
          method: 'GET',
          headers: {
            'Cache-Control': 'max-age=300', // 5 minute cache
          },
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

  // Memoize the networks list to prevent unnecessary re-renders
  const networkCards = useMemo(
    () =>
      networks.map((network) => (
        <Link
          key={network.id}
          href={`/shop/${network.name.toLowerCase().replace(/\s+/g, '-')}?id=${network.id}`}
          className="group bg-white border-2 border-gray-200 hover:border-purple-500 rounded-2xl p-8 text-center transition-all hover:shadow-xl cursor-pointer"
        >
          {network.imageData ? (
            <div className="mb-4 h-32 flex items-center justify-center">
              <img
                src={network.imageData}
                alt={network.name}
                className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📱</div>
          )}
          <p className="font-black text-gray-900 text-lg group-hover:text-purple-600 transition-colors">
            {network.name}
          </p>
        </Link>
      )),
    [networks]
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-100 rounded-2xl p-8 h-48 animate-pulse" />
        ))}
      </div>
    );
  }

  return <div className="grid grid-cols-2 md:grid-cols-4 gap-6">{networkCards}</div>;
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-lg">Z</span>
            </div>
            <h1 className="text-xl font-black text-gray-900">ZETA</h1>
          </div>
          <Link
            href="/shop"
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-full hover:shadow-lg transition-all"
          >
            Shop Now
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-purple-100 rounded-full">
            <span className="text-purple-700 text-sm font-bold">💫 Premium Data Services</span>
          </div>

          <h1 className="text-6xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight">
            Lightning Fast
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">
              Mobile Data
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Get instant data delivery across all major networks. Fast, reliable, and always available.
          </p>

          <Link
            href="/shop"
            className="inline-block px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-black text-lg rounded-2xl transition-all hover:shadow-2xl hover:scale-105 transform"
          >
            Start Shopping →
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-black text-gray-900 text-center mb-16">Why Choose Us?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '⚡',
                title: 'Instant Activation',
                desc: 'Data activated within seconds. No waiting, no delays.'
              },
              {
                icon: '💎',
                title: 'Best Prices',
                desc: 'Competitive rates on all networks. Unbeatable value.'
              },
              {
                icon: '🔒',
                title: 'Secure & Safe',
                desc: 'Bank-grade security. Your data is protected.'
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-purple-200 transition-all">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Networks Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-black text-gray-900 text-center mb-16">All Networks Supported</h2>
          <NetworksDisplay />
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">Check Out Our Networks</h2>
            <p className="text-lg text-gray-600">See the smallest package available from each network</p>
          </div>
          <PricingDisplay />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-black text-gray-900 mb-6">Ready to get data?</h2>
          <p className="text-xl text-gray-600 mb-10">Select your network and package. Activate instantly.</p>

          <Link
            href="/shop"
            className="inline-block px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-black text-xl rounded-2xl hover:shadow-2xl hover:scale-110 transition-all transform"
          >
            Shop Now 🛒
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-600">
          <p className="font-bold">© 2026 ZETA. Fast Mobile Data.</p>
        </div>
      </footer>
    </div>
  );
}
