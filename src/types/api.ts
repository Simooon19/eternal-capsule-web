// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status: 'success' | 'error';
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Rate limiting types
export interface RateLimitHeaders {
  'X-RateLimit-Limit': string;
  'X-RateLimit-Remaining': string;
  'X-RateLimit-Reset': string;
  'Retry-After'?: string;
}

export interface RateLimitError {
  error: string;
  limit: number;
  remaining: number;
  resetTime: number;
}

// Performance monitoring types
export interface CoreWebVitals {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
}

export interface PerformanceSession {
  id: string;
  memorialId: string;
  metrics: CoreWebVitals;
  timestamp: string;
  userAgent: string;
  connectionType: string;
  viewport: {
    width: number;
    height: number;
  };
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
}

export interface PerformanceAnalytics {
  totalSessions: number;
  averageMetrics: CoreWebVitals | null;
  recentSessions: PerformanceSession[];
  performanceScore: number;
  trends: {
    period: '24h' | '7d' | '30d';
    improvement: number; // Percentage change
  };
}

// User interaction types
export interface UserInteraction {
  id: string;
  memorialId: string;
  action: 'click' | 'touchstart' | 'scroll' | 'focus' | 'hover';
  elementType: string;
  elementClass: string;
  elementId?: string;
  elementText?: string;
  timestamp: string;
  position?: {
    x: number;
    y: number;
  };
  sessionId?: string;
}

export interface InteractionAnalytics {
  totalInteractions: number;
  recentInteractions: UserInteraction[];
  topElements: Array<{
    element: string;
    count: number;
    percentage: number;
  }>;
  topActions: Array<{
    action: string;
    count: number;
    percentage: number;
  }>;
  heatmapData?: Array<{
    x: number;
    y: number;
    intensity: number;
  }>;
}

// Guestbook types
export interface GuestbookEntryData {
  memorialId: string;
  author: string;
  message: string;
  email?: string;
  relationship?: string;
}

export interface GuestbookReaction {
  emoji: string;
  count: number;
  users?: string[]; // For tracking who reacted
}

export interface GuestbookEntryResponse {
  _id: string;
  author: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reactions: GuestbookReaction[];
  memorial: {
    _ref: string;
  };
}

// Memorial types for API
export interface MemorialCreateData {
  name: string;
  subtitle?: string;
  born: string;
  died: string;
  bornAt: {
    location: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  diedAt: {
    location: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  privacy: 'public' | 'private' | 'password-protected';
  password?: string;
  tags: string[];
  storyBlocks?: any[]; // Portable Text blocks
  gallery?: File[];
}

export interface MemorialUpdateData extends Partial<MemorialCreateData> {
  _id: string;
}

// Bulk memorial creation for funeral homes
export interface BulkMemorialData {
  name: string;
  born: string;
  died: string;
  birthLocation?: string;
  deathLocation?: string;
  description?: string;
  familyEmail?: string;
  tags?: string[];
}

export interface BulkMemorialRequest {
  memorials: BulkMemorialData[];
}

export interface BulkMemorialResult {
  index: number;
  success: boolean;
  memorial?: {
    id: string;
    slug: string;
    url: string;
    nfcTagUid: string;
  };
  error?: string;
}

export interface BulkMemorialResponse {
  success: boolean;
  created: number;
  failed: number;
  results: BulkMemorialResult[];
  errors?: Array<{
    index: number;
    error: string;
    data: BulkMemorialData;
  }>;
}

// Upload types
export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  assetId: string;
}

export interface UploadProgress {
  filename: string;
  progress: number; // 0-100
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

// Search and filtering types
export interface SearchFilters {
  query?: string;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  location?: string;
  privacy?: ('public' | 'private')[];
  sortBy?: 'relevance' | 'date_created' | 'date_died' | 'alphabetical';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResults<T> extends PaginatedResponse<T> {
  filters: SearchFilters;
  facets?: {
    tags: Array<{ tag: string; count: number }>;
    locations: Array<{ location: string; count: number }>;
    years: Array<{ year: number; count: number }>;
  };
}

// Analytics aggregation types
export interface AnalyticsTimeframe {
  period: 'hour' | 'day' | 'week' | 'month';
  start: string;
  end: string;
}

export interface AnalyticsMetrics {
  pageViews: number;
  uniqueVisitors: number;
  averageSessionDuration: number;
  bounceRate: number;
  conversionRate: number;
  topPages: Array<{
    path: string;
    views: number;
    uniqueViews: number;
  }>;
}

// Error types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: ValidationError[];
  timestamp: string;
  requestId?: string;
}

// Webhook types (for future integrations)
export interface WebhookPayload<T = any> {
  event: string;
  timestamp: string;
  data: T;
  source: 'memorial' | 'guestbook' | 'admin';
  version: string;
}

// Admin dashboard types
export interface DashboardStats {
  totalMemorials: number;
  pendingApprovals: number;
  totalGuestbookEntries: number;
  recentActivity: Array<{
    type: 'memorial_created' | 'guestbook_entry' | 'approval';
    message: string;
    timestamp: string;
    memorialId?: string;
  }>;
  performanceOverview: {
    averageLoadTime: number;
    totalSessions: number;
    performanceScore: number;
  };
}

// Configuration types
export interface AppConfig {
  features: {
    enableGuestbook: boolean;
    enableAnalytics: boolean;
    enableRateLimiting: boolean;
    enableProfanityFilter: boolean;
    enableEmailNotifications: boolean;
  };
  limits: {
    maxUploadSize: number;
    maxGalleryImages: number;
    maxStoryLength: number;
    guestbookMessageLength: number;
  };
  security: {
    requireApproval: boolean;
    enableCaptcha: boolean;
    allowedImageTypes: string[];
  };
}

// Export utility type helpers
export type ApiHandler<T = any> = (
  request: Request
) => Promise<Response | ApiResponse<T>>;

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type WithRateLimit<T> = T & {
  rateLimitInfo?: {
    limit: number;
    remaining: number;
    resetTime: number;
  };
}; 