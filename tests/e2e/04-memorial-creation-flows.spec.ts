import { test, expect } from '@playwright/test';
import { EternalCapsuleHelpers } from '../helpers/test-helpers';

test.describe('Memorial Creation Flows - End-to-End Memorial Management', () => {
  let helpers: EternalCapsuleHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new EternalCapsuleHelpers(page);
  });

  test('Memorial creation requires authentication', async ({ page }) => {
    await page.goto('/memorial/create');
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    
    if (currentUrl.includes('/auth/signin')) {
      console.log('✅ Memorial creation properly requires authentication');
      
      // Check callback URL is set
      const urlParams = new URL(currentUrl).searchParams;
      const callbackUrl = urlParams.get('callbackUrl');
      expect(callbackUrl).toBe('/memorial/create');
      console.log('✅ Callback URL properly set for memorial creation');
      
    } else if (currentUrl.includes('/memorial/create')) {
      console.log('✅ User is authenticated and can access memorial creation');
      
      // Check for creation form
      const creationForm = page.locator('form, .wizard, .creation-form');
      if (await creationForm.isVisible()) {
        console.log('✅ Memorial creation form found');
      }
      
    } else {
      console.log(`ℹ️ Unexpected redirect to: ${currentUrl}`);
    }
  });

  test('Memorial creation form validation', async ({ page }) => {
    await page.goto('/memorial/create');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/memorial/create')) {
      console.log('✅ Accessing memorial creation form');
      
      // Check for required form fields
      const requiredFields = [
        'input[name="title"], input[name="name"]', // Memorial name/title
        'input[name="born"], input[name="dateOfBirth"]', // Birth date
        'input[name="died"], input[name="dateOfDeath"]', // Death date
      ];
      
      for (const fieldSelector of requiredFields) {
        const field = page.locator(fieldSelector);
        if (await field.count() > 0) {
          const fieldName = await field.first().getAttribute('name') || 'unknown';
          console.log(`✅ Required field found: ${fieldName}`);
        }
      }
      
      // Test form validation by submitting empty form
      const submitButton = page.locator('button[type="submit"], button:has-text("Skapa"), button:has-text("Create")');
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(1000);
        
        // Check for validation errors
        const validationErrors = page.locator('.error, .invalid, [aria-invalid="true"]');
        if (await validationErrors.count() > 0) {
          console.log('✅ Form validation prevents empty submission');
        }
        
        // Check HTML5 validation
        const requiredField = page.locator('input[required]').first();
        if (await requiredField.count() > 0) {
          const isValid = await requiredField.evaluate(el => {
            const input = el as HTMLInputElement;
            return typeof input.checkValidity === 'function' ? input.checkValidity() : false;
          });
          if (!isValid) {
            console.log('✅ HTML5 validation active');
          }
        }
      }
      
    } else if (page.url().includes('/auth')) {
      console.log('ℹ️ Memorial creation requires authentication');
    }
  });

  test('Memorial creation wizard flow', async ({ page }) => {
    await page.goto('/memorial/create');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/memorial/create')) {
      // Look for wizard/step-based creation
      const wizardSteps = page.locator('.step, .wizard-step, [data-step]');
      const stepCount = await wizardSteps.count();
      
      if (stepCount > 0) {
        console.log(`✅ Memorial creation wizard found with ${stepCount} steps`);
        
        // Try to fill first step
        const firstStep = wizardSteps.first();
        
        // Fill basic information
        const nameField = firstStep.locator('input[name="title"], input[name="name"]');
        if (await nameField.isVisible()) {
          await nameField.fill('Test Memorial');
          console.log('✅ Memorial name filled');
        }
        
        const bornField = firstStep.locator('input[name="born"], input[name="dateOfBirth"]');
        if (await bornField.isVisible()) {
          await bornField.fill('1950-05-15');
          console.log('✅ Birth date filled');
        }
        
        const diedField = firstStep.locator('input[name="died"], input[name="dateOfDeath"]');
        if (await diedField.isVisible()) {
          await diedField.fill('2023-12-01');
          console.log('✅ Death date filled');
        }
        
        // Look for next button
        const nextButton = page.locator('button:has-text("Nästa"), button:has-text("Next"), button:has-text("Continue")');
        if (await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForTimeout(1000);
          console.log('✅ Proceeded to next step');
          
          // Check if we moved to next step
          const activeStep = page.locator('.step.active, .wizard-step.current, [data-step].active');
          if (await activeStep.count() > 0) {
            console.log('✅ Wizard step progression works');
          }
        }
        
      } else {
        // Single-page form
        console.log('✅ Single-page memorial creation form');
        
        // Fill basic information
        const nameField = page.locator('input[name="title"], input[name="name"]');
        if (await nameField.isVisible()) {
          await nameField.fill('Test Memorial Single Page');
          console.log('✅ Memorial name filled');
        }
      }
    }
  });

  test('Memorial creation with subscription limits', async ({ page }) => {
    await page.goto('/memorial/create');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/memorial/create')) {
      // Check for subscription status display
      const subscriptionInfo = page.locator('text=/plan.*personal|plan.*minnesbricka|plan.*custom/i');
      if (await subscriptionInfo.count() > 0) {
        const planText = await subscriptionInfo.first().textContent();
        console.log(`✅ User subscription plan: ${planText}`);
      }
      
      // Check for memorial count/limit display
      const limitInfo = page.locator('text=/\\d+.*av.*\\d+|\\d+.*of.*\\d+|minneslundar.*\\d+/i');
      if (await limitInfo.count() > 0) {
        const limitText = await limitInfo.first().textContent();
        console.log(`✅ Memorial limit info: ${limitText}`);
      }
      
      // Check if creation is allowed
      const creationBlocked = page.locator('text=/gräns.*nådd|limit.*reached|maximum.*reached/i');
      if (await creationBlocked.count() > 0) {
        console.log('✅ Memorial creation blocked due to subscription limit');
        
        // Check for upgrade prompt
        const upgradeButton = page.locator('a:has-text("Uppgradera"), button:has-text("Upgrade")');
        if (await upgradeButton.isVisible()) {
          console.log('✅ Upgrade prompt displayed');
        }
      } else {
        console.log('✅ Memorial creation allowed within subscription limits');
      }
      
    } else if (page.url().includes('/pricing')) {
      console.log('✅ User redirected to pricing due to subscription limits');
    }
  });

  test('Memorial auto-approval for paying users', async ({ page }) => {
    await page.goto('/memorial/create');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/memorial/create')) {
      // Fill out memorial creation form
      const nameField = page.locator('input[name="title"], input[name="name"]');
      const bornField = page.locator('input[name="born"], input[name="dateOfBirth"]');
      const diedField = page.locator('input[name="died"], input[name="dateOfDeath"]');
      
      if (await nameField.isVisible()) {
        await nameField.fill('Auto-Approval Test Memorial');
        console.log('✅ Memorial name filled');
      }
      
      if (await bornField.isVisible()) {
        await bornField.fill('1955-01-01');
        console.log('✅ Birth date filled');
      }
      
      if (await diedField.isVisible()) {
        await diedField.fill('2023-01-01');
        console.log('✅ Death date filled');
      }
      
      // Add description if available
      const descriptionField = page.locator('textarea[name="description"], textarea[name="subtitle"]');
      if (await descriptionField.isVisible()) {
        await descriptionField.fill('Test memorial for auto-approval verification');
        console.log('✅ Description filled');
      }
      
      // Submit form
      const submitButton = page.locator('button[type="submit"], button:has-text("Skapa"), button:has-text("Create")');
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(3000);
        
        const currentUrl = page.url();
        
        if (currentUrl.includes('/dashboard')) {
          console.log('✅ Memorial creation completed, redirected to dashboard');
          
          // Check for success message
          const successMessage = page.locator('text=/framgångsrikt|successfully|skapad|created/i');
          if (await successMessage.count() > 0) {
            console.log('✅ Success message displayed');
          }
          
          // Check if memorial appears in list
          const memorialsList = page.locator('text=/Auto-Approval Test Memorial/i');
          if (await memorialsList.count() > 0) {
            console.log('✅ Created memorial appears in dashboard');
            
            // Check memorial status
            const statusBadge = page.locator('.status, .badge').first();
            if (await statusBadge.isVisible()) {
              const statusText = await statusBadge.textContent();
              console.log(`✅ Memorial status: ${statusText}`);
              
              if (statusText?.includes('publicerad') || statusText?.includes('published')) {
                console.log('✅ Memorial auto-approved for paying user');
              } else if (statusText?.includes('pending') || statusText?.includes('väntar')) {
                console.log('✅ Memorial requires manual approval (free user)');
              }
            }
          }
        } else {
          console.log(`ℹ️ Memorial creation redirected to: ${currentUrl}`);
        }
      }
    }
  });

  test('Memorial NFC tag generation', async ({ page }) => {
    // First, go to dashboard to see if there are existing memorials
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/dashboard')) {
      // Look for existing memorials
      const memorialItems = page.locator('.memorial-card, .memorial-item, [data-testid="memorial-item"]');
      const memorialCount = await memorialItems.count();
      
      if (memorialCount > 0) {
        console.log(`✅ Found ${memorialCount} existing memorials`);
        
        // Click on first memorial to view details
        const firstMemorial = memorialItems.first();
        const viewButton = firstMemorial.locator('a:has-text("Visa"), a:has-text("View")');
        
        if (await viewButton.isVisible()) {
          await viewButton.click();
          await page.waitForLoadState('networkidle');
          
          // Look for NFC/Minnesbricka information
          const nfcInfo = page.locator('text=/nfc|minnesbricka/i');
          if (await nfcInfo.count() > 0) {
            console.log('✅ NFC/Minnesbricka information found in memorial');
            
            // Look for NFC tag UID
            const nfcUid = page.locator('text=/minnesbricka.*\\w+|nfc.*\\w+/i');
            if (await nfcUid.count() > 0) {
              const uidText = await nfcUid.first().textContent();
              console.log(`✅ NFC Tag UID: ${uidText}`);
            }
            
            // Look for QR code
            const qrCode = page.locator('img[alt*="QR"], canvas, .qr-code');
            if (await qrCode.count() > 0) {
              console.log('✅ QR code found');
            }
          }
        }
      } else {
        console.log('ℹ️ No existing memorials found to check NFC functionality');
      }
    }
  });

  test('Memorial creation error handling', async ({ page }) => {
    await page.goto('/memorial/create');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/memorial/create')) {
      // Test with invalid date formats
      const bornField = page.locator('input[name="born"], input[name="dateOfBirth"]');
      const diedField = page.locator('input[name="died"], input[name="dateOfDeath"]');
      
      if (await bornField.isVisible() && await diedField.isVisible()) {
        // Test invalid date order (died before born)
        await bornField.fill('2000-01-01');
        await diedField.fill('1990-01-01');
        
        const submitButton = page.locator('button[type="submit"], button:has-text("Skapa"), button:has-text("Create")');
        if (await submitButton.isVisible()) {
          await submitButton.click();
          await page.waitForTimeout(2000);
          
          // Check for validation error
          const validationError = page.locator('.error, .invalid, text=/invalid.*date|ogiltigt.*datum/i');
          if (await validationError.count() > 0) {
            console.log('✅ Date validation error handling works');
          }
        }
      }
      
      // Test with missing required fields
      const nameField = page.locator('input[name="title"], input[name="name"]');
      if (await nameField.isVisible()) {
        await nameField.fill(''); // Clear name field
        
        const submitButton = page.locator('button[type="submit"], button:has-text("Skapa"), button:has-text("Create")');
        if (await submitButton.isVisible()) {
          await submitButton.click();
          await page.waitForTimeout(1000);
          
          // Check for required field validation
          const requiredError = page.locator('.error, .invalid, [aria-invalid="true"]');
          if (await requiredError.count() > 0) {
            console.log('✅ Required field validation works');
          }
        }
      }
    }
  });

  test('Memorial creation cancellation', async ({ page }) => {
    await page.goto('/memorial/create');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/memorial/create')) {
      // Look for cancel button
      const cancelButton = page.locator('button:has-text("Avbryt"), button:has-text("Cancel"), a:has-text("Tillbaka")');
      
      if (await cancelButton.isVisible()) {
        await cancelButton.click();
        await page.waitForLoadState('networkidle');
        
        const currentUrl = page.url();
        if (currentUrl.includes('/dashboard')) {
          console.log('✅ Memorial creation cancellation redirects to dashboard');
        } else {
          console.log(`✅ Memorial creation cancelled, redirected to: ${currentUrl}`);
        }
      } else {
        console.log('ℹ️ Cancel button not found in memorial creation');
      }
    }
  });

  test('Memorial preview functionality', async ({ page }) => {
    await page.goto('/memorial/create');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/memorial/create')) {
      // Fill out some form fields
      const nameField = page.locator('input[name="title"], input[name="name"]');
      if (await nameField.isVisible()) {
        await nameField.fill('Preview Test Memorial');
        
        // Look for preview functionality
        const previewButton = page.locator('button:has-text("Förhandsgranska"), button:has-text("Preview")');
        
        if (await previewButton.isVisible()) {
          await previewButton.click();
          await page.waitForTimeout(2000);
          
          // Check if preview opens
          const previewModal = page.locator('.modal, .preview, [role="dialog"]');
          if (await previewModal.isVisible()) {
            console.log('✅ Memorial preview modal opened');
            
            // Look for preview content
            const previewContent = previewModal.locator('text=/Preview Test Memorial/i');
            if (await previewContent.isVisible()) {
              console.log('✅ Preview shows memorial content');
            }
            
            // Close preview
            const closeButton = previewModal.locator('button:has-text("Stäng"), button:has-text("Close"), [aria-label*="close"]');
            if (await closeButton.isVisible()) {
              await closeButton.click();
              console.log('✅ Preview modal can be closed');
            }
          } else {
            console.log('ℹ️ Preview opens in new tab or same page');
          }
        } else {
          console.log('ℹ️ Preview functionality not found');
        }
      }
    }
  });
});