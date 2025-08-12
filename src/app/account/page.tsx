'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

interface TrialData {
  trial: {
    isActive: boolean;
    daysRemaining: number;
    endsAt: string | null;
    planId: string;
    startedAt: string;
    status: string;
  };
  user: {
    planId: string;
    subscriptionStatus: string;
  };
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [trialData, setTrialData] = useState<TrialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/account');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      fetchAccountData();
    }
  }, [status, session, router]);

  const fetchAccountData = async () => {
    try {
      setLoading(true);
      
      // Fetch subscription and trial data in parallel
      const [subscriptionRes, trialRes] = await Promise.all([
        fetch('/api/user/subscription'),
        fetch('/api/user/trial')
      ]);

      if (!subscriptionRes.ok || !trialRes.ok) {
        // Check if it's an authentication error
        if (subscriptionRes.status === 401 || trialRes.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to fetch account data');
      }

      const subscriptionData = await subscriptionRes.json();
      const trialDataResponse = await trialRes.json();

      setSubscription(subscriptionData);
      setTrialData(trialDataResponse);
    } catch (err) {
      console.error('Account data fetch error:', err);
      // Check if it's an authentication error
      if (err instanceof Error && err.message.includes('Unauthorized')) {
        setError('Du måste logga in för att se kontoinformation. Omdirigerar...');
        setTimeout(() => {
          router.push('/auth/signin?callbackUrl=/account');
        }, 2000);
      } else {
        setError('Kunde inte hämta kontoinformation. Kontrollera din internetanslutning och försök igen.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTrial = async () => {
    if (!confirm('Är du säker på att du vill avsluta din testperiod? Du kommer att nedgraderas till den kostnadsfria planen.')) {
      return;
    }

    try {
      setActionLoading('cancel_trial');
      
      const response = await fetch('/api/user/trial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'cancel_trial' }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel trial');
      }

      // Refresh account data
      await fetchAccountData();
      
      alert('Testperioden har avslutats. Du använder nu den kostnadsfria planen.');
    } catch (err) {
      console.error('Cancel trial error:', err);
      setError('Kunde inte avsluta testperioden');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-granite-50 pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-granite-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow h-48"></div>
              <div className="bg-white rounded-lg shadow h-32"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-granite-50 pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
            <button 
              onClick={fetchAccountData}
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-granite-900">Kontoinställningar</h1>
          <p className="mt-2 text-granite-600">Hantera ditt konto, prenumeration och inställningar</p>
        </div>

        <div className="space-y-6">
          {/* Account Information */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-granite-200">
              <h2 className="text-lg font-semibold text-granite-900">Kontoinformation</h2>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-granite-700">Namn</label>
                  <p className="mt-1 text-sm text-granite-900">{session?.user?.name || 'Ej angivet'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-granite-700">E-post</label>
                  <p className="mt-1 text-sm text-granite-900">{session?.user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-granite-700">Medlemskap sedan</label>
                  <p className="mt-1 text-sm text-granite-900">
                    {trialData?.trial?.startedAt ? formatDate(trialData.trial.startedAt) : 'Okänt'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-granite-700">Kontostatus</label>
                  <p className="mt-1 text-sm text-granite-900">
                    {subscription?.subscriptionStatus === 'trialing' ? 'Testperiod' : 'Aktiv'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Information */}
          {subscription && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-granite-200">
                <h2 className="text-lg font-semibold text-granite-900">Prenumerationsinformation</h2>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-granite-700">Nuvarande plan</label>
                    <p className="mt-1 text-sm text-granite-900 font-medium">{subscription.planName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-granite-700">Minneslundar</label>
                    <p className="mt-1 text-sm text-granite-900">
                      {subscription.memorialCount} av {subscription.maxMemorials === -1 ? 'obegränsat' : subscription.maxMemorials}
                    </p>
                  </div>
                  {subscription.isTrialActive && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-granite-700">Testperiod slutar</label>
                        <p className="mt-1 text-sm text-granite-900">
                          {subscription.trialEndsAt ? formatDate(subscription.trialEndsAt) : 'Okänt'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-granite-700">Dagar kvar</label>
                        <p className="mt-1 text-sm text-orange-600 font-medium">
                          {subscription.trialDaysRemaining} dagar
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-6 flex space-x-4">
                  <Link
                    href="/pricing"
                    className="bg-copper-600 hover:bg-copper-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {subscription.isTrialActive ? 'Uppgradera nu' : 'Ändra plan'}
                  </Link>
                  
                  {subscription.isTrialActive && (
                    <button
                      onClick={handleCancelTrial}
                      disabled={actionLoading === 'cancel_trial'}
                      className="bg-granite-600 hover:bg-granite-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {actionLoading === 'cancel_trial' ? 'Avbryter...' : 'Avsluta testperiod'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Trial Information */}
          {trialData?.trial?.isActive && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg">
              <div className="px-6 py-4 border-b border-orange-200">
                <h2 className="text-lg font-semibold text-orange-900">Testperiodinformation</h2>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-orange-700">Testplan</label>
                    <p className="mt-1 text-sm text-orange-900">{trialData.trial.planId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-orange-700">Status</label>
                    <p className="mt-1 text-sm text-orange-900 capitalize">{trialData.trial.status}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-orange-700">Startade</label>
                    <p className="mt-1 text-sm text-orange-900">
                      {formatDate(trialData.trial.startedAt)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-orange-700">Slutar</label>
                    <p className="mt-1 text-sm text-orange-900">
                      {trialData.trial.endsAt ? formatDate(trialData.trial.endsAt) : 'Okänt'}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-orange-100 rounded-md">
                  <p className="text-sm text-orange-800">
                    <strong>Viktigt:</strong> Din testperiod slutar om {trialData.trial.daysRemaining} dagar. 
                    Efter det kommer du att nedgraderas till den kostnadsfria planen om du inte uppgraderar.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Account Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-granite-200">
              <h2 className="text-lg font-semibold text-granite-900">Kontoåtgärder</h2>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center text-copper-600 hover:text-copper-500 text-sm font-medium"
                  >
                    ← Tillbaka till dashboard
                  </Link>
                </div>
                <div>
                  <Link
                    href="/memorial/create"
                    className="inline-flex items-center text-copper-600 hover:text-copper-500 text-sm font-medium"
                  >
                    Skapa ny minneslund
                  </Link>
                </div>
                <div>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center text-copper-600 hover:text-copper-500 text-sm font-medium"
                  >
                    Visa priser och planer
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}