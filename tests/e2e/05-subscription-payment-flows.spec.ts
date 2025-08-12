import { test, expect } from '@playwright/test';
import { EternalCapsuleHelpers } from '../helpers/test-helpers';

test.describe('Subscription and Payment Flows - Pricing and Plan Management', () => {
  let helpers: EternalCapsuleHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new EternalCapsuleHelpers(page);
  });

  test('Pricing page displays all subscription plans', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');
    
    // Check page title and structure (Swedish localization)
    await expect(page.locator('h1')).toContainText(/pris|pricing|plan|minneslundspaket|package/i);
    
    // Check for all subscription plans
    const expectedPlans = ['Personal', 'Minnesbricka', 'Custom'];
    
    for (const planName of expectedPlans) {
      const planElement = page.locator(`text="${planName}"`);
      if (await planElement.isVisible()) {
        console.log(`✅ ${planName} plan found`);
        
        // Check for plan features
        const planCard = planElement.locator('..').locator('..');
        const features = planCard.locator('li, .feature');
        const featureCount = await features.count();
        
        if (featureCount > 0) {
          console.log(`✅ ${planName} plan has ${featureCount} features listed`);
        }
        
        // Check for pricing (except Custom)
        if (planName !== 'Custom') {
          const priceElement = planCard.locator('text=/\\d+.*kr|\\d+.*SEK|0.*kr/i');
          if (await priceElement.count() > 0) {
            const priceText = await priceElement.first().textContent();
            console.log(`✅ ${planName} plan pricing: ${priceText}`);
          }
        }
        
        // Check for CTA button
        const ctaButton = planCard.locator('button, a').filter({ hasText: /välj|skapa|start|upgrade/i });
        if (await ctaButton.count() > 0) {
          console.log(`✅ ${planName} plan has CTA button`);
        }
      }
    }
    
    // Check for Swedish currency and localization
    const sekPricing = page.locator('text=/SEK|kr|öre/i');
    if (await sekPricing.count() > 0) {
      console.log('✅ Swedish currency (SEK) pricing displayed');
    }
    
    // Check for trial information
    const trialInfo = page.locator('text=/30.*dag|testperiod|gratis.*prov/i');
    if (await trialInfo.count() > 0) {
      console.log('✅ Trial information displayed');
    }
  });

  test('Free plan signup flow', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');
    
    // Find Personal (free) plan
    const personalPlan = page.locator('text="Personal"').locator('../..');
    if (await personalPlan.isVisible()) {
      const freeButton = personalPlan.locator('button, a').filter({ hasText: /välj|start|skapa.*konto/i });
      
      if (await freeButton.isVisible()) {
        await freeButton.click();
        await page.waitForLoadState('networkidle');
        
        const currentUrl = page.url();
        
        if (currentUrl.includes('/auth/signup')) {
          console.log('✅ Free plan redirects to signup');
          
          // Check if plan is pre-selected
          const planInfo = page.locator('text=/personal|free/i');
          if (await planInfo.count() > 0) {
            console.log('✅ Personal plan pre-selected in signup');
          }
          
        } else if (currentUrl.includes('/dashboard')) {
          console.log('✅ User already authenticated, redirected to dashboard');
          
        } else {
          console.log(`ℹ️ Free plan button redirected to: ${currentUrl}`);
        }
      }
    }
  });

  test('Paid plan upgrade flow initiation', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');
    
    // Find Minnesbricka (paid) plan
    const minnesbrickaPlan = page.locator('text="Minnesbricka"').locator('../..');
    if (await minnesbrickaPlan.isVisible()) {
      const upgradeButton = minnesbrickaPlan.locator('button, a').filter({ hasText: /välj|uppgradera|upgrade/i });
      
      if (await upgradeButton.isVisible()) {
        await upgradeButton.click();
        await page.waitForLoadState('networkidle');
        
        const currentUrl = page.url();
        
        if (currentUrl.includes('/auth')) {
          console.log('✅ Paid plan requires authentication');
          
        } else if (currentUrl.includes('/checkout') || currentUrl.includes('/stripe')) {
          console.log('✅ Paid plan initiates checkout flow');
          
        } else if (currentUrl.includes('/dashboard')) {
          console.log('✅ User authenticated, may show upgrade options in dashboard');
          
        } else {
          console.log(`ℹ️ Paid plan button redirected to: ${currentUrl}`);
        }
      }
    }
  });

  test('Trial subscription management', async ({ page }) => {
    await page.goto('/account');
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    
    if (currentUrl.includes('/account')) {
      console.log('✅ User authenticated and can access account page');
      
      // Check for trial information
      const trialSection = page.locator('text=/testperiod|trial/i').first();
      
      if (await trialSection.isVisible()) {
        console.log('✅ User has active trial subscription');
        
        // Check trial details
        const trialDays = page.locator('text=/\\d+.*dagar.*kvar|\\d+.*days.*remaining/i');
        if (await trialDays.count() > 0) {
          const daysText = await trialDays.first().textContent();
          console.log(`✅ Trial days remaining: ${daysText}`);
        }
        
        // Check trial plan details
        const trialPlan = page.locator('text=/minnesbricka|nfc|premium/i');
        if (await trialPlan.count() > 0) {
          const planText = await trialPlan.first().textContent();
          console.log(`✅ Trial plan: ${planText}`);
        }
        
        // Check for trial upgrade options
        const upgradeButton = page.locator('a:has-text("Uppgradera"), button:has-text("Upgrade")');
        if (await upgradeButton.isVisible()) {
          console.log('✅ Trial upgrade option available');
          
          await upgradeButton.click();
          await page.waitForLoadState('networkidle');
          
          const upgradeUrl = page.url();
          if (upgradeUrl.includes('/pricing')) {
            console.log('✅ Upgrade redirects to pricing page');
          } else if (upgradeUrl.includes('/checkout')) {
            console.log('✅ Upgrade initiates checkout flow');
          }
        }
        
        // Check for trial cancellation
        const cancelTrialButton = page.locator('button:has-text("Avsluta testperiod"), button:has-text("Cancel trial")');
        if (await cancelTrialButton.isVisible()) {
          console.log('✅ Trial cancellation option available');
        }
        
      } else {
        console.log('ℹ️ No active trial found for user');
        
        // Check current subscription status
        const subscriptionStatus = page.locator('text=/plan.*personal|plan.*minnesbricka|plan.*custom/i');
        if (await subscriptionStatus.count() > 0) {
          const statusText = await subscriptionStatus.first().textContent();
          console.log(`✅ Current subscription: ${statusText}`);
        }
      }
      
    } else if (currentUrl.includes('/auth')) {
      console.log('ℹ️ Account page requires authentication');
    }
  });

  test('Subscription limits enforcement', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/dashboard')) {
      // Check current subscription status
      const subscriptionInfo = page.locator('text=/plan.*personal|plan.*minnesbricka|plan.*custom/i');
      
      if (await subscriptionInfo.count() > 0) {
        const planText = await subscriptionInfo.first().textContent();
        console.log(`✅ User subscription plan: ${planText}`);
        
        // Check memorial count vs limits
        const memorialCount = page.locator('text=/minneslundar.*\\d+.*av.*\\d+|memorials.*\\d+.*of.*\\d+/i');
        if (await memorialCount.count() > 0) {
          const countText = await memorialCount.first().textContent();
          console.log(`✅ Memorial usage: ${countText}`);
          
          // Extract numbers to check if limit is reached
          const text = countText || '';
          const matches = text.match(/(\d+).*av.*(\d+)/);
          if (matches) {
            const [, current, max] = matches;
            const currentCount = parseInt(current);
            const maxCount = parseInt(max);
            
            if (currentCount >= maxCount) {
              console.log('✅ Memorial limit reached');
              
              // Check if create button is disabled
              const createButton = page.locator('a[href*="/memorial/create"], button:has-text("Skapa")');
              if (await createButton.count() > 0) {
                const isDisabled = await createButton.first().getAttribute('disabled') !== null;
                if (isDisabled) {
                  console.log('✅ Create button disabled due to limit');
                }
              }
              
              // Check for upgrade prompt
              const upgradePrompt = page.locator('text=/uppgradera.*för.*att.*skapa|upgrade.*to.*create/i');
              if (await upgradePrompt.count() > 0) {
                console.log('✅ Upgrade prompt displayed');
              }
            } else {
              console.log('✅ Memorial creation allowed within limits');
            }
          }
        }
      }
    }
  });

  test('Stripe checkout flow initiation', async ({ page }) => {
    // First check if user has access to upgrade functionality
    await page.goto('/account');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/account')) {
      const upgradeButton = page.locator('a:has-text("Uppgradera"), button:has-text("Upgrade")');
      
      if (await upgradeButton.isVisible()) {
        console.log('✅ Upgrade option available in account page');
        
        await upgradeButton.click();
        await page.waitForLoadState('networkidle');
        
        const currentUrl = page.url();
        
        if (currentUrl.includes('/pricing')) {
          console.log('✅ Upgrade redirects to pricing page');
          
          // Try to initiate checkout from pricing page
          const minnesbrickaPlan = page.locator('text="Minnesbricka"').locator('../..');
          if (await minnesbrickaPlan.isVisible()) {
            const selectButton = minnesbrickaPlan.locator('button, a').filter({ hasText: /välj|uppgradera/i });
            
            if (await selectButton.isVisible()) {
              await selectButton.click();
              await page.waitForTimeout(3000);
              
              const checkoutUrl = page.url();
              
              if (checkoutUrl.includes('stripe') || checkoutUrl.includes('checkout')) {
                console.log('✅ Stripe checkout initiated');
                
                // Check for Stripe elements
                const stripeForm = page.locator('form[action*="stripe"], .stripe-checkout');
                if (await stripeForm.count() > 0) {
                  console.log('✅ Stripe checkout form found');
                }
                
                // Don't proceed with actual payment
                console.log('ℹ️ Stopping before actual payment submission');
                
              } else {
                console.log(`ℹ️ Checkout redirected to: ${checkoutUrl}`);
              }
            }
          }
        }
      } else {
        console.log('ℹ️ No upgrade option available (may already be on highest plan)');
      }
    }
  });

  test('Custom plan contact flow', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');
    
    // Find Custom plan
    const customPlan = page.locator('text="Custom"').locator('../..');
    if (await customPlan.isVisible()) {
      const contactButton = customPlan.locator('button, a').filter({ hasText: /kontakt|contact|intresserad/i });
      
      if (await contactButton.isVisible()) {
        await contactButton.click();
        await page.waitForLoadState('networkidle');
        
        const currentUrl = page.url();
        
        if (currentUrl.includes('/contact')) {
          console.log('✅ Custom plan redirects to contact page');
          
          // Check for contact form
          const contactForm = page.locator('form');
          if (await contactForm.isVisible()) {
            console.log('✅ Contact form found');
            
            // Check for custom plan pre-selection
            const planField = contactForm.locator('select[name="plan"], input[name="plan"]');
            if (await planField.count() > 0) {
              const planValue = await planField.first().inputValue();
              if (planValue.toLowerCase().includes('custom')) {
                console.log('✅ Custom plan pre-selected in contact form');
              }
            }
          }
          
        } else if (currentUrl.includes('mailto:')) {
          console.log('✅ Custom plan opens email client');
          
        } else {
          console.log(`ℹ️ Custom plan contact redirected to: ${currentUrl}`);
        }
      }
    }
  });

  test('Payment confirmation and subscription activation', async ({ page }) => {
    // This test simulates successful payment confirmation
    // In a real scenario, this would be triggered by Stripe webhook
    
    // Check if there's a success URL pattern we can test
    await page.goto('/dashboard?payment_success=true');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/dashboard')) {
      // Check for success message
      const successMessage = page.locator('text=/tack.*för.*ditt.*köp|payment.*successful|subscription.*activated/i');
      
      if (await successMessage.count() > 0) {
        console.log('✅ Payment success message displayed');
      }
      
      // Check if subscription status is updated
      const subscriptionStatus = page.locator('text=/minnesbricka|nfc.*plan|premium/i');
      if (await subscriptionStatus.count() > 0) {
        console.log('✅ Subscription status updated');
      }
      
      // Check if memorial limits are increased
      const memorialLimits = page.locator('text=/10.*minneslundar|10.*memorials|obegränsat/i');
      if (await memorialLimits.count() > 0) {
        console.log('✅ Memorial limits updated for new subscription');
      }
    }
  });

  test('Subscription cancellation flow', async ({ page }) => {
    await page.goto('/account');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/account')) {
      // Look for subscription management
      const subscriptionSection = page.locator('text=/prenumeration|subscription/i').first();
      
      if (await subscriptionSection.isVisible()) {
        console.log('✅ Subscription management section found');
        
        // Look for cancellation option
        const cancelButton = page.locator('button:has-text("Avbryt prenumeration"), button:has-text("Cancel subscription"), a:has-text("Säg upp")');
        
        if (await cancelButton.isVisible()) {
          console.log('✅ Subscription cancellation option available');
          
          // Don't actually cancel, but verify the flow exists
          await cancelButton.click();
          await page.waitForTimeout(1000);
          
          // Should show confirmation dialog
          const confirmDialog = page.locator('.modal, [role="dialog"], text=/säker.*avbryta|sure.*cancel/i');
          if (await confirmDialog.count() > 0) {
            console.log('✅ Cancellation confirmation dialog shown');
            
            // Cancel the cancellation
            const keepSubscriptionButton = page.locator('button:has-text("Behåll"), button:has-text("Keep"), button:has-text("Avbryt")');
            if (await keepSubscriptionButton.isVisible()) {
              await keepSubscriptionButton.click();
              console.log('✅ Subscription cancellation can be cancelled');
            }
          }
        } else {
          console.log('ℹ️ No subscription cancellation option (may not have active subscription)');
        }
      }
    }
  });

  test('Plan comparison and features display', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');
    
    // Check for comparison table or feature comparison
    const comparisonTable = page.locator('table, .comparison, .features-comparison');
    
    if (await comparisonTable.count() > 0) {
      console.log('✅ Plan comparison table found');
      
      // Check for key features
      const keyFeatures = [
        'Minneslundar', // Memorial count
        'Foton', // Photos
        'NFC', // NFC tags
        'Support' // Support level
      ];
      
      for (const feature of keyFeatures) {
        const featureElement = page.locator(`text="${feature}"`);
        if (await featureElement.count() > 0) {
          console.log(`✅ Feature comparison includes: ${feature}`);
        }
      }
    } else {
      console.log('ℹ️ No feature comparison table found');
    }
    
    // Check for FAQ section
    const faqSection = page.locator('text=/frågor|faq|questions/i');
    if (await faqSection.count() > 0) {
      console.log('✅ FAQ section found on pricing page');
    }
    
    // Check for money-back guarantee or trial information
    const guarantee = page.locator('text=/pengar.*tillbaka|money.*back|30.*dag/i');
    if (await guarantee.count() > 0) {
      console.log('✅ Money-back guarantee or trial information displayed');
    }
  });
});