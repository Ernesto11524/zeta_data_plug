'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminNav() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  const navItems = [
    { label: 'Orders', href: '/admin/orders' },
    { label: 'Networks', href: '/admin/networks' },
    { label: 'Packages', href: '/admin/packages' },
    { label: 'Settings', href: '/admin/settings' },
    { label: 'Homepage', href: '/' },
  ];

  return (
    <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/admin/dashboard" className="text-xl font-bold text-white">
          Admin
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-3 items-center">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-all text-sm text-white"
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-all text-sm text-white"
          >
            Logout
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-white hover:bg-gray-700 rounded-lg transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-700 border-t border-gray-600 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-sm text-white text-center transition-all"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={() => {
              handleLogout();
              setIsOpen(false);
            }}
            className="block w-full px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-sm text-white text-center transition-all"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
