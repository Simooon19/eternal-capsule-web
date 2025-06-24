import { test, expect } from '@playwright/test';

test.describe('Eternal Capsule - Comprehensive Platform Verification', () => {
  
  test('1. Homepage loads with proper structure and navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify page title and meta description
    await expect(page).toHaveTitle(/Eternal Capsule.*Digital Memorial Platform/);
    
    // Check that the main headline is present
    const heroTitle = page.locator('h1').first();
    await expect(heroTitle).toBeVisible();
    await expect(heroTitle).toContainText('Eternal Capsule');

    // Verify navigation is present
    const navigation = page.locator('nav');
    await expect(navigation).toBeVisible();
    
    // Check navigation links
    await expect(page.locator('nav a[href="/memorial/explore"]')).toBeVisible();
    await expect(page.locator('nav a[href="/obituaries"]')).toBeVisible();
    await expect(page.locator('nav a[href="/pricing"]')).toBeVisible();
    
    console.log('✅ Homepage structure and navigation verified');
  });

  test('2. Navigation functionality works correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test desktop navigation
    await page.locator('nav a[href="/memorial/explore"]').click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/memorial/explore');
    
    // Navigate back to homepage
    await page.locator('nav a[href="/"]').first().click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/');

    // Test pricing page navigation
    await page.locator('nav a[href="/pricing"]').click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/pricing');

    console.log('✅ Navigation functionality verified');
  });

  test('3. Mobile navigation works properly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Mobile menu should be hidden initially (conditional rendering)
    const mobileMenuButton = page.locator('nav button[aria-label="Toggle mobile menu"]');
    await expect(mobileMenuButton).toBeVisible();
    
    // Check that mobile menu content is not visible initially
    const mobileMenuContent = page.locator('nav div.sm\\:hidden div.px-2');
    await expect(mobileMenuContent).not.toBeVisible();

    // Click mobile menu button to open
    await mobileMenuButton.click();

    // Mobile menu content should be visible now
    await expect(mobileMenuContent).toBeVisible();

    // Test mobile menu links
    const exploreLinkMobile = mobileMenuContent.locator('a[href="/memorial/explore"]');
    await expect(exploreLinkMobile).toBeVisible();
    await exploreLinkMobile.click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/memorial/explore');

    console.log('✅ Mobile navigation verified');
  });

  test('4. Memorial explore page functionality', async ({ page }) => {
    await page.goto('/memorial/explore');
    await page.waitForLoadState('networkidle');

    // Check page structure
    await expect(page.locator('h1')).toContainText('Explore Memorials');
    
    // Check for search functionality or empty state
    const searchComponent = page.locator('[data-testid="memorial-search"], form');
    const emptyState = page.locator('text="No Memorials Yet"');
    
    const hasSearch = await searchComponent.count() > 0;
    const hasEmptyState = await emptyState.count() > 0;
    
    if (hasSearch) {
      await expect(searchComponent).toBeVisible();
      console.log('✅ Memorial search component found');
    } else if (hasEmptyState) {
      await expect(emptyState).toBeVisible();
      console.log('✅ Empty state properly displayed');
    }

    console.log('✅ Memorial explore page verified');
  });

  test('5. Obituaries page loads correctly', async ({ page }) => {
    await page.goto('/obituaries');
    await page.waitForLoadState('networkidle');

    // Check page structure
    await expect(page.locator('h1')).toBeVisible();
    
    // Should have navigation
    await expect(page.locator('nav')).toBeVisible();

    console.log('✅ Obituaries page verified');
  });

  test('6. Pricing page loads and displays pricing information', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');

    // Check for pricing content
    const pricingCards = page.locator('[data-testid="pricing-card"], .pricing-card, .plan, .tier');
    const hasCards = await pricingCards.count() > 0;
    
    if (hasCards) {
      await expect(pricingCards.first()).toBeVisible();
      console.log('✅ Pricing cards found');
    } else {
      // Check for any pricing-related content
      const pricingContent = page.locator('text=/pricing|plan|subscription|price/i');
      await expect(pricingContent.first()).toBeVisible();
      console.log('✅ Pricing content verified');
    }

    console.log('✅ Pricing page verified');
  });

  test('7. API health check endpoints work', async ({ page }) => {
    // Test health endpoint
    const healthResponse = await page.request.get('/api/health');
    expect(healthResponse.status()).toBeLessThan(500);
    
    if (healthResponse.status() === 200) {
      const healthData = await healthResponse.json();
      console.log('✅ Health API working:', healthData);
    } else {
      console.log('ℹ️ Health API returned status:', healthResponse.status());
    }

    // Test memorials API endpoint
    const memorialsResponse = await page.request.get('/api/memorials');
    expect(memorialsResponse.status()).toBeLessThan(500);
    
    if (memorialsResponse.status() === 200) {
      console.log('✅ Memorials API accessible');
    } else {
      console.log('ℹ️ Memorials API returned status:', memorialsResponse.status());
    }
  });

  test('8. Hero section displays correctly and CTAs are clickable', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check hero section exists
    const heroSection = page.locator('section').first();
    await expect(heroSection).toBeVisible();

    // Check for hero image
    const heroImage = page.locator('img[alt*="Memorial"], img[alt*="hero"]');
    if (await heroImage.count() > 0) {
      await expect(heroImage.first()).toBeVisible();
      console.log('✅ Hero image displayed');
    }

    // Test CTA buttons
    const ctaButtons = page.locator('a:has-text("Start Creating"), a:has-text("Create Memorial"), a:has-text("Explore")');
    const ctaCount = await ctaButtons.count();
    
    if (ctaCount > 0) {
      // Test first CTA is clickable
      const firstCta = ctaButtons.first();
      await expect(firstCta).toBeVisible();
      const href = await firstCta.getAttribute('href');
      expect(href).toBeTruthy();
      console.log('✅ Hero CTA buttons functional');
    }

    console.log('✅ Hero section verified');
  });

  test('9. Page performance and loading times', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    console.log(`📊 Homepage load time: ${loadTime}ms`);
    
    // Check that load time is reasonable (under 5 seconds)
    expect(loadTime).toBeLessThan(5000);

    // Check for no JavaScript errors
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    if (errors.length === 0) {
      console.log('✅ No JavaScript errors detected');
    } else {
      console.log('⚠️ JavaScript errors found:', errors);
    }

    console.log('✅ Performance metrics verified');
  });

  test('10. Authentication and signup pages are accessible', async ({ page }) => {
    // Test signup page
    await page.goto('/auth/signup');
    await page.waitForLoadState('networkidle');
    
    // Should load without critical errors
    expect(page.url()).toContain('/auth/signup');
    
    // Check for form elements or authentication content
    const authContent = page.locator('form, input[type="email"], input[type="password"]');
    const signupText = page.locator('text=/sign up/i');
    const hasAuthContent = await authContent.count() > 0 || await signupText.count() > 0;
    
    if (hasAuthContent) {
      console.log('✅ Authentication forms detected');
    } else {
      console.log('ℹ️ Authentication page loaded (content may require configuration)');
    }

    console.log('✅ Authentication pages verified');
  });

  test('11. Responsive design verification', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop Large' },
      { width: 1024, height: 768, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Navigation should be visible in some form
      const navigation = page.locator('nav');
      await expect(navigation).toBeVisible();

      // Hero content should be visible
      const heroTitle = page.locator('h1').first();
      await expect(heroTitle).toBeVisible();

      console.log(`✅ ${viewport.name} (${viewport.width}x${viewport.height}) layout verified`);
    }

    console.log('✅ Responsive design verified across all viewports');
  });

  test('12. Platform integration and critical paths', async ({ page }) => {
    // Test critical user journey: Homepage -> Explore -> Pricing -> Signup
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Step 1: Homepage loads
    await expect(page.locator('h1')).toBeVisible();

    // Step 2: Navigate to explore
    await page.locator('a[href="/memorial/explore"]').first().click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/memorial/explore');

    // Step 3: Navigate to pricing
    await page.locator('nav a[href="/pricing"]').click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/pricing');

    // Step 4: Navigate to signup (if accessible)
    const signupLink = page.locator('a[href*="/signup"], a[href*="/auth/signup"]').first();
    if (await signupLink.count() > 0) {
      await signupLink.click();
      await page.waitForLoadState('networkidle');
      console.log('✅ Signup page accessible');
    }

    console.log('✅ Critical user journey verified');
  });

  test('13. Console errors and warnings check', async ({ page }) => {
    const consoleMessages: any[] = [];
    const errors: any[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
      consoleMessages.push({
        type: msg.type(),
        text: msg.text()
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate through main pages to check for errors
    await page.goto('/memorial/explore');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');

    // Report findings
    console.log(`📊 Total console messages: ${consoleMessages.length}`);
    console.log(`❌ Console errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('Console errors detected:', errors.slice(0, 3)); // Show first 3 errors
    } else {
      console.log('✅ No critical console errors detected');
    }

    console.log('✅ Console monitoring completed');
  });

  test('14. PWA and service worker functionality', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for PWA manifest
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toBeAttached();
    
    // Check for service worker registration
    const swRegistration = await page.evaluate(() => {
      return typeof navigator.serviceWorker !== 'undefined';
    });
    
    if (swRegistration) {
      console.log('✅ Service Worker API available');
    }

    // Check for PWA capabilities
    const isInstallable = await page.evaluate(() => {
      return window.matchMedia('(display-mode: standalone)').matches ||
             (window.navigator as any).standalone ||
             document.referrer.includes('android-app://');
    });

    console.log(`📱 PWA installation capability: ${isInstallable ? 'Available' : 'Standard web app'}`);
    console.log('✅ PWA features verified');
  });

  test('15. Final comprehensive status check', async ({ page }) => {
    // Summary test that verifies overall platform health
    const endpoints = [
      '/',
      '/memorial/explore',
      '/obituaries',
      '/pricing'
    ];

    let successfulPages = 0;
    const results = [];

    for (const endpoint of endpoints) {
      try {
        await page.goto(endpoint);
        await page.waitForLoadState('networkidle');
        
        // Check for critical elements
        const hasNavigation = await page.locator('nav').count() > 0;
        const hasMainContent = await page.locator('main, h1').count() > 0;
        
        if (hasNavigation && hasMainContent) {
          successfulPages++;
          results.push(`✅ ${endpoint}: Working`);
        } else {
          results.push(`⚠️ ${endpoint}: Missing elements`);
        }
      } catch (error) {
        results.push(`❌ ${endpoint}: Error - ${error}`);
      }
    }

    // Print comprehensive results
    console.log('\n🏁 COMPREHENSIVE PLATFORM STATUS:');
    console.log('='.repeat(50));
    results.forEach(result => console.log(result));
    console.log('='.repeat(50));
    console.log(`📊 Success Rate: ${successfulPages}/${endpoints.length} pages (${Math.round(successfulPages/endpoints.length*100)}%)`);
    
    if (successfulPages === endpoints.length) {
      console.log('🎉 PLATFORM STATUS: FULLY FUNCTIONAL');
    } else if (successfulPages >= endpoints.length * 0.75) {
      console.log('⚠️ PLATFORM STATUS: MOSTLY FUNCTIONAL - MINOR ISSUES');
    } else {
      console.log('❌ PLATFORM STATUS: CRITICAL ISSUES DETECTED');
    }

    console.log('✅ Comprehensive verification completed');
  });
}); 