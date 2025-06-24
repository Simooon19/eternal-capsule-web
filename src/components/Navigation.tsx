'use client';

import { useState } from 'react';
import Link from 'next/link';

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-granite-900 text-granite-50 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link 
                href="/" 
                className="text-xl font-bold text-copper-500 hover:text-copper-400"
                onClick={closeMobileMenu}
              >
                Minneslund
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/memorial/explore"
                className="border-transparent text-granite-200 hover:text-white hover:border-copper-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Utforska Minneslundar
              </Link>
              <Link
                href="/obituaries"
                className="border-transparent text-granite-200 hover:text-white hover:border-copper-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Dödsannonser
              </Link>
              <Link
                href="/pricing"
                className="border-transparent text-granite-200 hover:text-white hover:border-copper-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Priser
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <Link
              href="/auth/signin"
              className="text-granite-200 hover:text-white px-3 py-2 text-sm font-medium"
            >
              Logga in
            </Link>
            <Link
              href="/auth/signup"
              className="bg-copper-600 hover:bg-copper-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Registrera
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              type="button"
              className="text-granite-200 hover:text-white hover:bg-granite-700 p-2 rounded-md"
              aria-label="Toggle mobile menu"
              onClick={toggleMobileMenu}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
                  {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/memorial/explore"
                className="text-granite-200 hover:text-white hover:bg-granite-700 block px-3 py-2 rounded-md text-base font-medium"
                onClick={closeMobileMenu}
              >
                Utforska Minneslundar
              </Link>
              <Link
                href="/obituaries"
                className="text-granite-200 hover:text-white hover:bg-granite-700 block px-3 py-2 rounded-md text-base font-medium"
                onClick={closeMobileMenu}
              >
                Dödsannonser
              </Link>
              <Link
                href="/pricing"
                className="text-granite-200 hover:text-white hover:bg-granite-700 block px-3 py-2 rounded-md text-base font-medium"
                onClick={closeMobileMenu}
              >
                Priser
              </Link>
              <div className="border-t border-granite-700 pt-3 mt-3">
                <Link
                  href="/auth/signin"
                  className="text-granite-200 hover:text-white hover:bg-granite-700 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={closeMobileMenu}
                >
                  Logga in
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-copper-600 hover:bg-copper-700 text-white block px-3 py-2 rounded-md text-base font-medium mt-2"
                  onClick={closeMobileMenu}
                >
                  Registrera
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 