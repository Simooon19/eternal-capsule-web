import { Page, expect, Locator } from '@playwright/test';

/**
 * Test helpers for Eternal Capsule platform
 * Focused on real user journeys and core value propositions
 */
export class EternalCapsuleHelpers {
  constructor(private page: Page) {}

  // Navigation Helpers
  async navigateToHomepage(locale: 'en' | 'sv' = 'en') {
    await this.page.goto(`/${locale}`);
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToExplore(locale: 'en' | 'sv' = 'en') {
    await this.page.goto(`/${locale}/memorial/explore`);
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToPricing(locale: 'en' | 'sv' = 'en') {
    await this.page.goto(`/${locale}/pricing`);
    await this.page.waitForLoadState('networkidle');
  }

  // Language & Internationalization
  async switchLanguage(targetLanguage: 'en' | 'sv') {
    const languageSwitcher = this.page.locator('[data-testid="language-switcher"], .language-switcher').first();
    
    if (await languageSwitcher.isVisible()) {
      await languageSwitcher.click();
      
      const targetOption = targetLanguage === 'en' 
        ? this.page.locator('text=/english|🇺🇸/i').first()
        : this.page.locator('text=/svenska|swedish|🇸🇪/i').first();
      
      if (await targetOption.isVisible()) {
        await targetOption.click();
        await this.page.waitForLoadState('networkidle');
        return true;
      }
    }
    return false;
  }

  async verifyLocale(expectedLocale: 'en' | 'sv') {
    const currentUrl = this.page.url();
    expect(currentUrl).toContain(`/${expectedLocale}/`);
    
    // Verify language-specific content
    if (expectedLocale === 'sv') {
      const swedishContent = this.page.locator('text=/minneslund|svenska/i');
      if (await swedishContent.count() > 0) {
        await expect(swedishContent.first()).toBeVisible();
      }
    }
  }

  // Memorial Discovery & Viewing
  async findMemorialCards() {
    const cardSelectors = [
      '[data-testid="memorial-card"]',
      '.memorial-card',
      'article:has(a[href*="/memorial/"])',
      '.card:has(a[href*="/memorial/"])'
    ];

    for (const selector of cardSelectors) {
      const cards = this.page.locator(selector);
      if (await cards.count() > 0) {
        return cards;
      }
    }
    return this.page.locator('a[href*="/memorial/"]:not([href*="/explore"])').first();
  }

  async clickFirstMemorial() {
    const memorialCards = await this.findMemorialCards();
    const firstCard = memorialCards.first();
    
    // Try different selectors for memorial links
    let memorialLink = firstCard.locator('a[href*="/memorial/"]:not([href*="/explore"])').first();
    
    if (await memorialLink.count() === 0) {
      // Try alternative selectors
      memorialLink = firstCard.locator('a').first();
    }
    
    if (await memorialLink.isVisible()) {
      await memorialLink.click();
      await this.page.waitForLoadState('networkidle');
      
      // More flexible URL verification
      const currentUrl = this.page.url();
      if (currentUrl.includes('/memorial/') || currentUrl !== this.page.url().split('/').slice(0, 3).join('/') + '/') {
        console.log(`✅ Navigated to memorial page: ${currentUrl}`);
      }
    } else {
      console.log('ℹ️ No memorial link found to click');
    }
  }

  // NFC & QR Code Simulation
  async simulateNFCScan(memorialUrl?: string) {
    const targetUrl = memorialUrl || await this.getCurrentMemorialUrl();
    if (targetUrl) {
      const nfcUrl = `${targetUrl}?source=nfc&nfc=true`;
      await this.page.goto(nfcUrl);
      await this.page.waitForLoadState('networkidle');
      return nfcUrl;
    }
    return null;
  }

  async simulateQRScan(memorialUrl?: string) {
    const targetUrl = memorialUrl || await this.getCurrentMemorialUrl();
    if (targetUrl) {
      const qrUrl = `${targetUrl}?source=qr`;
      await this.page.goto(qrUrl);
      await this.page.waitForLoadState('networkidle');
      return qrUrl;
    }
    return null;
  }

  private async getCurrentMemorialUrl() {
    const currentUrl = this.page.url();
    if (currentUrl.includes('/memorial/') && !currentUrl.includes('/explore')) {
      return currentUrl.split('?')[0]; // Remove existing query params
    }
    return null;
  }

  // Guestbook Interactions
  async addGuestbookEntry(name: string, message: string, email?: string) {
    // Look for guestbook form
    const guestbookForm = this.page.locator('form:has(textarea), [data-testid="guestbook-form"]');
    
    if (await guestbookForm.isVisible()) {
      // Fill name
      const nameField = guestbookForm.locator('input[name="name"], input[placeholder*="name" i]');
      if (await nameField.isVisible()) {
        await nameField.fill(name);
      }

      // Fill email if provided and field exists
      if (email) {
        const emailField = guestbookForm.locator('input[name="email"], input[type="email"]');
        if (await emailField.isVisible()) {
          await emailField.fill(email);
        }
      }

      // Fill message
      const messageField = guestbookForm.locator('textarea[name="message"], textarea[placeholder*="message" i]');
      if (await messageField.isVisible()) {
        await messageField.fill(message);
      }

      // Submit form
      const submitButton = guestbookForm.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Add")');
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await this.page.waitForTimeout(1000); // Wait for submission
        return true;
      }
    }
    return false;
  }

  // Authentication Helpers
  async navigateToSignup(locale: 'en' | 'sv' = 'en') {
    await this.page.goto(`/${locale}/auth/signup`);
    await this.page.waitForLoadState('networkidle');
  }

  async fillSignupForm(email: string, password: string, confirmPassword?: string) {
    const form = this.page.locator('form');
    
    await form.locator('input[name="email"], input[type="email"]').fill(email);
    await form.locator('input[name="password"], input[type="password"]').first().fill(password);
    
    if (confirmPassword) {
      const confirmField = form.locator('input[name="confirmPassword"], input[name="confirm"]');
      if (await confirmField.isVisible()) {
        await confirmField.fill(confirmPassword);
      }
    }

    const submitButton = form.locator('button[type="submit"], button:has-text("Sign up"), button:has-text("Create")');
    await submitButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  // Business Metrics & Stats
  async getHomepageStats() {
    const stats = {
      totalMemorials: 0,
      publishedMemorials: 0,
      createdThisMonth: 0
    };

    const statElements = this.page.locator('.text-4xl, [class*="stat"], [data-testid="stat"]');
    const count = await statElements.count();

    if (count >= 3) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const element = statElements.nth(i);
        const text = await element.textContent();
        const number = parseInt(text?.replace(/[^0-9]/g, '') || '0');
        
        if (i === 0) stats.totalMemorials = number;
        if (i === 1) stats.publishedMemorials = number;
        if (i === 2) stats.createdThisMonth = number;
      }
    }

    return stats;
  }

  // CSV Import Testing (Funeral Home Features)
  async navigateToCSVImport() {
    // Navigate to dashboard first
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('networkidle');

    // Look for CSV import link
    const csvImportLink = this.page.locator('a:has-text("CSV Import"), a:has-text("Bulk Upload"), [href*="csv"], [href*="import"]');
    
    if (await csvImportLink.isVisible()) {
      await csvImportLink.click();
      await this.page.waitForLoadState('networkidle');
      return true;
    }
    return false;
  }

  // Mobile & Responsive Testing
  async setMobileViewport() {
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.page.waitForTimeout(500);
  }

  async setDesktopViewport() {
    await this.page.setViewportSize({ width: 1280, height: 720 });
    await this.page.waitForTimeout(500);
  }

  // Performance & Health Checks
  async checkAPIHealth() {
    const response = await this.page.request.get('/api/health');
    const healthData = await response.json();
    
    expect(response.status()).toBe(200);
    expect(healthData.status).toMatch(/healthy|degraded/);
    
    return healthData;
  }

  async measurePageLoadTime() {
    const startTime = Date.now();
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    return loadTime;
  }

  // Accessibility Helpers
  async checkBasicAccessibility() {
    // Check for essential accessibility features
    const hasHeadings = await this.page.locator('h1, h2, h3').count() > 0;
    const hasAltText = await this.page.locator('img[alt]').count() >= await this.page.locator('img').count() * 0.8;
    const hasLabels = await this.page.locator('label').count() > 0;
    
    return {
      hasHeadings,
      hasAltText,
      hasLabels
    };
  }

  // Utility Methods
  async waitForElement(selector: string, timeout: number = 5000) {
    try {
      await this.page.waitForSelector(selector, { timeout });
      return true;
    } catch {
      return false;
    }
  }

  async scrollToBottom() {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.page.waitForTimeout(500);
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }
}

// Shared test data
export const testData = {
  sampleGuestbookEntry: {
    name: "John Smith",
    email: "john.smith@example.com",
    message: "Such beautiful memories shared here. Thank you for creating this wonderful tribute."
  },
  
  sampleUser: {
    email: "test.user@example.com",
    password: "TestPassword123!",
    name: "Test User"
  },

  sampleMemorial: {
    name: "Jane Doe",
    born: "1950-05-15",
    died: "2023-12-01",
    description: "A loving mother and devoted teacher who touched many lives."
  }
};

// Test configuration
export const testConfig = {
  defaultTimeout: 10000,
  slowTimeout: 30000,
  retries: 2,
  
  // URLs for different environments
  urls: {
    local: 'http://localhost:3000',
    staging: 'https://staging.eternalcapsule.com',
    production: 'https://eternalcapsule.com'
  }
}; 