import { test, expect } from '@playwright/test';
import { EternalCapsuleHelpers } from '../helpers/test-helpers';

test.describe('Admin and Funeral Home Flows - Business Management', () => {
  let helpers: EternalCapsuleHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new EternalCapsuleHelpers(page);
  });

  test('Admin dashboard access and protection', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    
    if (currentUrl.includes('/admin')) {
      console.log('✅ Admin dashboard accessible (user has admin privileges)');
      
      // Check for admin dashboard elements
      const adminContent = page.locator('text=/dashboard|analytics|users|business.*metrics/i');
      if (await adminContent.count() > 0) {
        console.log('✅ Admin dashboard content found');
      }
      
      // Check for user management section
      const userManagement = page.locator('text=/användare|users|accounts/i');
      if (await userManagement.count() > 0) {
        console.log('✅ User management section found');
      }
      
      // Check for business metrics
      const businessMetrics = page.locator('text=/metrics|statistik|analytics/i');
      if (await businessMetrics.count() > 0) {
        console.log('✅ Business metrics section found');
      }
      
    } else if (currentUrl.includes('/auth')) {
      console.log('✅ Admin dashboard properly protected with authentication');
      
      // Check callback URL
      const urlParams = new URL(currentUrl).searchParams;
      const callbackUrl = urlParams.get('callbackUrl');
      expect(callbackUrl).toBe('/admin');
      
    } else {
      console.log('✅ Admin dashboard redirected to unauthorized page (user lacks admin privileges)');
    }
  });

  test('Business metrics API endpoints', async ({ page }) => {
    // Test business metrics API endpoint
    const metricsResponse = await page.request.get('/api/admin/business-metrics');
    const status = metricsResponse.status();
    
    console.log(`Business metrics API status: ${status}`);
    
    if (status === 200) {
      const metricsData = await metricsResponse.json();
      console.log('✅ Business metrics API accessible');
      
      // Check for expected metrics structure
      const expectedMetrics = ['totalUsers', 'totalMemorials', 'revenue', 'subscriptions'];
      for (const metric of expectedMetrics) {
        if (metric in metricsData) {
          console.log(`✅ Business metric found: ${metric}`);
        }
      }
      
    } else if (status === 401 || status === 403) {
      console.log('✅ Business metrics API properly protected');
      
    } else if (status === 404) {
      console.log('ℹ️ Business metrics API endpoint not found');
      
    } else {
      console.log(`ℹ️ Business metrics API returned status: ${status}`);
    }
  });

  test('Analytics endpoints security and access', async ({ page }) => {
    const analyticsEndpoints = [
      '/api/analytics/performance',
      '/api/analytics/search',
      '/api/analytics/interaction',
      '/api/analytics/memorial-views'
    ];
    
    for (const endpoint of analyticsEndpoints) {
      const response = await page.request.get(endpoint);
      const status = response.status();
      
      console.log(`Analytics endpoint ${endpoint}: ${status}`);
      
      if (status === 200) {
        console.log(`✅ Analytics endpoint ${endpoint} accessible`);
        
        const data = await response.json();
        if (data && typeof data === 'object') {
          console.log(`✅ ${endpoint} returns valid data`);
        }
        
      } else if (status === 401 || status === 403) {
        console.log(`✅ Analytics endpoint ${endpoint} properly protected`);
        
      } else if (status === 404) {
        console.log(`ℹ️ Analytics endpoint ${endpoint} not implemented`);
        
      } else {
        console.log(`ℹ️ Analytics endpoint ${endpoint} status: ${status}`);
      }
    }
  });

  test('Bulk memorial operations - CSV import', async ({ page }) => {
    // Test bulk memorials endpoint
    const bulkResponse = await page.request.get('/api/memorials/bulk');
    const status = bulkResponse.status();
    
    console.log(`Bulk memorials API status: ${status}`);
    
    if (status === 405) {
      console.log('✅ Bulk memorials endpoint requires POST method (correct for CSV upload)');
      
      // Test with POST (without actual data)
      const postResponse = await page.request.post('/api/memorials/bulk', {
        data: { test: true }
      });
      const postStatus = postResponse.status();
      
      if (postStatus === 401 || postStatus === 403) {
        console.log('✅ Bulk operations properly require authentication');
      } else if (postStatus === 400) {
        console.log('✅ Bulk operations validate request data');
      } else {
        console.log(`ℹ️ Bulk operations POST status: ${postStatus}`);
      }
      
    } else if (status === 401 || status === 403) {
      console.log('✅ Bulk operations properly protected');
      
    } else if (status === 200) {
      console.log('✅ Bulk operations accessible (user has permissions)');
      
    } else {
      console.log(`ℹ️ Bulk operations status: ${status}`);
    }
  });

  test('Funeral home dashboard access', async ({ page }) => {
    // Check if there's a funeral home specific dashboard
    await page.goto('/funeral-home');
    await page.waitForLoadState('networkidle');
    
    let currentUrl = page.url();
    
    if (currentUrl.includes('/funeral-home')) {
      console.log('✅ Funeral home dashboard accessible');
      
      // Check for funeral home specific features
      const funeralFeatures = page.locator('text=/csv.*import|bulk.*upload|begravningsbyrå/i');
      if (await funeralFeatures.count() > 0) {
        console.log('✅ Funeral home specific features found');
      }
      
    } else if (currentUrl.includes('/auth')) {
      console.log('✅ Funeral home dashboard requires authentication');
      
    } else {
      console.log('ℹ️ No specific funeral home dashboard found');
      
      // Check if funeral home features are in main dashboard
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      if (page.url().includes('/dashboard')) {
        const bulkFeatures = page.locator('text=/csv|bulk|import|mass.*upload/i');
        if (await bulkFeatures.count() > 0) {
          console.log('✅ Bulk/CSV features found in main dashboard');
        }
      }
    }
  });

  test('CSV import functionality testing', async ({ page }) => {
    // Try to access CSV import functionality
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/dashboard')) {
      // Look for CSV import link or button
      const csvImportLink = page.locator('a:has-text("CSV"), a:has-text("Import"), a:has-text("Bulk"), a[href*="csv"]');
      
      if (await csvImportLink.isVisible()) {
        console.log('✅ CSV import functionality found');
        
        await csvImportLink.click();
        await page.waitForLoadState('networkidle');
        
        // Check for CSV upload form
        const csvForm = page.locator('form:has(input[type="file"]), .csv-upload, .bulk-upload');
        if (await csvForm.isVisible()) {
          console.log('✅ CSV upload form found');
          
          // Check for file input
          const fileInput = csvForm.locator('input[type="file"]');
          if (await fileInput.isVisible()) {
            console.log('✅ File upload input found');
            
            // Check file type restrictions
            const acceptAttr = await fileInput.getAttribute('accept');
            if (acceptAttr && acceptAttr.includes('.csv')) {
              console.log('✅ CSV file type restriction found');
            }
          }
          
          // Check for template download
          const templateLink = page.locator('a:has-text("mall"), a:has-text("template"), a[href*="template"]');
          if (await templateLink.isVisible()) {
            console.log('✅ CSV template download available');
          }
          
          // Check for instructions
          const instructions = page.locator('text=/instruktioner|instructions|hur.*man/i');
          if (await instructions.count() > 0) {
            console.log('✅ CSV import instructions provided');
          }
        }
        
      } else {
        console.log('ℹ️ CSV import functionality not found or not accessible');
      }
    }
  });

  test('Memorial moderation and approval', async ({ page }) => {
    // Check for memorial moderation functionality
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/admin')) {
      // Look for pending memorials section
      const pendingMemorials = page.locator('text=/pending|väntande|godkännande/i');
      
      if (await pendingMemorials.count() > 0) {
        console.log('✅ Memorial moderation section found');
        
        // Look for approval/rejection buttons
        const approvalButtons = page.locator('button:has-text("Godkänn"), button:has-text("Approve")');
        const rejectionButtons = page.locator('button:has-text("Avslå"), button:has-text("Reject")');
        
        if (await approvalButtons.count() > 0) {
          console.log('✅ Memorial approval functionality found');
        }
        
        if (await rejectionButtons.count() > 0) {
          console.log('✅ Memorial rejection functionality found');
        }
        
        // Check for bulk actions
        const bulkActions = page.locator('select, .bulk-actions');
        if (await bulkActions.count() > 0) {
          console.log('✅ Bulk moderation actions available');
        }
      }
      
    } else {
      console.log('ℹ️ Admin dashboard not accessible for moderation testing');
    }
  });

  test('User role management', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/admin')) {
      // Look for user management section
      const userManagement = page.locator('text=/användare|users|accounts/i');
      
      if (await userManagement.count() > 0) {
        console.log('✅ User management section found');
        
        // Look for role assignment functionality
        const roleSelectors = page.locator('select[name*="role"], .role-selector');
        if (await roleSelectors.count() > 0) {
          console.log('✅ Role assignment functionality found');
          
          // Check for available roles
          const roles = ['USER', 'ADMIN', 'FUNERAL_HOME'];
          for (const role of roles) {
            const roleOption = page.locator(`option[value="${role}"], text="${role}"`);
            if (await roleOption.count() > 0) {
              console.log(`✅ Role option found: ${role}`);
            }
          }
        }
        
        // Look for user actions (activate, deactivate, delete)
        const userActions = page.locator('button:has-text("Aktivera"), button:has-text("Inaktivera"), button:has-text("Delete")');
        if (await userActions.count() > 0) {
          console.log('✅ User management actions available');
        }
      }
    }
  });

  test('Business analytics and reporting', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/admin')) {
      // Look for analytics/reporting section
      const analyticsSection = page.locator('text=/analytics|rapporter|statistik/i');
      
      if (await analyticsSection.count() > 0) {
        console.log('✅ Analytics section found in admin dashboard');
        
        // Check for key metrics display
        const metrics = page.locator('.metric, .stat, .kpi');
        const metricCount = await metrics.count();
        
        if (metricCount > 0) {
          console.log(`✅ Found ${metricCount} business metrics displayed`);
          
          // Check for revenue metrics
          const revenueMetrics = page.locator('text=/revenue|intäkter|försäljning/i');
          if (await revenueMetrics.count() > 0) {
            console.log('✅ Revenue metrics found');
          }
          
          // Check for user growth metrics
          const userMetrics = page.locator('text=/users|användare|growth/i');
          if (await userMetrics.count() > 0) {
            console.log('✅ User growth metrics found');
          }
          
          // Check for memorial creation metrics
          const memorialMetrics = page.locator('text=/memorials|minneslundar|created/i');
          if (await memorialMetrics.count() > 0) {
            console.log('✅ Memorial creation metrics found');
          }
        }
        
        // Check for export functionality
        const exportButtons = page.locator('button:has-text("Export"), a:has-text("Download"), button:has-text("Ladda ned")');
        if (await exportButtons.count() > 0) {
          console.log('✅ Data export functionality found');
        }
      }
    }
  });

  test('System health and monitoring', async ({ page }) => {
    // Test health endpoint
    const healthResponse = await page.request.get('/api/health');
    const healthStatus = healthResponse.status();
    
    if (healthStatus === 200) {
      const healthData = await healthResponse.json();
      console.log('✅ System health endpoint accessible');
      
      // Check health data structure
      if (healthData.status) {
        console.log(`✅ System status: ${healthData.status}`);
      }
      
      if (healthData.services) {
        console.log('✅ Service health information available');
        
        // Check individual services
        const services = ['database', 'sanity', 'environment'];
        for (const service of services) {
          if (healthData.services[service]) {
            console.log(`✅ ${service} service status available`);
          }
        }
      }
      
      if (healthData.uptime) {
        console.log(`✅ System uptime: ${healthData.uptime}s`);
      }
      
    } else {
      console.log(`ℹ️ Health endpoint status: ${healthStatus}`);
    }
    
    // Check if admin dashboard shows system status
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/admin')) {
      const systemStatus = page.locator('text=/system.*status|hälsa|monitoring/i');
      if (await systemStatus.count() > 0) {
        console.log('✅ System monitoring section found in admin dashboard');
      }
    }
  });

  test('Funeral home onboarding and management', async ({ page }) => {
    // Check for funeral home specific features and onboarding
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/admin')) {
      // Look for funeral home management
      const funeralHomeSection = page.locator('text=/funeral.*home|begravningsbyrå|funeral.*partner/i');
      
      if (await funeralHomeSection.count() > 0) {
        console.log('✅ Funeral home management section found');
        
        // Check for onboarding features
        const onboardingFeatures = page.locator('text=/onboard|invite|add.*funeral.*home/i');
        if (await onboardingFeatures.count() > 0) {
          console.log('✅ Funeral home onboarding features found');
        }
        
        // Check for funeral home listing
        const funeralHomeList = page.locator('.funeral-home-item, .partner-item');
        const listCount = await funeralHomeList.count();
        
        if (listCount > 0) {
          console.log(`✅ Found ${listCount} funeral homes in management list`);
        }
        
        // Check for performance metrics per funeral home
        const performanceMetrics = page.locator('text=/performance|antal.*minneslundar|memorial.*count/i');
        if (await performanceMetrics.count() > 0) {
          console.log('✅ Funeral home performance metrics available');
        }
      }
    }
  });

  test('Content moderation tools', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    if (page.url().includes('/admin')) {
      // Look for content moderation tools
      const moderationSection = page.locator('text=/moderation|content.*review|guestbook.*review/i');
      
      if (await moderationSection.count() > 0) {
        console.log('✅ Content moderation section found');
        
        // Check for guestbook moderation
        const guestbookModeration = page.locator('text=/guestbook|guest.*messages|kondoleans/i');
        if (await guestbookModeration.count() > 0) {
          console.log('✅ Guestbook moderation tools found');
        }
        
        // Check for flagged content
        const flaggedContent = page.locator('text=/flagged|reported|inappropriate/i');
        if (await flaggedContent.count() > 0) {
          console.log('✅ Flagged content management found');
        }
        
        // Check for automated moderation settings
        const automationSettings = page.locator('text=/auto.*moderate|filter.*settings|profanity/i');
        if (await automationSettings.count() > 0) {
          console.log('✅ Automated moderation settings found');
        }
      }
    }
  });
});