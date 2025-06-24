'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/motion';
import { useState, useEffect } from 'react';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  image?: string;
  primaryCta?: {
    text: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
  };
}

export default function HeroSection({
  title,
  subtitle,
  image = '/images/hero.svg',
  primaryCta,
  secondaryCta,
}: HeroSectionProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Clean title to prevent encoding issues
  const cleanTitle = title.replace(/[^\w\s]/g, '').trim();

  return (
    <section className="relative h-[70vh] min-h-[500px] w-full">
      <div className="absolute inset-0 pointer-events-none">
        <Image
          src={image}
          alt="Memorial background"
          fill
          priority
          sizes="100vw"
          className="object-cover pointer-events-none"
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40 pointer-events-none" />
      </div>
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4">
          {isMounted ? (
            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeIn}
              className="max-w-2xl text-white"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                {cleanTitle}
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-white/90">
                {subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {primaryCta && (
                  <Link
                    href={primaryCta.href}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-copper-500 hover:bg-copper-600"
                  >
                    {primaryCta.text}
                  </Link>
                )}
                {secondaryCta && (
                  <Link
                    href={secondaryCta.href}
                    className="inline-flex items-center justify-center px-6 py-3 border border-copper-500 text-base font-medium rounded-md text-white hover:bg-copper-500/10"
                  >
                    {secondaryCta.text}
                  </Link>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="max-w-2xl text-white">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                {cleanTitle}
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-white/90">
                {subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {primaryCta && (
                  <Link
                    href={primaryCta.href}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-copper-500 hover:bg-copper-600"
                  >
                    {primaryCta.text}
                  </Link>
                )}
                {secondaryCta && (
                  <Link
                    href={secondaryCta.href}
                    className="inline-flex items-center justify-center px-6 py-3 border border-copper-500 text-base font-medium rounded-md text-white hover:bg-copper-500/10"
                  >
                    {secondaryCta.text}
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
} 