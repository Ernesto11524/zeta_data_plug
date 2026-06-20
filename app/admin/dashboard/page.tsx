'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CURRENCY } from '@/app/constants/theme';

interface Order {
  id: string;
  customerPhone: string;
  amount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  package: { name: string; amount: string };
  network: { name: string };
}

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
  });
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
      const response = await fetch('/api/admin/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/complete`, {
        method: 'PATCH',
      });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-4">
            <Link
              href="/admin/networks"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-all text-sm"
            >
              Networks
            </Link>
            <Link
              href="/admin/packages"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-all text-sm"
            >
              Packages
            </Link>
            <Link
              href="/admin/settings"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition-all text-sm"
            >
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-all text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Total Orders</p>
            <p className="text-4xl font-bold text-white">{stats.totalOrders}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Pending</p>
            <p className="text-4xl font-bold text-yellow-400">{stats.pendingOrders}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Completed</p>
            <p className="text-4xl font-bold text-green-400">{stats.completedOrders}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Revenue</p>
            <p className="text-4xl font-bold text-blue-400">
              {CURRENCY.symbol}{stats.totalRevenue}
            </p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="bg-gray-700 px-6 py-4 border-b border-gray-600">
            <h2 className="text-xl font-bold">Orders</h2>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700 border-b border-gray-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-300">Phone</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-300">Network</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-300">Package</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-300">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-300">Payment</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-300">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-300">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, i) => (
                    <tr
                      key={order.id}
                      className={i % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}
                    >
                      <td className="px-6 py-4 text-sm text-white">{order.customerPhone}</td>
                      <td className="px-6 py-4 text-sm text-white">{order.network.name}</td>
                      <td className="px-6 py-4 text-sm text-white">{order.package.amount}</td>
                      <td className="px-6 py-4 text-sm text-white font-bold">
                        {CURRENCY.symbol}{order.amount}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded text-xs font-bold ${
                            order.status === 'completed'
                              ? 'bg-green-900 text-green-300'
                              : order.status === 'processing'
                              ? 'bg-blue-900 text-blue-300'
                              : 'bg-yellow-900 text-yellow-300'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded text-xs font-bold ${
                            order.paymentStatus === 'completed'
                              ? 'bg-green-900 text-green-300'
                              : 'bg-red-900 text-red-300'
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {order.status !== 'completed' && (
                          <button
                            onClick={() => handleCompleteOrder(order.id)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold transition-all"
                          >
                            ✓ Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
