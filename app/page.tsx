'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { CURRENCY } from '@/app/constants/theme';

interface DataPackage {
  id: string;
  amount: string;
  price: number;
  isActive: boolean;
  networkId: string;
}

interface Network {
  id: string;
  name: string;
  imageData?: string;
}

function StarterPrices() {
  const [items, setItems] = useState<{ networkName: string; amount: string; price: number; networkId: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/networks').then((r) => r.json()),
      fetch('/api/admin/packages').then((r) => r.json()),
    ])
      .then(([netData, pkgData]) => {
        const networks: Network[] = netData.networks || [];
        const packages: DataPackage[] = pkgData.packages || [];

        const result = networks
          .map((net) => {
            const cheapest = packages
              .filter((p) => p.networkId === net.id && p.isActive)
              .sort((a, b) => a.price - b.price)[0];
            return cheapest
              ? { networkName: net.name, amount: cheapest.amount, price: cheapest.price, networkId: net.id }
              : null;
          })
          .filter(Boolean) as any[];

        setItems(result);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-white/10 animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {items.map((item) => (
        <Link
          key={item.networkName}
          href={`/shop/${item.networkName.toLowerCase().replace(/\s+/g, '-')}?id=${item.networkId}`}
          className="group bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 backdrop-blur-sm rounded-2xl p-5 text-center transition-all"
        >
          <p className="text-xs text-purple-200 font-semibold mb-2 uppercase tracking-wide">{item.networkName}</p>
          <p className="text-3xl font-black text-white mb-1 group-hover:scale-105 transition-transform inline-block">
            {item.amount}
          </p>
          <p className="text-purple-200 font-bold text-sm">from {CURRENCY.symbol}{item.price}</p>
        </Link>
      ))}
    </div>
  );
}

function NetworkCards() {
  const [networks, setNetworks] = useState<Network[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/networks')
      .then((r) => r.json())
      .then((d) => setNetworks(d.networks || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-44 rounded-2xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {networks.map((network) => (
        <Link
          key={network.id}
          href={`/shop/${network.name.toLowerCase().replace(/\s+/g, '-')}?id=${network.id}`}
          className="group relative overflow-hidden rounded-2xl h-44 cursor-pointer"
        >
          {network.imageData ? (
            <img
              src={network.imageData}
              alt={network.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-white font-black text-lg">{network.name}</p>
            <p className="text-purple-300 text-xs font-semibold mt-0.5">View plans →</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-black">Z</span>
            </div>
            <span className="text-xl font-black text-gray-900">ZETA</span>
          </div>
          <Link
            href="/shop"
            className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-full text-sm hover:shadow-lg hover:scale-105 transition-all"
          >
            Buy Data
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        {/* Decorative blobs */}
        <div className="absolute top-24 left-1/4 w-80 h-80 bg-purple-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/10 border border-white/20 rounded-full">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-purple-200 text-sm font-semibold">Always Online · Instant Delivery</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
            Data Bundles,
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Delivered Fast
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-xl mx-auto">
            All major networks. Best prices. Buy data in seconds from your phone.
          </p>

          <Link
            href="/shop"
            className="inline-block px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-black text-lg rounded-2xl transition-all hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-105"
          >
            Shop Now →
          </Link>
        </div>

        {/* Starter prices inside hero */}
        <div className="relative max-w-3xl mx-auto mt-16">
          <p className="text-center text-gray-400 text-sm font-semibold uppercase tracking-widest mb-5">
            Starting prices
          </p>
          <StarterPrices />
        </div>
      </section>

      {/* Why Us */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-14">Why choose ZETA?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                gradient: 'from-purple-500 to-pink-500',
                icon: '⚡',
                title: 'Instant Activation',
                desc: 'Data hits your phone within seconds. No delays, no excuses.',
              },
              {
                gradient: 'from-blue-500 to-cyan-500',
                icon: '💸',
                title: 'Best Prices',
                desc: 'Competitive rates across all networks. Always great value.',
              },
              {
                gradient: 'from-green-500 to-emerald-500',
                icon: '🔒',
                title: 'Secure Payments',
                desc: 'Powered by Paystack. Your money and data are always safe.',
              },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-2xl mb-5`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Networks */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">All Networks Covered</h2>
            <p className="text-gray-500">Pick your network and get connected instantly.</p>
          </div>
          <NetworkCards />
          <div className="text-center mt-8">
            <Link
              href="/shop"
              className="inline-block px-8 py-3 border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white font-bold rounded-full transition-all text-sm"
            >
              Browse All Packages
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 text-center mb-14">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Pick a Network', desc: 'Choose from all major networks in Ghana.' },
              { step: '02', title: 'Select a Package', desc: 'Pick the data size and price that works for you.' },
              { step: '03', title: 'Pay & Receive', desc: 'Pay securely via Mobile Money and get data instantly.' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-black text-lg mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, white 1px, transparent 1px), radial-gradient(circle at 75% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>
        <div className="relative max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">Ready to get data?</h2>
          <p className="text-purple-100 text-lg mb-10">Fast. Affordable. Reliable. Always.</p>
          <Link
            href="/shop"
            className="inline-block px-12 py-4 bg-white text-purple-600 font-black text-lg rounded-2xl hover:shadow-2xl hover:scale-105 transition-all"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-14">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">Z</span>
              </div>
              <span className="text-white font-black text-lg">ZETA</span>
            </div>
            <p className="text-sm leading-relaxed">Fast mobile data bundles for all networks in Ghana.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/shop" className="hover:text-white transition-colors">Shop</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Support</h4>
            <p className="text-sm leading-relaxed">Need help? Reach us via WhatsApp for fast assistance.</p>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 mt-10 pt-6 border-t border-gray-800 text-sm text-center">
          © {new Date().getFullYear()} ZETA Data Bundles. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
