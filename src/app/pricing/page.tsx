import { Navigation } from '@/components/Navigation';
import PricingCard from '@/components/pricing/PricingCard';
import FAQ from '@/components/pricing/FAQ';
import { type PlanId } from '@/lib/stripe';

export default function PricingPage() {
  const plans = [
    {
      id: 'personal' as PlanId,
      name: 'Personal',
      price: 0,
      interval: null,
      maxMemorials: 3,
      description: 'Perfekt för privatpersoner som skapar personliga minneslundar',
      features: [
        'Upp till 3 minneslundsprofiler',
        '50 foton per minneslund',
        'Interaktiv gästbok',
        'Dela via länk'
      ] as const,
      stripePriceId: null,
    },
    {
      id: 'nfc' as PlanId,
      name: 'NFC',
      price: 32000, // 320 SEK in öre (320 * 100)
      interval: 'month',
      maxMemorials: 10,
      description: 'Förbättrade minneslundar med NFC-teknik för åtkomst vid graven',
      features: [
        'Upp till 10 minneslundsprofiler',
        'Obegränsade foton och videor',
        'Fysiska NFC-taggar inkluderade',
        'Prioriterad support'
      ] as const,
      stripePriceId: process.env.NEXT_PUBLIC_STRIPE_NFC_PRICE_ID || null,
    },
    {
      id: 'custom' as PlanId,
      name: 'Custom',
      price: 0, // Contact for pricing
      interval: null,
      maxMemorials: -1,
      description: 'Skräddarsydda lösningar för begravningsbyråer och organisationer',
      features: [
        'Obegränsade minneslundsprofiler',
        'Anpassad varumärkesprofilering',
        'API-åtkomst',
        'Dedikerad support'
      ] as const,
      stripePriceId: null,
    },
  ];

  return (
    <>
      <Navigation />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-granite-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold text-granite-900 mb-4">
              Minneslundspaket
            </h1>
            <p className="text-xl text-granite-700">
              Välj det perfekta paketet för att hedra och bevara värdefulla minnen.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <PricingCard 
                  key={plan.id} 
                  plan={plan} 
                  isPopular={plan.id === 'nfc'}
                  locale="sv"
                  delay={index * 100}
                />
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQ />
      </main>
    </>
  );
} 