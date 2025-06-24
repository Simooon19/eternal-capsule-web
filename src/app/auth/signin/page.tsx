'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import Link from 'next/link';

// Add head content for SEO since this is now a client component
import { useEffect } from 'react';

export default function SignInPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  useEffect(() => {
    document.title = 'Logga in - Minneslund';
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Ogiltiga inloggningsuppgifter. Vänligen försök igen.');
      } else {
        router.push(callbackUrl);
      }
    } catch (error) {
      setError('Ett fel uppstod. Vänligen försök igen.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn('google', { callbackUrl });
  };
  return (
    <div>
      <Navigation />
      <main className="pt-16 min-h-screen bg-gradient-to-b from-granite-50 to-granite-100">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-granite-900 mb-2">
                Välkommen Tillbaka
              </h1>
              <p className="text-granite-600">
                Logga in på ditt konto för att hantera minneslundar och kontakta familjer.
              </p>
            </div>

            {/* Sign In Form */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-granite-700 mb-2">
                    E-postadress
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-granite-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-copper-500 focus:border-transparent"
                    placeholder="din.epost@exempel.se"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-granite-700 mb-2">
                    Lösenord
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-granite-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-copper-500 focus:border-transparent"
                    placeholder="Ange ditt lösenord"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-copper-600 focus:ring-copper-500 border-granite-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-granite-700">
                      Kom ihåg mig
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link href="/auth/forgot-password" className="text-copper-600 hover:text-copper-500">
                      Glömt ditt lösenord?
                    </Link>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-copper-600 hover:bg-copper-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-copper-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Loggar in...
                    </div>
                  ) : (
                    'Logga in'
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-granite-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-granite-500">Eller fortsätt med</span>
                  </div>
                </div>

                {/* Social Sign In */}
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full inline-flex justify-center py-2 px-4 border border-granite-300 rounded-lg shadow-sm bg-white text-sm font-medium text-granite-500 hover:bg-granite-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="ml-2">Logga in med Google</span>
                  </button>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-granite-600">
                  Har du inget konto?{' '}
                  <Link href="/auth/signup" className="text-copper-600 hover:text-copper-500 font-medium">
                    Registrera dig gratis
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 