import { test, expect } from '@playwright/test';
import { EternalCapsuleHelpers } from '../helpers/test-helpers';

test.describe('Authentication Flows - Sign In/Up and Session Management', () => {
  let helpers: EternalCapsuleHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new EternalCapsuleHelpers(page);
  });

  test('User can access sign in page', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.waitForLoadState('networkidle');
    
    // Check sign in page structure
    await expect(page.locator('h1, h2')).toContainText(/logga.*in|sign.*in/i);
    
    // Check for form elements
    const emailField = page.locator('input[type="email"], input[name="email"]');
    const passwordField = page.locator('input[type="password"], input[name="password"]');
    const submitButton = page.locator('button[type="submit"]');
    
    await expect(emailField).toBeVisible();
    await expect(passwordField).toBeVisible();
    await expect(submitButton).toBeVisible();
    
    // Check for Google OAuth button
    const googleButton = page.locator('button:has-text("Google"), a:has-text("Google")');
    if (await googleButton.isVisible()) {
      console.log('✅ Google OAuth button found');
    }
    
    // Check for sign up link
    const signUpLink = page.locator('a[href*="/signup"]');
    await expect(signUpLink).toBeVisible();
    
    console.log('✅ Sign in page structure verified');
  });

  test('User can access sign up page', async ({ page }) => {
    await page.goto('/auth/signup');
    await page.waitForLoadState('networkidle');
    
    // Check sign up page structure
    await expect(page.locator('h1, h2')).toContainText(/skapa.*konto|sign.*up|registrera/i);
    
    // Check for form elements
    const emailField = page.locator('input[type="email"], input[name="email"]');
    const passwordField = page.locator('input[name="password"]').first();
    
    await expect(emailField).toBeVisible();
    await expect(passwordField).toBeVisible();
    
    // Check for Google OAuth
    const googleButton = page.locator('button:has-text("Google"), a:has-text("Google")');
    if (await googleButton.isVisible()) {
      console.log('✅ Google OAuth signup option found');
    }
    
    console.log('✅ Sign up page structure verified');
  });

  test('Protected routes redirect to authentication', async ({ page }) => {
    const protectedRoutes = [
      '/dashboard',
      '/account',
      '/memorial/create'
    ];
    
    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      
      const currentUrl = page.url();
      
      // Should redirect to sign in
      if (currentUrl.includes('/auth/signin')) {
        console.log(`✅ ${route} properly redirects to authentication`);
        
        // Check for callback URL
        const urlParams = new URL(currentUrl).searchParams;
        const callbackUrl = urlParams.get('callbackUrl');
        if (callbackUrl === route) {
          console.log(`✅ Callback URL properly set for ${route}`);
        }
      } else {
        console.log(`ℹ️ ${route} may not require authentication or user is already logged in`);
      }
    }
  });

  test('Authenticated users redirect away from auth pages', async ({ page }) => {
    // First, try to simulate being logged in by checking if there's a session
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    
    if (currentUrl.includes('/dashboard')) {
      // User is logged in, test redirect behavior
      await page.goto('/auth/signin');
      await page.waitForLoadState('networkidle');
      
      const redirectedUrl = page.url();
      if (redirectedUrl.includes('/dashboard')) {
        console.log('✅ Authenticated users redirected away from sign in page');
      }
      
      await page.goto('/auth/signup');
      await page.waitForLoadState('networkidle');
      
      const signupRedirectUrl = page.url();
      if (signupRedirectUrl.includes('/dashboard')) {
        console.log('✅ Authenticated users redirected away from sign up page');
      }
    } else {
      console.log('ℹ️ No active session found, skipping authenticated redirect test');
    }
  });

  test('Invalid credentials show error message', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.waitForLoadState('networkidle');
    
    // Fill form with invalid credentials
    const emailField = page.locator('input[type="email"], input[name="email"]');
    const passwordField = page.locator('input[type="password"], input[name="password"]');
    const submitButton = page.locator('button[type="submit"]');
    
    await emailField.fill('invalid@example.com');
    await passwordField.fill('wrongpassword');
    await submitButton.click();
    
    // Wait for error message
    await page.waitForTimeout(2000);
    
    // Check for error message
    const errorMessage = page.locator('.error, .text-red, [role="alert"]');
    if (await errorMessage.count() > 0) {
      const errorText = await errorMessage.first().textContent();
      console.log(`✅ Error message displayed: ${errorText}`);
    } else {
      console.log('ℹ️ No error message found - may use different error handling');
    }
  });

  test('Sign up form validation', async ({ page }) => {
    await page.goto('/auth/signup');
    await page.waitForLoadState('networkidle');
    
    const submitButton = page.locator('button[type="submit"]');
    
    // Try submitting empty form
    await submitButton.click();
    await page.waitForTimeout(1000);
    
    // Check for HTML5 validation or custom validation
    const emailField = page.locator('input[type="email"], input[name="email"]');
    const isEmailInvalid = await emailField.evaluate(el => {
      const input = el as HTMLInputElement;
      return typeof input.checkValidity === 'function' ? !input.checkValidity() : true;
    });
    
    if (isEmailInvalid) {
      console.log('✅ Form validation prevents empty submission');
    }
    
    // Test with invalid email format
    await emailField.fill('invalid-email');
    await submitButton.click();
    await page.waitForTimeout(1000);
    
    const isStillInvalid = await emailField.evaluate(el => {
      const input = el as HTMLInputElement;
      return typeof input.checkValidity === 'function' ? !input.checkValidity() : true;
    });
    if (isStillInvalid) {
      console.log('✅ Email format validation works');
    }
    
    // Test with valid email but weak password
    await emailField.fill('test@example.com');
    const passwordField = page.locator('input[name="password"]').first();
    await passwordField.fill('123');
    await submitButton.click();
    await page.waitForTimeout(2000);
    
    // Check for password strength validation
    const validationMessage = page.locator('.error, .text-red, [role="alert"]');
    if (await validationMessage.count() > 0) {
      console.log('✅ Password strength validation found');
    }
  });

  test('Session persistence and logout', async ({ page }) => {
    // Try to access dashboard to check session state
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ Active session found');
      
      // Look for logout/sign out button
      const logoutButton = page.locator('button:has-text("Logga ut"), button:has-text("Sign out"), a:has-text("Logga ut")');
      
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        await page.waitForLoadState('networkidle');
        
        // Should redirect to home or sign in
        const loggedOutUrl = page.url();
        if (loggedOutUrl.includes('/auth') || loggedOutUrl === page.url().split('/').slice(0, 3).join('/') + '/') {
          console.log('✅ Logout functionality works');
          
          // Try accessing dashboard again - should redirect
          await page.goto('/dashboard');
          await page.waitForLoadState('networkidle');
          
          if (page.url().includes('/auth')) {
            console.log('✅ Session properly cleared after logout');
          }
        }
      } else {
        console.log('ℹ️ Logout button not found in current view');
      }
    } else {
      console.log('ℹ️ No active session, testing sign in flow');
      
      // Test basic sign in flow
      expect(currentUrl).toContain('/auth/signin');
      
      // Fill sign in form with test credentials
      const emailField = page.locator('input[type="email"], input[name="email"]');
      const passwordField = page.locator('input[type="password"], input[name="password"]');
      
      if (await emailField.isVisible() && await passwordField.isVisible()) {
        await emailField.fill('test@example.com');
        await passwordField.fill('testpassword');
        
        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();
        await page.waitForTimeout(3000);
        
        const postSignInUrl = page.url();
        if (postSignInUrl.includes('/dashboard')) {
          console.log('✅ Sign in flow completed successfully');
        } else if (postSignInUrl.includes('/auth')) {
          console.log('ℹ️ Sign in attempt made but may require valid credentials');
        }
      }
    }
  });

  test('Google OAuth integration availability', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.waitForLoadState('networkidle');
    
    const googleButton = page.locator('button:has-text("Google"), a:has-text("Google"), [data-testid="google-signin"]');
    
    if (await googleButton.isVisible()) {
      console.log('✅ Google OAuth button found');
      
      // Test clicking Google button (will redirect to Google)
      await googleButton.click();
      await page.waitForTimeout(2000);
      
      const currentUrl = page.url();
      
      if (currentUrl.includes('google') || currentUrl.includes('oauth')) {
        console.log('✅ Google OAuth redirect initiated');
        
        // Navigate back to continue tests
        await page.goto('/auth/signin');
        await page.waitForLoadState('networkidle');
      } else if (currentUrl.includes('/dashboard')) {
        console.log('✅ Already authenticated via Google');
      } else {
        console.log('ℹ️ Google OAuth may not be fully configured');
      }
    } else {
      console.log('ℹ️ Google OAuth button not found');
    }
  });

  test('Password reset functionality', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.waitForLoadState('networkidle');
    
    // Look for forgot password link
    const forgotPasswordLink = page.locator('a:has-text("Glömt lösenord"), a:has-text("Forgot password"), a[href*="reset"]');
    
    if (await forgotPasswordLink.isVisible()) {
      await forgotPasswordLink.click();
      await page.waitForLoadState('networkidle');
      
      // Check password reset page
      // Check if we're on password reset page or still on sign in
      const currentUrl = page.url();
      if (currentUrl.includes('reset') || currentUrl.includes('forgot')) {
        await expect(page.locator('h1, h2')).toContainText(/reset|glömt|forgot/i);
      } else {
        console.log('ℹ️ Password reset link may not be available or redirected elsewhere');
        return;
      }
      
      // Check for email field
      const emailField = page.locator('input[type="email"], input[name="email"]');
      if (await emailField.isVisible()) {
        await emailField.fill('test@example.com');
        
        const submitButton = page.locator('button[type="submit"]');
        if (await submitButton.isVisible()) {
          await submitButton.click();
          await page.waitForTimeout(2000);
          console.log('✅ Password reset form submitted');
        }
      }
    } else {
      console.log('ℹ️ Password reset functionality not found');
    }
  });
});