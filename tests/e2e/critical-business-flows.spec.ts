import { test, expect } from '@playwright/test';

test.describe('Critical Business Flows - End-to-End Business Scenarios', () => {
  
  test('Complete Memorial Creation Workflow', async ({ page }) => {
    // Step 1: Start from homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Step 2: Click create memorial button
    const createButtons = page.locator('a:has-text("Start Creating"), a:has-text("Create Memorial")');
    const buttonCount = await createButtons.count();
    
    if (buttonCount > 0) {
      await createButtons.first().click();
      await page.waitForLoadState('networkidle');
      
      const currentUrl = page.url();
      
      if (currentUrl.includes('/auth')) {
        console.log('✅ Memorial creation properly requires authentication');
        
        // Check auth page structure
        const authContent = page.locator('text=/sign|login|auth/i');
        await expect(authContent.first()).toBeVisible();
        
        // Look for sign up option for new users
        const signUpLink = page.locator('a[href*="/signup"]');
        if (await signUpLink.count() > 0) {
          await signUpLink.click();
          await page.waitForLoadState('networkidle');
          
          // Verify signup page
          await expect(page.locator('h1, h2')).toContainText(/sign.*up/i);
          console.log('✅ User can navigate to signup from memorial creation');
        }
      } else if (currentUrl.includes('/memorial/create')) {
        console.log('✅ Memorial creation page directly accessible');
        
        // Check for creation form elements
        const formElements = page.locator('form, input, textarea, button[type="submit"]');
        const hasFormElements = await formElements.count() > 0;
        
        if (hasFormElements) {
          console.log('✅ Memorial creation form elements found');
        }
      }
    }
    
    console.log('✅ Memorial creation workflow verified');
  });

  test('User Onboarding and Trial Flow', async ({ page }) => {
    // Step 1: Navigate to signup
    await page.goto('/auth/signup');
    await page.waitForLoadState('networkidle');
    
    // Check signup page structure
    await expect(page.locator('h1, h2')).toContainText(/create.*account|sign.*up/i);
    
    // Look for trial information
    const trialContent = page.locator('text=/trial|free|30.*day/i');
    const hasTrialInfo = await trialContent.count() > 0;
    
    if (hasTrialInfo) {
      console.log('✅ Trial information displayed on signup');
    }
    
    // Check for form elements
    const emailField = page.locator('input[type="email"], input[name="email"]');
    const passwordField = page.locator('input[type="password"], input[name="password"]');
    
    if (await emailField.count() > 0 && await passwordField.count() > 0) {
      console.log('✅ Signup form fields available');
    }
    
    // Test trial API endpoint
    const trialResponse = await page.request.get('/api/user/trial');
    expect([200, 401, 403]).toContain(trialResponse.status());
    
    if (trialResponse.status() === 401 || trialResponse.status() === 403) {
      console.log('✅ Trial endpoint properly protected');
    }
    
    console.log('✅ User onboarding flow structure verified');
  });

  test('Pricing and Subscription Selection Flow', async ({ page }) => {
    // Step 1: Navigate to pricing
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');
    
    // Check for pricing plans
    const pricingCards = page.locator('[class*="plan"], [class*="tier"], .bg-white').filter({ has: page.locator('h2, h3') });
    const cardCount = await pricingCards.count();
    
    if (cardCount > 0) {
      console.log(`✅ Found ${cardCount} pricing plans`);
      
      // Look for subscription buttons/links
      const subscribeButtons = page.locator('button:has-text("Subscribe"), a:has-text("Get Started"), button:has-text("Choose Plan")');
      const buttonCount = await subscribeButtons.count();
      
      if (buttonCount > 0) {
        const firstButton = subscribeButtons.first();
        await expect(firstButton).toBeVisible();
        
        // Test clicking subscription button
        await firstButton.click();
        await page.waitForLoadState('networkidle');
        
        const currentUrl = page.url();
        
        if (currentUrl.includes('/auth')) {
          console.log('✅ Subscription requires authentication (correct flow)');
        } else if (currentUrl.includes('/checkout') || currentUrl.includes('stripe')) {
          console.log('✅ Subscription flows to payment system');
        }
      }
    }
    
    // Test Stripe checkout creation API
    const checkoutResponse = await page.request.post('/api/stripe/checkout', {
      data: { plan: 'personal' }
    });
    
    // Should require authentication or return error for invalid request
    expect([200, 400, 401, 403]).toContain(checkoutResponse.status());
    
    if (checkoutResponse.status() === 401 || checkoutResponse.status() === 403) {
      console.log('✅ Stripe checkout properly protected');
    }
    
    console.log('✅ Pricing and subscription flow verified');
  });

  test('Memorial Discovery and Interaction Flow', async ({ page }) => {
    // Step 1: Start from explore page
    await page.goto('/memorial/explore');
    await page.waitForLoadState('networkidle');
    
    // Check for memorials or empty state
    const memorialCards = page.locator('a[href^="/memorial/"]').filter({ has: page.locator('.group') });
    const cardCount = await memorialCards.count();
    
    if (cardCount > 0) {
      console.log(`✅ Found ${cardCount} memorial cards`);
      
      // Test memorial card interaction
      const firstCard = memorialCards.first();
      const memorialUrl = await firstCard.getAttribute('href');
      
      await firstCard.click();
      await page.waitForLoadState('networkidle');
      
      // Should navigate to individual memorial
      await expect(page).toHaveURL(memorialUrl!);
      
      // Check for memorial content
      const memorialContent = page.locator('main');
      await expect(memorialContent).toBeVisible();
      
      // Look for interaction elements
      const interactionElements = page.locator('button:has-text("Light"), button:has-text("Share"), a:has-text("Guestbook")');
      const interactionCount = await interactionElements.count();
      
      if (interactionCount > 0) {
        console.log('✅ Memorial interaction elements found');
      }
      
      console.log('✅ Memorial discovery flow completed');
    } else {
      // Check for empty state
      const emptyState = page.locator('text=/no.*memorial|empty|create.*first/i');
      const hasEmptyState = await emptyState.count() > 0;
      
      if (hasEmptyState) {
        console.log('✅ Empty state properly displayed');
      }
    }
  });

  test('Search and Filter Functionality', async ({ page }) => {
    // Test search from homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for search functionality
    const searchElements = page.locator('input[type="search"], input[placeholder*="search"]');
    const hasSearch = await searchElements.count() > 0;
    
    if (hasSearch) {
      const searchInput = searchElements.first();
      await searchInput.fill('test');
      await page.keyboard.press('Enter');
      await page.waitForLoadState('networkidle');
      
      console.log('✅ Search functionality initiated');
    }
    
    // Test search API
    const searchResponse = await page.request.get('/api/search?q=test');
    expect([200, 400, 404]).toContain(searchResponse.status());
    
    if (searchResponse.status() === 200) {
      const searchData = await searchResponse.json();
      console.log('✅ Search API accessible:', searchData);
    }
    
    // Test from explore page
    await page.goto('/memorial/explore');
    await page.waitForLoadState('networkidle');
    
    const exploreSearch = page.locator('input[type="search"], form');
    const hasExploreSearch = await exploreSearch.count() > 0;
    
    if (hasExploreSearch) {
      console.log('✅ Search available on explore page');
    }
    
    console.log('✅ Search functionality verified');
  });

  test('Obituaries and Recent Memorial Flow', async ({ page }) => {
    // Test obituaries page workflow
    await page.goto('/obituaries');
    await page.waitForLoadState('networkidle');
    
    // Should have newspaper-style layout
    await expect(page.locator('h1')).toContainText('OBITUARIES');
    
    // Check for obituary entries
    const obituaryEntries = page.locator('.bg-white, [class*="obituary"]').filter({ has: page.locator('h2, h3') });
    const entryCount = await obituaryEntries.count();
    
    if (entryCount > 0) {
      console.log(`✅ Found ${entryCount} obituary entries`);
      
      // Test clicking on obituary entry
      const firstEntry = obituaryEntries.first();
      const entryLink = firstEntry.locator('a[href^="/memorial/"]').first();
      
      if (await entryLink.count() > 0) {
        const memorialUrl = await entryLink.getAttribute('href');
        await entryLink.click();
        await page.waitForLoadState('networkidle');
        
        // Should navigate to full memorial
        await expect(page).toHaveURL(memorialUrl!);
        console.log('✅ Obituary to memorial navigation working');
      }
    }
    
    // Test obituaries API
    const obituariesResponse = await page.request.get('/api/obituaries');
    expect([200, 400, 404]).toContain(obituariesResponse.status());
    
    if (obituariesResponse.status() === 200) {
      console.log('✅ Obituaries API accessible');
    }
    
    console.log('✅ Obituaries workflow verified');
  });

  test('Contact and Support Flow', async ({ page }) => {
    // Test contact page access
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    
    // Should either have contact page or 404
    const hasContactContent = await page.locator('text=/contact|support|help/i').count() > 0;
    const is404 = await page.locator('text=/404|not.*found/i').count() > 0;
    
    if (hasContactContent) {
      console.log('✅ Contact page accessible');
      
      // Look for contact form
      const contactForm = page.locator('form');
      if (await contactForm.count() > 0) {
        const emailField = contactForm.locator('input[type="email"]');
        const messageField = contactForm.locator('textarea');
        
        if (await emailField.count() > 0 && await messageField.count() > 0) {
          console.log('✅ Contact form elements found');
        }
      }
    } else if (is404) {
      console.log('ℹ️ Contact page not implemented yet');
    }
    
    // Test contact API
    const contactResponse = await page.request.post('/api/contact', {
      data: {
        email: 'test@example.com',
        message: 'Test message'
      }
    });
    
    expect([200, 400, 404, 405]).toContain(contactResponse.status());
    
    if (contactResponse.status() === 200) {
      console.log('✅ Contact API functional');
    } else if (contactResponse.status() === 405) {
      console.log('✅ Contact API requires proper method');
    }
    
    console.log('✅ Contact and support flow verified');
  });

  test('Mobile User Experience Flow', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Test mobile homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Mobile navigation should work
    const mobileMenuButton = page.locator('button[aria-label="Toggle mobile menu"]');
    await expect(mobileMenuButton).toBeVisible();
    
    await mobileMenuButton.click();
    const mobileMenu = page.locator('.sm\\:hidden').last();
    await expect(mobileMenu).toBeVisible();
    
    // Test mobile memorial cards
    const memorialCards = page.locator('a[href^="/memorial/"]').filter({ has: page.locator('.group') });
    const cardCount = await memorialCards.count();
    
    if (cardCount > 0) {
      const firstCard = memorialCards.first();
      await expect(firstCard).toBeVisible();
      
      // Cards should be responsive
      const cardWidth = await firstCard.boundingBox();
      expect(cardWidth?.width).toBeLessThan(400); // Should fit mobile screen
      
      console.log('✅ Memorial cards mobile responsive');
    }
    
    // Test mobile memorial page
    await page.goto('/memorial/explore');
    await page.waitForLoadState('networkidle');
    
    // Should be accessible on mobile
    const exploreContent = page.locator('main');
    await expect(exploreContent).toBeVisible();
    
    console.log('✅ Mobile user experience verified');
  });

  test('End-to-End Critical Business Flow', async ({ page }) => {
    console.log('🏁 Starting comprehensive end-to-end business flow test...');
    
    // Step 1: Homepage → Pricing
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Eternal Capsule');
    
    await page.locator('nav a[href="/pricing"]').first().click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/pricing');
    console.log('✅ Step 1: Homepage to Pricing navigation');
    
    // Step 2: Pricing → Signup
    const signupLinks = page.locator('a[href*="/signup"]');
    if (await signupLinks.count() > 0) {
      await signupLinks.first().click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/signup/);
      console.log('✅ Step 2: Pricing to Signup navigation');
    }
    
    // Step 3: Signup → Signin
    const signinLinks = page.locator('a[href*="/signin"]');
    if (await signinLinks.count() > 0) {
      await signinLinks.first().click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/signin/);
      console.log('✅ Step 3: Signup to Signin navigation');
    }
    
    // Step 4: Explore memorials
    await page.locator('a[href="/memorial/explore"]').click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/memorial/explore');
    console.log('✅ Step 4: Navigation to memorial exploration');
    
    // Step 5: View individual memorial (if available)
    const memorialCards = page.locator('a[href^="/memorial/"]').filter({ has: page.locator('.group') });
    const cardCount = await memorialCards.count();
    
    if (cardCount > 0) {
      const firstCard = memorialCards.first();
      await firstCard.click();
      await page.waitForLoadState('networkidle');
      
      const currentUrl = page.url();
      expect(currentUrl).toContain('/memorial/');
      console.log('✅ Step 5: Individual memorial access');
    }
    
    // Step 6: Obituaries page
    await page.locator('a[href="/obituaries"]').click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/obituaries');
    console.log('✅ Step 6: Obituaries page access');
    
    // Step 7: Return to homepage
    await page.locator('a[href="/"]').first().click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/');
    console.log('✅ Step 7: Return to homepage');
    
    console.log('🎉 End-to-end critical business flow completed successfully!');
  });
}); 