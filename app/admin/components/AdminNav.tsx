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
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Orders', href: '/admin/orders' },
    { label: 'Networks', href: '/admin/networks' },
    { label: 'Packages', href: '/admin/packages' },
    { label: 'Settings', href: '/admin/settings' },
  ];

  return (
    <>
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
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
            onClick={() => setIsOpen(true)}
            className="md:hidden p-2 text-white hover:bg-gray-700 rounded-lg transition-all"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Side Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-gray-800 z-50 md:hidden flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-700">
          <span className="text-lg font-bold text-white">Menu</span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-3 rounded-xl font-bold text-sm text-white hover:bg-gray-700 transition-all"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logout at bottom */}
        <div className="px-4 py-6 border-t border-gray-700">
          <button
            onClick={() => { handleLogout(); setIsOpen(false); }}
            className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-sm text-white transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
