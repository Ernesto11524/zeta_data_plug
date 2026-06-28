'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CURRENCY } from '@/app/constants/theme';
import AdminNav from '@/app/admin/components/AdminNav';

interface Order {
  id: string;
  customerPhone: string;
  amount: number;
  status: string;
  paymentStatus: string;
  paymentReference: string;
  createdAt: string;
  completedAt: string | null;
  package: { name: string; amount: string };
  network: { name: string };
}

const TABS = [
  { key: 'all', label: 'All Orders' },
  { key: 'processing', label: 'Processing' },
  { key: 'pending', label: 'Pending' },
  { key: 'completed', label: 'Completed' },
];

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    completed: 'bg-green-900 text-green-300',
    processing: 'bg-blue-900 text-blue-300',
    pending: 'bg-yellow-900 text-yellow-300',
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${styles[status] ?? 'bg-gray-700 text-gray-300'}`}>
      {status}
    </span>
  );
}

function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter') ?? 'all';

  const [activeTab, setActiveTab] = useState(filterParam);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchOrders();
  }, [router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async (orderId: string) => {
    setCompleting(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/complete`, { method: 'PATCH' });
      if (res.ok) fetchOrders();
    } catch (e) {
      console.error(e);
    } finally {
      setCompleting(null);
    }
  };

  const filtered = activeTab === 'all'
    ? orders
    : orders.filter((o) => o.status === activeTab);

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Orders</h1>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {TABS.map((tab) => {
            const count = tab.key === 'all'
              ? orders.length
              : orders.filter((o) => o.status === tab.key).length;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {tab.label}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.key ? 'bg-blue-800' : 'bg-gray-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Orders */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              No {activeTab === 'all' ? '' : activeTab} orders yet.
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
                    {filtered.map((order, i) => (
                      <tr key={order.id} className={i % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                        <td className="px-4 py-3 text-xs text-white font-mono">{order.customerPhone}</td>
                        <td className="px-4 py-3 text-xs text-white">{order.network.name}</td>
                        <td className="px-4 py-3 text-xs text-white">{order.package.amount}</td>
                        <td className="px-4 py-3 text-xs text-white font-bold">{CURRENCY.symbol}{order.amount}</td>
                        <td className="px-4 py-3 text-xs">{statusBadge(order.status)}</td>
                        <td className="px-4 py-3 text-xs">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${order.paymentStatus === 'completed' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {order.status !== 'completed' && (
                            <button
                              onClick={() => handleComplete(order.id)}
                              disabled={completing === order.id}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded text-xs font-bold transition-all"
                            >
                              {completing === order.id ? '...' : '✓ Done'}
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
                {filtered.map((order) => (
                  <div key={order.id} className="bg-gray-700 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="text-xs text-gray-400">Phone</p>
                        <p className="font-bold text-white font-mono">{order.customerPhone}</p>
                      </div>
                      {statusBadge(order.status)}
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
                          onClick={() => handleComplete(order.id)}
                          disabled={completing === order.id}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded text-xs font-bold transition-all"
                        >
                          {completing === order.id ? 'Saving...' : '✓ Mark Done'}
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

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <OrdersContent />
    </Suspense>
  );
}
