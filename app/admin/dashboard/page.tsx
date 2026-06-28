'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CURRENCY } from '@/app/constants/theme';
import AdminNav from '@/app/admin/components/AdminNav';

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

interface RecentOrder {
  id: string;
  customerPhone: string;
  amount: number;
  status: string;
  createdAt: string;
  package: { amount: string };
  network: { name: string };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats || {});
        setRecentOrders((data.orders || []).slice(0, 5));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      color: 'text-white',
      href: '/admin/orders',
    },
    {
      label: 'Pending',
      value: stats.pendingOrders,
      color: 'text-yellow-400',
      href: '/admin/orders?filter=processing',
    },
    {
      label: 'Completed',
      value: stats.completedOrders,
      color: 'text-green-400',
      href: '/admin/orders?filter=completed',
    },
    {
      label: 'Revenue',
      value: `${CURRENCY.symbol}${stats.totalRevenue}`,
      color: 'text-blue-400',
      href: '/admin/orders',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        {/* Clickable Stat Cards */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {statCards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 hover:bg-gray-750 transition-all group cursor-pointer"
            >
              <p className="text-gray-400 text-sm mb-2">{card.label}</p>
              <p className={`text-4xl font-bold ${card.color}`}>{card.value}</p>
              <p className="text-xs text-gray-500 mt-2 group-hover:text-blue-400 transition-colors">
                View orders →
              </p>
            </Link>
          ))}
        </div>

        {/* Recent Orders Preview */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="bg-gray-700 px-4 sm:px-6 py-4 border-b border-gray-600 flex justify-between items-center">
            <h2 className="text-lg font-bold">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-bold transition-all"
            >
              View All
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No orders yet</div>
          ) : (
            <div className="divide-y divide-gray-700">
              {recentOrders.map((order) => (
                <div key={order.id} className="px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-bold text-white text-sm font-mono">{order.customerPhone}</p>
                    <p className="text-xs text-gray-400">{order.network.name} · {order.package.amount}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-white text-sm">{CURRENCY.symbol}{order.amount}</p>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold capitalize ${
                      order.status === 'completed' ? 'bg-green-900 text-green-300'
                      : order.status === 'processing' ? 'bg-blue-900 text-blue-300'
                      : 'bg-yellow-900 text-yellow-300'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
