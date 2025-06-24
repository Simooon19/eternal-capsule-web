'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { subscriptionPlans, formatPrice } from '@/lib/stripe';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    organization: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Account info, 2: Organization (optional)
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan') || 'free';
  const redirectTo = searchParams.get('redirect');
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const selectedPlan = subscriptionPlans[planId as keyof typeof subscriptionPlans];

  useEffect(() => {
    // Pre-fill organization field for non-free plans
    if (planId !== 'free' && !formData.organization) {
      setFormData(prev => ({ ...prev, organization: 'Funeral Home' }));
    }
  }, [planId, formData.organization]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Fullständigt namn krävs');
      return false;
    }
    if (!formData.email.trim()) {
      setError('E-post krävs');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Vänligen ange en giltig e-postadress');
      return false;
    }
    if (!formData.password) {
      setError('Lösenord krävs');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Lösenordet måste vara minst 8 tecken långt');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Lösenorden matchar inte');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Create account
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          organization: formData.organization.trim() || undefined,
          planId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      // Sign in the user
      const signInResult = await signIn('credentials', {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error('Account created but sign-in failed. Please try signing in manually.');
      }

      // Handle post-signup flow
      if (redirectTo === 'checkout' && planId !== 'free') {
        // Redirect to checkout for paid plans
        router.push(`/api/checkout/create?planId=${planId}`);
      } else {
        // Redirect to dashboard with welcome message
        router.push(`${callbackUrl}?welcome=true&plan=${planId}`);
      }

    } catch (error: any) {
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    const callbackUrl = redirectTo === 'checkout' && planId !== 'free' 
      ? `/checkout?planId=${planId}`
      : `/dashboard?welcome=true&plan=${planId}`;
    
    await signIn('google', { callbackUrl });
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Skapa Ditt Konto
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Har du redan ett konto?{' '}
            <Link 
              href={`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="font-medium text-copper-600 hover:text-copper-500"
            >
              Logga in här
            </Link>
          </p>
        </div>

        {/* Plan Selection Display */}
        {selectedPlan && (
          <div className="bg-copper-50 dark:bg-copper-900/20 border border-copper-200 dark:border-copper-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-copper-900 dark:text-copper-100">
                  {selectedPlan.name} Plan
                </h3>
                <p className="text-sm text-copper-700 dark:text-copper-300">
                  {selectedPlan.price === 0 
                    ? 'Gratis för alltid' 
                    : `${formatPrice(selectedPlan.price)}/${selectedPlan.interval === 'month' ? 'månad' : (selectedPlan.interval || '')}`
                  }
                </p>
              </div>
              <Link
                href="/pricing"
                className="text-sm text-copper-600 hover:text-copper-500"
              >
                Ändra paket
              </Link>
            </div>
            {selectedPlan.price > 0 && (
              <p className="text-xs text-copper-600 dark:text-copper-400 mt-2">
                ✨ Inkluderar 30 dagars gratis provperiod
              </p>
            )}
          </div>
        )}

        {/* Signup Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-200 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Fullständigt Namn *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-copper-500 focus:border-copper-500 focus:z-10 sm:text-sm"
                placeholder="Ange ditt fullständiga namn"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                E-postadress *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-copper-500 focus:border-copper-500 focus:z-10 sm:text-sm"
                placeholder="Ange din e-post"
              />
            </div>

            {planId !== 'free' && (
              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Organisation (Valfritt)
                </label>
                <input
                  id="organization"
                  name="organization"
                  type="text"
                  autoComplete="organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-copper-500 focus:border-copper-500 focus:z-10 sm:text-sm"
                  placeholder="Begravningsbyrå"
                />
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Lösenord *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-copper-500 focus:border-copper-500 focus:z-10 sm:text-sm"
                placeholder="Skapa ett lösenord (min. 8 tecken)"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Bekräfta Lösenord *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-copper-500 focus:border-copper-500 focus:z-10 sm:text-sm"
                placeholder="Bekräfta ditt lösenord"
              />
            </div>
          </div>

          {/* Terms and Privacy */}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Genom att skapa ett konto godkänner du våra{' '}
            <Link href="/terms" className="text-copper-600 hover:text-copper-500">
              Användarvillkor
            </Link>{' '}
            och{' '}
            <Link href="/privacy" className="text-copper-600 hover:text-copper-500">
              Integritetspolicy
            </Link>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-copper-600 hover:bg-copper-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-copper-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Skapar Konto...
                </div>
              ) : (
                <>
                  Skapa Konto
                  {selectedPlan?.price > 0 && ' & Starta Provperiod'}
                </>
              )}
            </button>
          </div>

          {/* OAuth Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  Eller fortsätt med
                </span>
              </div>
            </div>

            {/* Google Sign Up */}
            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={isLoading}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                <span className="ml-2">Registrera med Google</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
} 