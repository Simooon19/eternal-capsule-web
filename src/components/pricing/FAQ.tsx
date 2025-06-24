'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // FAQ data in Swedish
  const faqData: FAQItem[] = [
    {
      question: "Kan jag uppgradera eller nedgradera mitt paket?",
      answer: "Ja, du kan ändra ditt paket när som helst. Vid uppgradering blir nya funktioner tillgängliga omedelbart. Vid nedgradering behåller du tillgång till premiumfunktioner till slutet av din nuvarande faktureringsperiod."
    },
    {
      question: "Vad händer om jag överskrider min minneslundsgräns?",
      answer: "Om du når ditt pakets minneslundsgräns uppmanas du att uppgradera för att fortsätta skapa nya minneslundar. Befintliga minneslundar förblir aktiva och tillgängliga."
    },
    {
      question: "Erbjuder ni återbetalning?",
      answer: "Vi erbjuder 30 dagars pengarna-tillbaka-garanti för alla betalda paket. Om du inte är nöjd med vår tjänst, kontakta oss inom 30 dagar efter köpet för full återbetalning."
    },
    {
      question: "Hur fungerar 30-dagars provperioden?",
      answer: "Nya prenumeranter får en 30-dagars gratis provperiod på betalda paket. Du kan avsluta när som helst under provperioden utan att debiteras. Efter provperioden debiteras du automatiskt om du inte avbryter."
    },
    {
      question: "Vilka betalningsmetoder accepterar ni?",
      answer: "Vi accepterar alla större kreditkort (Visa, MasterCard, American Express) och betalkort genom vår säkra Stripe-betalningsprocessor."
    },
    {
      question: "Hur avbryter jag min prenumeration?",
      answer: "Du kan avbryta din prenumeration när som helst från dina kontoinställningar. Ditt paket förblir aktivt till slutet av din nuvarande faktureringsperiod."
    },
    {
      question: "Erbjuder ni årlig faktureringsrabatt?",
      answer: "För närvarande erbjuder vi månadsfakturering. Årliga faktureringsalternativ med rabatter kan bli tillgängliga i framtiden. Kontakta oss för företagspriser."
    },
    {
      question: "Vad ingår i företagspaket?",
      answer: "Företagspaket inkluderar obegränsade minneslundar, anpassad varumärkesprofilering, API-åtkomst, dedikerad support, personalutbildning och anpassade integrationer skräddarsydda för din organisations behov."
    },
    {
      question: "Hur säker är min data?",
      answer: "Vi använder företagskvalitets säkerhet inklusive SSL-kryptering, säkra säkerhetskopior och efterlevnad av dataskyddsregler. Din minneslundsdata lagras säkert och kommer att bevaras för kommande generationer."
    },
    {
      question: "Kan jag få en anpassad lösning för min begravningsbyrå?",
      answer: "Ja! Vi erbjuder anpassade lösningar för begravningsbyråer inklusive white-label-alternativ, bulkskapande verktyg, personalhantering och integrationer med befintliga system. Kontakta oss för att diskutera dina behov."
    }
  ];

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Vanliga Frågor
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Hitta svar på vanliga frågor om våra minneslundspaket
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqData.map((item, index) => (
            <div
              key={index}
              className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg transition-colors"
              >
                <span className="font-medium text-gray-900 dark:text-white pr-4">
                  {item.question}
                </span>
                <motion.svg
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </motion.svg>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Har du fortfarande frågor? Vi är här för att hjälpa dig komma igång.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-copper-600 hover:bg-copper-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-copper-500 transition-colors"
          >
            Kontakta Support
          </a>
        </div>
      </div>
    </section>
  );
} 