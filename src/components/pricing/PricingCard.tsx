'use client';

import { useState } from 'react';
import { formatPrice, type PlanId } from '@/lib/stripe';

interface Plan {
  id: PlanId;
  name: string;
  price: number;
  interval: string | null;
  maxMemorials: number;
  description?: string;
  features: readonly string[];
  stripePriceId: string | null | undefined;
}

interface PricingCardProps {
  plan: Plan;
  isPopular?: boolean;
  delay?: number;
  locale?: string;
}

export default function PricingCard({ plan, isPopular = false, delay = 0, locale = 'en' }: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectPlan = async () => {
    if (typeof window === 'undefined') return;
    
    if (plan.id === 'personal') {
      // Redirect to sign up for free plan
      window.location.href = '/auth/signup?plan=personal';
      return;
    }

    if (plan.id === 'custom') {
      // Redirect to contact form for custom pricing
      window.location.href = `/contact?plan=${plan.id}&pricing=custom`;
      return;
    }

    setIsLoading(true);
    try {
      // Create Stripe checkout session
      const response = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        // If user is not logged in, redirect to signup with plan
        if (response.status === 401) {
          window.location.href = `/auth/signup?plan=${plan.id}&redirect=checkout`;
          return;
        }
        throw new Error(error);
      }

      // Redirect to Stripe checkout
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      // Fallback to contact form
      window.location.href = `/contact?plan=${plan.id}`;
    } finally {
      setIsLoading(false);
    }
  };

  // Use plan data directly (English only)
  const getPlanName = () => plan.name;
  const getPlanDescription = () => plan.description;
  const getPlanFeatures = () => plan.features;

  return (
    <div
      className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${
        isPopular ? 'ring-2 ring-slate-500 transform scale-105 z-10' : ''
      }`}
    >
      <div className="p-8">
        {/* Plan Header */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {getPlanName()}
          </h3>
          {getPlanDescription() && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {getPlanDescription()}
            </p>
          )}
          <div className="mb-4">
            {plan.id === 'personal' ? (
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                Gratis
              </span>
            ) : plan.id === 'custom' ? (
              <div className="text-center">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  Kontakta Oss
                </span>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  för anpassad prissättning
                </div>
              </div>
            ) : (
              <div>
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(plan.price)}
                </span>
                {plan.interval && (
                  <span className="text-gray-500 dark:text-gray-400">
                    /{plan.interval}
                  </span>
                )}
              </div>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            {plan.maxMemorials === -1 
              ? 'Obegränsade minneslundsprofiler'
              : `Upp till ${plan.maxMemorials} minneslundsprofiler`
            }
          </p>
        </div>

        {/* Features List */}
        <div className="mb-8">
          <ul className="space-y-3">
            {getPlanFeatures().map((feature: string, index: number) => (
              <li key={index} className="flex items-start">
                <svg
                  className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-600 dark:text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleSelectPlan}
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isPopular
              ? 'bg-slate-700 hover:bg-slate-800 text-white'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-slate-900 dark:text-white'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Laddar...
            </div>
          ) : (
            <>
              {plan.id === 'personal' ? 
                'Börja Minneslund' : 
               plan.id === 'custom' ? 
                'Få Offert' :
                'Starta Paket'}
            </>
          )}
        </button>

        {/* Additional Info */}
        {plan.id !== 'personal' && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            {plan.id === 'custom' ? 
              'Volymrabatter • Flexibla villkor' :
              '30 dagars provperiod • Avsluta när som helst'}
          </p>
        )}
      </div>
    </div>
  );
} 