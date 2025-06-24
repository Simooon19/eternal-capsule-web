'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import Link from 'next/link';

// Add head content for SEO since this is now a client component
import { useEffect } from 'react';

function SignInContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const errorParam = searchParams.get('error');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError('Ogiltiga inloggningsuppgifter');
      } else if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      setError('Ett fel uppstod. Försök igen.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-pearl-50 dark:bg-granite-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-granite-900 dark:text-pearl-100">
              Logga in på ditt konto
            </h2>
            <p className="mt-2 text-center text-sm text-granite-600 dark:text-pearl-400">
              Eller{' '}
              <Link href="/auth/signup" className="font-medium text-copper-600 hover:text-copper-500">
                skapa ett nytt konto
              </Link>
            </p>
          </div>

          {(error || errorParam) && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error || (errorParam === 'OAuthAccountNotLinked' 
                ? 'Detta konto är redan kopplat till en annan inloggningsmetod.' 
                : 'Ett fel uppstod vid inloggningen.')}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <input type="hidden" name="remember" value="true" />
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  E-postadress
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-pearl-300 dark:border-granite-700 placeholder-granite-500 dark:placeholder-pearl-500 text-granite-900 dark:text-pearl-100 rounded-t-md focus:outline-none focus:ring-copper-500 focus:border-copper-500 focus:z-10 sm:text-sm bg-white dark:bg-granite-800"
                  placeholder="E-postadress"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Lösenord
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-pearl-300 dark:border-granite-700 placeholder-granite-500 dark:placeholder-pearl-500 text-granite-900 dark:text-pearl-100 rounded-b-md focus:outline-none focus:ring-copper-500 focus:border-copper-500 focus:z-10 sm:text-sm bg-white dark:bg-granite-800"
                  placeholder="Lösenord"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-copper-600 focus:ring-copper-500 border-pearl-300 dark:border-granite-700 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-granite-900 dark:text-pearl-100">
                  Kom ihåg mig
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-copper-600 hover:text-copper-500">
                  Glömt lösenordet?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-copper-600 hover:bg-copper-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-copper-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Loggar in...' : 'Logga in'}
              </button>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-pearl-300 dark:border-granite-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-pearl-50 dark:bg-granite-900 text-granite-500 dark:text-pearl-500">
                    Eller fortsätt med
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => signIn('google', { callbackUrl })}
                  className="w-full inline-flex justify-center py-2 px-4 border border-pearl-300 dark:border-granite-700 rounded-md shadow-sm bg-white dark:bg-granite-800 text-sm font-medium text-granite-700 dark:text-pearl-300 hover:bg-pearl-50 dark:hover:bg-granite-700"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="ml-2">Google</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-pearl-50 dark:bg-granite-900 flex items-center justify-center">
        <div className="animate-pulse text-granite-600 dark:text-pearl-400">Laddar...</div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
} 