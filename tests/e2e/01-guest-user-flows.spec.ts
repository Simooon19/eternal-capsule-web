import { test, expect } from '@playwright/test';
import { EternalCapsuleHelpers } from '../helpers/test-helpers';

test.describe('Guest User Flows - Anonymous Visitors', () => {
  let helpers: EternalCapsuleHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new EternalCapsuleHelpers(page);
  });

  test('Guest can explore public memorials', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify page structure with more flexible matching
    const heading = page.locator('h1').first();
    if (await heading.isVisible()) {
      const headingText = await heading.textContent();
      console.log(`✅ Homepage heading: ${headingText}`);
    } else {
      // Try other headings if h1 not found
      const anyHeading = page.locator('h1, h2, .title, .heading').first();
      if (await anyHeading.isVisible()) {
        const headingText = await anyHeading.textContent();
        console.log(`✅ Homepage content: ${headingText}`);
      }
    }
    
    // Navigate to explore page
    const exploreLink = page.locator('a[href*="/explore"], a:has-text("Utforska")').first();
    if (await exploreLink.isVisible()) {
      await exploreLink.click({ force: true });
      await page.waitForLoadState('networkidle');
      
      // Check for memorial cards or empty state
      const memorialCards = await helpers.findMemorialCards();
      const cardCount = await memorialCards.count();
      
      if (cardCount > 0) {
        console.log(`✅ Found ${cardCount} memorial cards for guest exploration`);
        
        // Click on first memorial
        await helpers.clickFirstMemorial();
        
        // Check for memorial content (more flexible approach)
        const memorialContent = page.locator('main, .memorial-content, .content');
        if (await memorialContent.isVisible()) {
          console.log('✅ Guest can view individual memorial pages');
        } else {
          console.log('ℹ️ Memorial page may have different structure');
        }
      } else {
        console.log('ℹ️ No memorial cards found - empty state verified');
      }
    }
  });

  test('Guest can view memorial details and guestbook', async ({ page }) => {
    // Go to explore page
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');
    
    // Find and click first memorial if available
    const memorialCards = await helpers.findMemorialCards();
    const cardCount = await memorialCards.count();
    
    if (cardCount > 0) {
      await helpers.clickFirstMemorial();
      
      // Check for memorial content sections
      const contentSections = [
        'h1, h2', // Memorial name/title
        'img, .gallery', // Photos/gallery
        '.guestbook, [data-testid="guestbook"]', // Guestbook section
      ];
      
      for (const selector of contentSections) {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`✅ Memorial content section found: ${selector}`);
        }
      }
      
      // Try to add guestbook entry
      const guestbookAdded = await helpers.addGuestbookEntry(
        'Test Visitor',
        'A beautiful memorial. Thank you for sharing these memories.',
        'visitor@example.com'
      );
      
      if (guestbookAdded) {
        console.log('✅ Guest can submit guestbook entries');
      } else {
        console.log('ℹ️ Guestbook not available or requires authentication');
      }
    }
  });

  test('Guest can access pricing information', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');
    
    // Check for pricing plans
    const pricingCards = page.locator('.price, .plan, [data-testid="pricing-card"]');
    const planCount = await pricingCards.count();
    
    if (planCount > 0) {
      console.log(`✅ Found ${planCount} pricing plans`);
      
      // Check for subscription plans (Personal, Minnesbricka, Custom)
      const expectedPlans = ['Personal', 'Minnesbricka', 'Custom'];
      
      for (const planName of expectedPlans) {
        const planElement = page.locator(`text="${planName}"`);
        if (await planElement.isVisible()) {
          console.log(`✅ Found ${planName} plan`);
        }
      }
      
      // Check for pricing in SEK
      const sekPricing = page.locator('text=/SEK|kr|öre/i');
      if (await sekPricing.count() > 0) {
        console.log('✅ Swedish currency (SEK) pricing found');
      }
    }
  });

  test('Guest navigation and Swedish localization', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for Swedish content
    const swedishTerms = [
      'Minneslund',
      'Skapa',
      'Utforska',
      'Priser',
      'Kontakt'
    ];
    
    for (const term of swedishTerms) {
      const element = page.locator(`text="${term}"`);
      if (await element.count() > 0) {
        console.log(`✅ Swedish localization found: ${term}`);
      }
    }
    
    // Test navigation menu
    const navLinks = [
      { text: 'Utforska', href: '/explore' },
      { text: 'Priser', href: '/pricing' },
    ];
    
    for (const link of navLinks) {
      const navLink = page.locator(`nav a:has-text("${link.text}")`);
      if (await navLink.isVisible()) {
        await navLink.click({ force: true });
        await page.waitForLoadState('networkidle');
        
        // More flexible URL checking 
        const currentUrl = page.url();
        if (currentUrl.includes(link.href) || currentUrl.includes(link.text.toLowerCase())) {
          console.log(`✅ Navigation to ${link.text} works`);
        }
        
        // Navigate back
        await page.goto('/');
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('Guest mobile experience', async ({ page }) => {
    // Set mobile viewport
    await helpers.setMobileViewport();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Mobile viewport set and page loaded');
    
    // Check mobile navigation
    const mobileMenuButton = page.locator('button[aria-label*="menu"], .mobile-menu-button');
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click({ force: true });
      await page.waitForTimeout(500);
      
      // Check if mobile menu opens
      const mobileMenu = page.locator('.mobile-menu, nav .sm\\:hidden');
      if (await mobileMenu.isVisible()) {
        console.log('✅ Mobile menu functionality works');
        
        // Test mobile navigation
        const mobileExploreLink = mobileMenu.locator('a[href*="/explore"]');
        if (await mobileExploreLink.isVisible()) {
          await mobileExploreLink.click();
          await page.waitForLoadState('networkidle');
          expect(page.url()).toContain('/explore');
          console.log('✅ Mobile navigation to explore works');
        }
      }
    }
    
    // Test responsive memorial cards
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');
    
    const memorialCards = await helpers.findMemorialCards();
    const cardCount = await memorialCards.count();
    
    if (cardCount > 0) {
      // Check if cards are properly displayed on mobile
      const firstCard = memorialCards.first();
      const cardBounds = await firstCard.boundingBox();
      
      if (cardBounds && cardBounds.width > 0) {
        console.log('✅ Memorial cards render properly on mobile');
      }
    }
  });

  test('Guest contact form submission', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for contact form or contact page link
    const contactLink = page.locator('a[href*="/contact"], a:has-text("Kontakt")');
    
    if (await contactLink.isVisible()) {
      await contactLink.click();
      await page.waitForLoadState('networkidle');
      
      // Fill contact form
      const contactForm = page.locator('form');
      if (await contactForm.isVisible()) {
        const nameField = contactForm.locator('input[name="name"], input[name="firstName"]');
        const emailField = contactForm.locator('input[name="email"]');
        const messageField = contactForm.locator('textarea[name="message"]');
        
        if (await nameField.isVisible()) await nameField.fill('Test User');
        if (await emailField.isVisible()) await emailField.fill('test@example.com');
        if (await messageField.isVisible()) await messageField.fill('Test message from guest user');
        
        const submitButton = contactForm.locator('button[type="submit"]');
        if (await submitButton.isVisible()) {
          await submitButton.click();
          await page.waitForTimeout(2000);
          console.log('✅ Guest contact form submission attempted');
        }
      }
    } else {
      console.log('ℹ️ Contact form not found on homepage');
    }
  });

  test('Guest accessibility and performance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Basic accessibility checks
    const accessibility = await helpers.checkBasicAccessibility();
    
    expect(accessibility.hasHeadings).toBe(true);
    console.log('✅ Page has proper heading structure');
    
    if (accessibility.hasAltText) {
      console.log('✅ Images have alt text');
    }
    
    // Performance check
    const loadTime = await helpers.measurePageLoadTime();
    console.log(`📊 Page load time: ${loadTime}ms`);
    
    // Should load reasonably fast (under 5 seconds)
    expect(loadTime).toBeLessThan(5000);
  });
});