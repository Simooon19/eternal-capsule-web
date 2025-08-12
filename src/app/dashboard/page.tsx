'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Memorial } from '@/types/memorial';

interface UserSubscription {
  planId: string;
  planName: string;
  subscriptionStatus: string;
  memorialCount: number;
  maxMemorials: number;
  canCreate: boolean;
  isTrialActive: boolean;
  trialDaysRemaining: number;
  trialEndsAt: string | null;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [memorials, setMemorials] = useState<Memorial[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isWelcome = searchParams.get('welcome') === 'true';
  const plan = searchParams.get('plan');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      fetchDashboardData();
    }
  }, [status, session, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user memorials and subscription data in parallel
      const [memorialsRes, subscriptionRes] = await Promise.all([
        fetch('/api/user/memorials'),
        fetch('/api/user/subscription')
      ]);

      if (!memorialsRes.ok || !subscriptionRes.ok) {
        // Check if it's an authentication error
        if (memorialsRes.status === 401 || subscriptionRes.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to fetch dashboard data');
      }

      const memorialsData = await memorialsRes.json();
      const subscriptionData = await subscriptionRes.json();

      setMemorials(memorialsData.memorials || []);
      setSubscription(subscriptionData);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      // Check if it's an authentication error
      if (err instanceof Error && err.message.includes('Unauthorized')) {
        setError('Du måste logga in för att se dashboard-data. Omdirigerar...');
        setTimeout(() => {
          router.push('/auth/signin?callbackUrl=/dashboard');
        }, 2000);
      } else {
        setError('Kunde inte hämta dashboard-data. Kontrollera din internetanslutning och försök igen.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE');
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      active: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    const statusText = {
      pending: 'Väntar på godkännande',
      published: 'Publicerad',
      active: 'Aktiv',
      rejected: 'Avvisad'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'}`}>
        {statusText[status as keyof typeof statusText] || status}
      </span>
    );
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-granite-50 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-granite-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-granite-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow h-48"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-granite-50 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
            <button 
              onClick={fetchDashboardData}
              className="mt-2 text-red-600 hover:text-red-500 text-sm underline"
            >
              Försök igen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-granite-50 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        {isWelcome && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Välkommen till Minneslund!
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Ditt konto har skapats framgångsrikt. Du kan nu börja skapa minneslundar.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-granite-900">
            Hej, {session?.user?.name || session?.user?.email}
          </h1>
          <p className="mt-2 text-granite-600">Hantera dina minneslundar och kontoinställningar</p>
        </div>

        {/* Subscription Status */}
        {subscription && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-granite-900">Kontostatus</h2>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-granite-600">
                    <span className="font-medium">Plan:</span> {subscription.planName}
                  </p>
                  <p className="text-sm text-granite-600">
                    <span className="font-medium">Minneslundar:</span> {subscription.memorialCount} av {subscription.maxMemorials === -1 ? 'obegränsat' : subscription.maxMemorials}
                  </p>
                  {subscription.isTrialActive && (
                    <p className="text-sm text-orange-600">
                      <span className="font-medium">Testperiod:</span> {subscription.trialDaysRemaining} dagar kvar
                    </p>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Link
                  href="/pricing"
                  className="bg-copper-600 hover:bg-copper-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Uppgradera
                </Link>
                <Link
                  href="/account"
                  className="bg-granite-600 hover:bg-granite-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Kontoinställningar
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Create Memorial CTA */}
        <div className="bg-gradient-to-br from-copper-500 to-copper-600 rounded-lg shadow p-6 mb-8 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Skapa en ny minneslund</h2>
              <p className="mt-1 text-copper-100">Hedra minnet av en kär person med en vacker digital minneslund</p>
            </div>
            <Link
              href="/memorial/create"
              className={`bg-white text-copper-600 hover:bg-granite-50 px-6 py-3 rounded-md font-medium transition-colors ${
                !subscription?.canCreate ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={(e) => {
                if (!subscription?.canCreate) {
                  e.preventDefault();
                  alert('Du har nått gränsen för antal minneslundar på din plan. Uppgradera för att skapa fler.');
                }
              }}
            >
              Skapa minneslund
            </Link>
          </div>
        </div>

        {/* Memorials List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-granite-200">
            <h2 className="text-lg font-semibold text-granite-900">Mina minneslundar</h2>
          </div>
          
          {memorials.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-granite-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-granite-900 mb-2">Inga minneslundar än</h3>
              <p className="text-granite-600 mb-4">Du har inte skapat några minneslundar än.</p>
              <Link
                href="/memorial/create"
                className="bg-copper-600 hover:bg-copper-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Skapa din första minneslund
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-granite-200">
              {memorials.map((memorial) => (
                <div key={memorial._id} className="px-6 py-4 hover:bg-granite-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-granite-900">
                          {memorial.title || memorial.name}
                        </h3>
                        {getStatusBadge(memorial.status || 'pending')}
                      </div>
                      {memorial.subtitle && (
                        <p className="mt-1 text-sm text-granite-600">{memorial.subtitle}</p>
                      )}
                      <div className="mt-2 flex items-center space-x-4 text-sm text-granite-500">
                        {memorial.born && memorial.died && (
                          <span>{formatDate(memorial.born)} - {formatDate(memorial.died)}</span>
                        )}
                        {memorial.viewCount && (
                          <span>{memorial.viewCount} visningar</span>
                        )}
                        <span>Skapad {formatDate(memorial.createdAt || memorial._createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      {memorial.status === 'published' && (
                        <Link
                          href={`/memorial/${memorial.slug?.current || memorial._id}`}
                          className="text-copper-600 hover:text-copper-500 text-sm font-medium"
                        >
                          Visa
                        </Link>
                      )}
                      <Link
                        href={`/memorial/${memorial._id}/edit`}
                        className="text-granite-600 hover:text-granite-500 text-sm font-medium"
                      >
                        Redigera
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}