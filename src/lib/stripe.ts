import Stripe from 'stripe';

// Initialize Stripe
// Use the SDK's latest typed API version to satisfy TypeScript
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_build', {
  apiVersion: '2025-05-28.basil',
});

// Subscription plans configuration
export const subscriptionPlans = {
  personal: {
    id: 'personal',
    name: 'Personal',
    price: 0,
    interval: 'month' as const,
    maxMemorials: 3,
    description: 'Perfect for individuals creating personal memorials',
    features: [
      'Up to 3 memorial profiles',
      'Photo galleries (up to 50 photos per memorial)',
      'Guest messages and condolences',
      'QR code access to memorials',
      'Basic email support',
      'Forever memorial preservation',
      'Mobile-responsive design',
    ],
    stripePriceId: null,
  },
  minnesbricka: {
    id: 'minnesbricka',
    name: 'Minnesbricka',
    price: 2900, // 29 SEK in öre
    interval: 'month' as const,
    maxMemorials: 10,
    description: 'Förbättrad upplevelse med Minnesbricka-teknik för fysiska minneslundsanslutningar',
    features: [
      'Upp till 10 minneslundar',
      'Obegränsade foton och videor',
      'Fysiska Minnesbrickor inkluderade',
      'Avancerad gästbok med moderation',
      'Anpassade minneslunds-URLer',
      'Platskartläggning och vägbeskrivningar',
      'Prioriterad e-postsupport',
      'Årliga minneslundsrapporter',
      'Mobilappåtkomst',
    ],
    stripePriceId: process.env.STRIPE_MINNESBRICKA_PRICE_ID || 'price_minnesbricka_29_monthly_test',
  },
  custom: {
    id: 'custom',
    name: 'Custom',
    price: 0, // Contact for pricing
    interval: 'month' as const,
    maxMemorials: -1,
    description: 'Tailored solutions for funeral homes and organizations with specific needs',
    features: [
      'Unlimited memorial profiles',
      'Custom branding and white-label options',
      'Bulk creation and management tools',
      'Staff account management',
      'Advanced API integrations',
      'Custom features and development',
      'Dedicated account manager',
      '24/7 priority support',
      'Service level agreement (SLA)',
      'Training and onboarding',
      'Legacy system migration',
      'Compliance and regulatory assistance',
    ],
    stripePriceId: null,
  },
} as const;

export type PlanId = keyof typeof subscriptionPlans;

// Create Stripe customer
export async function createStripeCustomer(funeralHome: {
  name: string;
  email: string;
  phone?: string;
  address?: any;
}): Promise<Stripe.Customer> {
  const customer = await stripe.customers.create({
    name: funeralHome.name,
    email: funeralHome.email,
    phone: funeralHome.phone,
    address: funeralHome.address ? {
      line1: funeralHome.address.street,
      city: funeralHome.address.city,
      state: funeralHome.address.state,
      postal_code: funeralHome.address.zipCode,
      country: funeralHome.address.country || 'US',
    } : undefined,
    metadata: {
      funeralHomeName: funeralHome.name,
      source: 'eternal_capsule',
    },
  });

  return customer;
}

// Create checkout session for subscription
export async function createCheckoutSession({
  customerId,
  planId,
  successUrl,
  cancelUrl,
  funeralHomeId,
}: {
  customerId: string;
  planId: PlanId;
  successUrl: string;
  cancelUrl: string;
  funeralHomeId: string;
}): Promise<Stripe.Checkout.Session> {
  const plan = subscriptionPlans[planId];
  
  if (!plan.stripePriceId) {
    throw new Error(`No Stripe price ID configured for plan: ${planId}`);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: plan.stripePriceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    metadata: {
      funeralHomeId,
      planId,
    },
    subscription_data: {
      trial_period_days: 30,
      metadata: {
        funeralHomeId,
        planId,
      },
    },
    allow_promotion_codes: true,
    billing_address_collection: 'required',
  });

  return session;
}

// Handle successful payment
export async function handleSuccessfulPayment(sessionId: string): Promise<{
  subscription: Stripe.Subscription;
  customer: Stripe.Customer;
  funeralHomeId: string;
  planId: string;
}> {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['subscription', 'customer'],
  });

  if (!session.subscription || !session.customer) {
    throw new Error('Invalid session or missing subscription/customer');
  }

  const subscription = session.subscription as Stripe.Subscription;
  const customer = session.customer as Stripe.Customer;
  
  return {
    subscription,
    customer,
    funeralHomeId: session.metadata?.funeralHomeId || '',
    planId: session.metadata?.planId || '',
  };
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.cancel(subscriptionId);
}

// Update subscription
export async function updateSubscription({
  subscriptionId,
  newPlanId,
}: {
  subscriptionId: string;
  newPlanId: PlanId;
}): Promise<Stripe.Subscription> {
  const plan = subscriptionPlans[newPlanId];
  
  if (!plan.stripePriceId) {
    throw new Error(`No Stripe price ID configured for plan: ${newPlanId}`);
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: plan.stripePriceId,
      },
    ],
    proration_behavior: 'always_invoice',
  });
}

// Get subscription details
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

// Webhook signature verification
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, secret);
}

// Handle webhook events
export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionChange(event.data.object as Stripe.Subscription);
      break;
    
    case 'customer.subscription.deleted':
      await handleSubscriptionCancellation(event.data.object as Stripe.Subscription);
      break;
    
    case 'invoice.payment_failed':
      await handlePaymentFailure(event.data.object as Stripe.Invoice);
      break;
    
    case 'invoice.payment_succeeded':
      await handlePaymentSuccess(event.data.object as Stripe.Invoice);
      break;
    
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription): Promise<void> {
  const funeralHomeId = subscription.metadata?.funeralHomeId;
  const planId = subscription.metadata?.planId;
  
  if (!funeralHomeId) {
    console.error('No funeral home ID in subscription metadata');
    return;
  }

  // Update funeral home subscription status in Sanity
  const { client } = await import('@/lib/sanity');
  
  await client
    .patch(funeralHomeId)
    .set({
      'subscription.subscriptionId': subscription.id,
      'subscription.subscriptionStatus': subscription.status,
      'subscription.plan': planId,
      'subscription.nextBillingDate': new Date((subscription as any).current_period_end * 1000).toISOString(),
    })
    .commit();
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription): Promise<void> {
  const funeralHomeId = subscription.metadata?.funeralHomeId;
  
  if (!funeralHomeId) {
    console.error('No funeral home ID in subscription metadata');
    return;
  }

  // Update funeral home to free plan
  const { client } = await import('@/lib/sanity');
  
  await client
    .patch(funeralHomeId)
    .set({
      'subscription.plan': 'free',
      'subscription.subscriptionStatus': 'canceled',
      'subscription.maxMemorials': subscriptionPlans.personal.maxMemorials,
    })
    .commit();
}

async function handlePaymentFailure(invoice: Stripe.Invoice): Promise<void> {
  const customerId = invoice.customer as string;
  
  // Get customer and find associated funeral home
  const customer = await stripe.customers.retrieve(customerId);
  
  if (customer.deleted) {
    return;
  }

  // Send notification email (implement with your email service)
  console.log(`Payment failed for customer: ${customer.email}`);
}

async function handlePaymentSuccess(invoice: Stripe.Invoice): Promise<void> {
  const customerId = invoice.customer as string;
  
  // Get customer and find associated funeral home
  const customer = await stripe.customers.retrieve(customerId);
  
  if (customer.deleted) {
    return;
  }

  // Send confirmation email (implement with your email service)
  console.log(`Payment succeeded for customer: ${customer.email}`);
}

// Utility functions
export function formatPrice(oere: number): string {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
  }).format(oere / 100);
}

export function getPlanLimits(planId: PlanId): {
  maxMemorials: number;
  features: readonly string[];
} {
  const plan = subscriptionPlans[planId];
  return {
    maxMemorials: plan.maxMemorials,
    features: plan.features,
  };
}

export function canUpgrade(currentPlan: PlanId, targetPlan: PlanId): boolean {
  const plans = ['personal', 'minnesbricka', 'custom'] as const;
  const currentIndex = plans.indexOf(currentPlan as any);
  const targetIndex = plans.indexOf(targetPlan as any);
  
  // Custom plans are handled separately 
  if (currentPlan === 'custom' || targetPlan === 'custom') {
    return false; // Custom plans require contact for changes
  }
  
  return targetIndex > currentIndex;
}

// Check if user is in trial period
export function isTrialActive(trialEndsAt: Date | null): boolean {
  if (!trialEndsAt) return false;
  return new Date() < trialEndsAt;
}

// Get trial status information
export function getTrialStatus(trialEndsAt: Date | null): {
  isActive: boolean;
  daysRemaining: number;
  endsAt: Date | null;
} {
  if (!trialEndsAt) {
    return { isActive: false, daysRemaining: 0, endsAt: null };
  }

  const now = new Date();
  const isActive = now < trialEndsAt;
  const daysRemaining = isActive 
    ? Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return { isActive, daysRemaining, endsAt: trialEndsAt };
}

// Handle trial expiration
export async function handleTrialExpiration(userId: string): Promise<void> {
  const { client } = await import('@/lib/sanity');
  
  // Downgrade user to free plan
  await client
    .patch(userId)
    .set({
      'subscription.plan': 'personal',
      'subscription.subscriptionStatus': 'inactive',
      'subscription.maxMemorials': subscriptionPlans.personal.maxMemorials,
    })
    .commit();
}

export { stripe }; 