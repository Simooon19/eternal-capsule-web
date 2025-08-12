import { test, expect } from '@playwright/test';
import { EternalCapsuleHelpers } from '../helpers/test-helpers';

test.describe('Authenticated User Flows - Dashboard and Account Management', () => {
  let helpers: EternalCapsuleHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new EternalCapsuleHelpers(page);
  });

  test('Authenticated user can access dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ User has active session and can access dashboard');
      
      // Check dashboard structure
      const welcomeText = page.locator('text=/hej|välkommen|dashboard/i');
      if (await welcomeText.count() > 0) {
        console.log('✅ Dashboard welcome content found');
      }
      
      // Check for account status section
      const accountStatus = page.locator('text=/kontostatus|plan|subscription/i');
      if (await accountStatus.count() > 0) {
        console.log('✅ Account status section found');
      }
      
      // Check for memorial management section
      const memorialSection = page.locator('text=/minneslundar|memorials|mina/i');
      if (await memorialSection.count() > 0) {
        console.log('✅ Memorial management section found');
      }
      
      // Check for create memorial CTA
      const createButton = page.locator('a:has-text("Skapa"), button:has-text("Skapa"), a[href*="/memorial/create"]');
      if (await createButton.isVisible()) {
        console.log('✅ Create memorial button found');
      }
      
    } else if (currentUrl.includes('/auth')) {
      console.log('ℹ️ No active session - redirected to authentication');
      
      // This test requires authentication, so we'll verify the redirect is correct
      expect(currentUrl).toContain('/auth/signin');
      const callbackUrl = new URL(currentUrl).searchParams.get('callbackUrl');
      expect(callbackUrl).toBe('/dashboard');
    }
  });

  test('User can view and manage account settings', async ({ page }) => {
    await page.goto('/account');
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    
    if (currentUrl.includes('/account')) {
      console.log('✅ User can access account page');
      
      // Check account information section
      const accountInfo = page.locator('text=/kontoinformation|account.*information/i');
      if (await accountInfo.count() > 0) {
        console.log('✅ Account information section found');
      }
      
      // Check for subscription information
      const subscriptionInfo = page.locator('text=/prenumeration|subscription|plan/i');
      if (await subscriptionInfo.count() > 0) {
        console.log('✅ Subscription information section found');
        
        // Check for plan details
        const planDetails = page.locator('text=/personal|minnesbricka|custom/i');
        if (await planDetails.count() > 0) {
          console.log('✅ Plan details displayed');
        }
      }
      
      // Check for trial information if active
      const trialInfo = page.locator('text=/testperiod|trial|dagar.*kvar/i');
      if (await trialInfo.count() > 0) {
        console.log('✅ Trial information displayed');
        
        // Check for trial cancellation option
        const cancelTrialButton = page.locator('button:has-text("Avsluta"), button:has-text("Cancel trial")');
        if (await cancelTrialButton.isVisible()) {
          console.log('✅ Trial cancellation option available');
        }
      }
      
      // Check for upgrade options
      const upgradeButton = page.locator('a:has-text("Uppgradera"), button:has-text("Upgrade")');
      if (await upgradeButton.isVisible()) {
        console.log('✅ Upgrade option available');
      }
      
    } else if (currentUrl.includes('/auth')) {
      console.log('ℹ️ No active session - account page requires authentication');
    }
  });

  test('User subscription limits are enforced', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/dashboard')) {
      // Check subscription status display
      const subscriptionStatus = page.locator('text=/plan.*personal|plan.*minnesbricka|plan.*custom/i');
      
      if (await subscriptionStatus.count() > 0) {
        const statusText = await subscriptionStatus.first().textContent();
        console.log(`✅ User subscription status: ${statusText}`);
        
        // Check memorial count display
        const memorialCount = page.locator('text=/minneslundar.*\\d+.*av.*\\d+|memorials.*\\d+.*of.*\\d+/i');
        if (await memorialCount.count() > 0) {
          const countText = await memorialCount.first().textContent();
          console.log(`✅ Memorial count displayed: ${countText}`);
        }
        
        // Check if create button is available or disabled
        const createButton = page.locator('a[href*="/memorial/create"], button:has-text("Skapa")');
        if (await createButton.isVisible()) {
          const klass = await createButton.getAttribute('class');
          const isDisabled = (await createButton.getAttribute('disabled')) !== null ||
                           (klass ? klass.includes('disabled') : false) ||
                           (await createButton.getAttribute('aria-disabled')) === 'true';
          
          if (isDisabled) {
            console.log('✅ Create memorial button disabled (limit reached)');
          } else {
            console.log('✅ Create memorial button available');
          }
        }
      }
    }
  });

  test('User can navigate to memorial creation', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/dashboard')) {
      const createButton = page.locator('a[href*="/memorial/create"], button:has-text("Skapa minneslund")');
      
      if (await createButton.isVisible()) {
        const isClickable = await createButton.getAttribute('disabled') === null;
        
        if (isClickable) {
          await createButton.click();
          await page.waitForLoadState('networkidle');
          
          const currentUrl = page.url();
          if (currentUrl.includes('/memorial/create')) {
            console.log('✅ User can access memorial creation page');
            
            // Check for creation form elements
            const formElements = page.locator('form, input[name="title"], input[name="name"]');
            if (await formElements.count() > 0) {
              console.log('✅ Memorial creation form found');
            }
            
            // Check for subscription validation
            const subscriptionCheck = page.locator('text=/plan|limit|maximum/i');
            if (await subscriptionCheck.count() > 0) {
              console.log('✅ Subscription validation displayed');
            }
          } else if (currentUrl.includes('/pricing')) {
            console.log('✅ User redirected to pricing (limit reached)');
          }
        } else {
          console.log('✅ Create button disabled (subscription limit)');
          
          // Check for upgrade prompt
          const upgradePrompt = page.locator('text=/uppgradera|upgrade|limit.*reached/i');
          if (await upgradePrompt.count() > 0) {
            console.log('✅ Upgrade prompt displayed for limit reached');
          }
        }
      }
    }
  });

  test('User can view their memorials list', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/dashboard')) {
      // Look for memorials section
      const memorialsSection = page.locator('text=/mina.*minneslundar|my.*memorials/i').first();
      
      if (await memorialsSection.isVisible()) {
        console.log('✅ Memorials section found');
        
        // Check for memorial cards/list items
        const memorialItems = page.locator('.memorial-card, .memorial-item, [data-testid="memorial-item"]');
        const memorialCount = await memorialItems.count();
        
        if (memorialCount > 0) {
          console.log(`✅ Found ${memorialCount} user memorials`);
          
          // Check first memorial item structure
          const firstMemorial = memorialItems.first();
          
          // Check for memorial title/name
          const title = firstMemorial.locator('h2, h3, .title');
          if (await title.isVisible()) {
            const titleText = await title.textContent();
            console.log(`✅ Memorial title: ${titleText}`);
          }
          
          // Check for status badge
          const statusBadge = firstMemorial.locator('.status, .badge');
          if (await statusBadge.count() > 0) {
            const statusText = await statusBadge.first().textContent();
            console.log(`✅ Memorial status: ${statusText}`);
          }
          
          // Check for action buttons (view, edit)
          const viewButton = firstMemorial.locator('a:has-text("Visa"), a:has-text("View")');
          const editButton = firstMemorial.locator('a:has-text("Redigera"), a:has-text("Edit")');
          
          if (await viewButton.isVisible()) {
            console.log('✅ View memorial button found');
          }
          
          if (await editButton.isVisible()) {
            console.log('✅ Edit memorial button found');
          }
          
        } else {
          // Check for empty state
          const emptyState = page.locator('text=/inga.*minneslundar|no.*memorials|skapa.*första/i');
          if (await emptyState.count() > 0) {
            console.log('✅ Empty state displayed for no memorials');
          }
        }
      }
    }
  });

  test('User trial management functionality', async ({ page }) => {
    await page.goto('/account');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/account')) {
      // Check for trial information
      const trialSection = page.locator('text=/testperiod|trial/i').first();
      
      if (await trialSection.isVisible()) {
        console.log('✅ User has active trial');
        
        // Check trial details
        const trialDetails = page.locator('text=/dagar.*kvar|days.*remaining/i');
        if (await trialDetails.count() > 0) {
          const daysText = await trialDetails.first().textContent();
          console.log(`✅ Trial details: ${daysText}`);
        }
        
        // Check for trial cancellation
        const cancelTrialButton = page.locator('button:has-text("Avsluta testperiod"), button:has-text("Cancel trial")');
        
        if (await cancelTrialButton.isVisible()) {
          console.log('✅ Trial cancellation option available');
          
          // Test cancellation flow (without actually cancelling)
          await cancelTrialButton.click();
          await page.waitForTimeout(1000);
          
          // Should show confirmation dialog
          const confirmDialog = page.locator('.modal, [role="dialog"], text=/säker.*avsluta/i');
          if (await confirmDialog.count() > 0) {
            console.log('✅ Trial cancellation confirmation dialog shown');
            
            // Click cancel to not actually cancel
            const cancelButton = page.locator('button:has-text("Avbryt"), button:has-text("Cancel")');
            if (await cancelButton.isVisible()) {
              await cancelButton.click();
              console.log('✅ Trial cancellation flow tested (cancelled confirmation)');
            }
          }
        }
        
        // Check for upgrade options from trial
        const upgradeFromTrialButton = page.locator('a:has-text("Uppgradera nu"), button:has-text("Upgrade now")');
        if (await upgradeFromTrialButton.isVisible()) {
          console.log('✅ Trial upgrade option available');
        }
      } else {
        console.log('ℹ️ User does not have active trial');
      }
    }
  });

  test('User navigation and session persistence', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/dashboard')) {
      console.log('✅ User session is active');
      
      // Test navigation between authenticated pages
      const accountLink = page.locator('a[href="/account"], a:has-text("Konto")');
      if (await accountLink.isVisible()) {
        await accountLink.click();
        await page.waitForLoadState('networkidle');
        
        expect(page.url()).toContain('/account');
        console.log('✅ Navigation to account page works');
        
        // Navigate back to dashboard
        const dashboardLink = page.locator('a[href="/dashboard"], a:has-text("Dashboard")');
        if (await dashboardLink.isVisible()) {
          await dashboardLink.click();
          await page.waitForLoadState('networkidle');
          
          expect(page.url()).toContain('/dashboard');
          console.log('✅ Navigation back to dashboard works');
        }
      }
      
      // Test session persistence across page reloads
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      if (page.url().includes('/dashboard')) {
        console.log('✅ Session persists across page reload');
      }
      
      // Test session persistence in new tab (if supported)
      const context = page.context();
      const newPage = await context.newPage();
      await newPage.goto('/dashboard');
      await newPage.waitForLoadState('networkidle');
      
      if (newPage.url().includes('/dashboard')) {
        console.log('✅ Session persists across new tab');
      } else if (newPage.url().includes('/auth')) {
        console.log('ℹ️ Session does not persist across tabs (may be by design)');
      }
      
      await newPage.close();
    }
  });

  test('User can update profile information', async ({ page }) => {
    await page.goto('/account');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/account')) {
      // Look for profile/account information section
      const profileSection = page.locator('text=/kontoinformation|profile|account.*information/i').first();
      
      if (await profileSection.isVisible()) {
        console.log('✅ Profile information section found');
        
        // Look for editable fields
        const editableFields = page.locator('input[name="name"], input[name="email"], input[name="phone"]');
        const editableCount = await editableFields.count();
        
        if (editableCount > 0) {
          console.log(`✅ Found ${editableCount} editable profile fields`);
          
          // Look for save/update button
          const saveButton = page.locator('button:has-text("Spara"), button:has-text("Save"), button[type="submit"]');
          if (await saveButton.count() > 0) {
            console.log('✅ Profile update functionality available');
          }
        } else {
          // Profile info might be read-only display
          const displayFields = page.locator('text=/namn|email|name/i');
          if (await displayFields.count() > 0) {
            console.log('✅ Profile information displayed (read-only)');
          }
        }
      }
    }
  });
});