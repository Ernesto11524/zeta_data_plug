'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CURRENCY } from '@/app/constants/theme';
import AdminNav from '@/app/admin/components/AdminNav';

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
      <AdminNav />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
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
          <div className="bg-gray-700 px-4 sm:px-6 py-4 border-b border-gray-600">
            <h2 className="text-xl font-bold">Orders</h2>
          </div>

          {orders.length === 0 ? (
            <div className="p-8 sm:p-12 text-center text-gray-400">
              <p>No orders yet</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700 border-b border-gray-600">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-300">Phone</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-300">Network</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-300">Package</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-300">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-300">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-300">Payment</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-300">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-300">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, i) => (
                      <tr key={order.id} className={i % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                        <td className="px-4 py-3 text-xs text-white">{order.customerPhone}</td>
                        <td className="px-4 py-3 text-xs text-white">{order.network.name}</td>
                        <td className="px-4 py-3 text-xs text-white">{order.package.amount}</td>
                        <td className="px-4 py-3 text-xs text-white font-bold">{CURRENCY.symbol}{order.amount}</td>
                        <td className="px-4 py-3 text-xs">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === 'completed' ? 'bg-green-900 text-green-300' : order.status === 'processing' ? 'bg-blue-900 text-blue-300' : 'bg-yellow-900 text-yellow-300'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${order.paymentStatus === 'completed' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-xs">
                          {order.status !== 'completed' && (
                            <button
                              onClick={() => handleCompleteOrder(order.id)}
                              className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold transition-all"
                            >
                              ✓
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3 p-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-gray-700 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="text-xs text-gray-400">Phone</p>
                        <p className="font-bold text-white">{order.customerPhone}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${order.status === 'completed' ? 'bg-green-900 text-green-300' : order.status === 'processing' ? 'bg-blue-900 text-blue-300' : 'bg-yellow-900 text-yellow-300'}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-400">Network</p>
                        <p className="font-bold text-white">{order.network.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Package</p>
                        <p className="font-bold text-white">{order.package.amount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Amount</p>
                        <p className="font-bold text-white">{CURRENCY.symbol}{order.amount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Payment</p>
                        <span className={`px-2 py-1 rounded text-xs font-bold inline-block ${order.paymentStatus === 'completed' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-600">
                      <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                      {order.status !== 'completed' && (
                        <button
                          onClick={() => handleCompleteOrder(order.id)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold transition-all"
                        >
                          ✓ Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
