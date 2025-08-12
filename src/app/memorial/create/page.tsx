'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Memorial } from '@/types/memorial';

// Dynamically import the CreateMemorialWizard to avoid SSR issues
const CreateMemorialWizard = dynamic(
  () => import('@/components/memorial/CreateMemorialWizard'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-granite-50 pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-granite-200 rounded w-1/3 mb-4"></div>
            <div className="bg-white rounded-lg shadow p-8">
              <div className="space-y-4">
                <div className="h-4 bg-granite-200 rounded w-3/4"></div>
                <div className="h-4 bg-granite-200 rounded w-1/2"></div>
                <div className="h-32 bg-granite-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
);

interface UserSubscription {
  canCreate: boolean;
  planName: string;
  memorialCount: number;
  maxMemorials: number;
  isTrialActive: boolean;
}

export default function CreateMemorialPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/memorial/create');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      checkSubscriptionLimits();
    }
  }, [status, session, router]);

  const checkSubscriptionLimits = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/subscription');
      
      if (!response.ok) {
        throw new Error('Failed to check subscription limits');
      }

      const data = await response.json();
      setSubscription(data);
      
      if (!data.canCreate) {
        setError('Du har nått gränsen för antal minneslundar på din plan. Uppgradera för att skapa fler minneslundar.');
      }
    } catch (err) {
      console.error('Subscription check error:', err);
      setError('Kunde inte kontrollera kontostatus');
    } finally {
      setLoading(false);
    }
  };

  const handleMemorialComplete = async (memorialData: Partial<Memorial>) => {
    if (!session?.user?.id) {
      setError('Du måste vara inloggad för att skapa en minneslund');
      return;
    }

    try {
      setCreating(true);
      setError(null);
      
      // Add user ID to memorial data
      const memorialWithUser = {
        ...memorialData,
        createdBy: session.user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch('/api/memorials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memorialWithUser),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create memorial');
      }

      const result = await response.json();
      
      // Redirect to dashboard with success message
      router.push(`/dashboard?memorial_created=true&memorial_id=${result.memorial._id}`);
    } catch (err) {
      console.error('Memorial creation error:', err);
      setError(err instanceof Error ? err.message : 'Kunde inte skapa minneslund');
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-granite-50 pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-granite-200 rounded w-1/3 mb-4"></div>
            <div className="bg-white rounded-lg shadow p-8">
              <div className="space-y-4">
                <div className="h-4 bg-granite-200 rounded w-3/4"></div>
                <div className="h-4 bg-granite-200 rounded w-1/2"></div>
                <div className="h-32 bg-granite-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !subscription?.canCreate) {
    return (
      <div className="min-h-screen bg-granite-50 pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center">
              <div className="text-orange-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-granite-900 mb-2">Minneslunds-gräns nådd</h2>
              <p className="text-granite-600 mb-6">{error}</p>
              
              {subscription && (
                <div className="bg-granite-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-granite-600">
                    <span className="font-medium">Nuvarande plan:</span> {subscription.planName}<br />
                    <span className="font-medium">Minneslundar:</span> {subscription.memorialCount} av {subscription.maxMemorials}
                  </p>
                </div>
              )}
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => router.push('/pricing')}
                  className="bg-copper-600 hover:bg-copper-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
                >
                  Uppgradera plan
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-granite-600 hover:bg-granite-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
                >
                  Tillbaka till dashboard
                </button>
              </div>
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
            <div className="mt-2 space-x-4">
              <button 
                onClick={checkSubscriptionLimits}
                className="text-red-600 hover:text-red-500 text-sm underline"
              >
                Försök igen
              </button>
              <button 
                onClick={() => router.push('/dashboard')}
                className="text-red-600 hover:text-red-500 text-sm underline"
              >
                Tillbaka till dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-granite-50 pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-granite-900">Skapa en ny minneslund</h1>
          <p className="mt-2 text-granite-600">
            Skapa en vacker digital minneslund för att hedra minnet av en kär person
          </p>
          
          {subscription && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Plan:</span> {subscription.planName} • 
                <span className="font-medium"> Minneslundar:</span> {subscription.memorialCount} av {subscription.maxMemorials === -1 ? 'obegränsat' : subscription.maxMemorials}
                {subscription.isTrialActive && <span className="text-orange-600 ml-2">(Testperiod aktiv)</span>}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow">
          {creating && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-copper-600 mx-auto mb-4"></div>
                <p className="text-granite-600">Skapar minneslund...</p>
              </div>
            </div>
          )}
          
          <CreateMemorialWizard
            onComplete={handleMemorialComplete}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}