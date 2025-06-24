'use client';

import React, { useState, useEffect } from 'react';
import { PerformanceMonitor } from '@/components/analytics/PerformanceMonitor';

interface BusinessMetrics {
  revenue: {
    total: number;
    monthly: number;
    quarterly: number;
    yearly: number;
    growth: number;
  };
  subscriptions: {
    total: number;
    active: number;
    churned: number;
    new: number;
    byPlan: Record<string, number>;
  };
  usage: {
    totalMemorials: number;
    memorialsThisMonth: number;
    totalViews: number;
    avgViewsPerMemorial: number;
    totalGuestbookEntries: number;
  };
  funeralHomes: {
    total: number;
    active: number;
    inactive: number;
    newThisMonth: number;
  };
  performance: {
    avgLoadTime: number;
    coreWebVitals: {
      fcp: number;
      lcp: number;
      cls: number;
      fid: number;
    };
    uptime: number;
  };
  support: {
    totalTickets: number;
    openTickets: number;
    avgResponseTime: number;
    satisfaction: number;
  };
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    fill?: boolean;
  }[];
}

export function BusinessDashboard() {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBusinessMetrics();
  }, [timeRange]);

  const fetchBusinessMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/business-metrics?range=${timeRange}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch business metrics');
      }
      
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Dashboard</h3>
          <p className="text-red-600 mt-1">{error}</p>
          <button
            onClick={fetchBusinessMetrics}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Key metrics and insights for Eternal Capsule
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-granite-copper"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Monthly Revenue"
          value={formatCurrency(metrics.revenue.monthly)}
          change={metrics.revenue.growth}
          trend="up"
          icon="💰"
        />
        
        <MetricCard
          title="Active Subscriptions"
          value={metrics.subscriptions.active.toString()}
          change={((metrics.subscriptions.new / metrics.subscriptions.total) * 100)}
          trend="up"
          icon="👥"
        />
        
        <MetricCard
          title="Total Memorials"
          value={metrics.usage.totalMemorials.toString()}
          change={((metrics.usage.memorialsThisMonth / metrics.usage.totalMemorials) * 100)}
          trend="up"
          icon="🕊️"
        />
        
        <MetricCard
          title="System Uptime"
          value={`${metrics.performance.uptime.toFixed(2)}%`}
          change={0}
          trend="stable"
          icon="📊"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <ChartCard title="Revenue Trend" icon="📈">
          <RevenueChart timeRange={timeRange} />
        </ChartCard>

        {/* Subscription Growth */}
        <ChartCard title="Subscription Growth" icon="📊">
          <SubscriptionChart timeRange={timeRange} />
        </ChartCard>

        {/* Memorial Activity */}
        <ChartCard title="Memorial Activity" icon="🕊️">
          <MemorialActivityChart timeRange={timeRange} />
        </ChartCard>

        {/* Performance Metrics */}
        <ChartCard title="Performance Metrics" icon="⚡">
          <PerformanceChart metrics={metrics.performance} />
        </ChartCard>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Funeral Homes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🏢 Top Funeral Homes
          </h3>
          <TopFuneralHomesTable />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🔔 Recent Activity
          </h3>
          <RecentActivityFeed />
        </div>
      </div>

      {/* Support Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🎧 Support Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-granite-copper">
              {metrics.support.totalTickets}
            </div>
            <div className="text-gray-600 text-sm">Total Tickets</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {metrics.support.openTickets}
            </div>
            <div className="text-gray-600 text-sm">Open Tickets</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {metrics.support.avgResponseTime}h
            </div>
            <div className="text-gray-600 text-sm">Avg Response</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {metrics.support.satisfaction}%
            </div>
            <div className="text-gray-600 text-sm">Satisfaction</div>
          </div>
        </div>
      </div>

      {/* Performance Monitor */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          ⚡ Real-time Performance
        </h3>
        <PerformanceMonitor />
      </div>
    </div>
  );
}

// Helper Components

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: string;
}

function MetricCard({ title, value, change, trend, icon }: MetricCardProps) {
  const trendColor = {
    up: 'text-green-600',
    down: 'text-red-600',
    stable: 'text-gray-600'
  }[trend];

  const trendIcon = {
    up: '↗️',
    down: '↘️',
    stable: '→'
  }[trend];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change !== 0 && (
            <p className={`text-sm mt-1 ${trendColor}`}>
              {trendIcon} {Math.abs(change).toFixed(1)}%
            </p>
          )}
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  );
}

interface ChartCardProps {
  title: string;
  icon: string;
  children: React.ReactNode;
}

function ChartCard({ title, icon, children }: ChartCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <span className="text-xl mr-2">{icon}</span>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function RevenueChart({ timeRange }: { timeRange: string }) {
  return (
    <div className="h-64 flex items-center justify-center text-gray-500">
      Revenue chart for {timeRange} would go here
      {/* Replace with actual chart library implementation */}
    </div>
  );
}

function SubscriptionChart({ timeRange }: { timeRange: string }) {
  return (
    <div className="h-64 flex items-center justify-center text-gray-500">
      Subscription chart for {timeRange} would go here
      {/* Replace with actual chart library implementation */}
    </div>
  );
}

function MemorialActivityChart({ timeRange }: { timeRange: string }) {
  return (
    <div className="h-64 flex items-center justify-center text-gray-500">
      Memorial activity chart for {timeRange} would go here
      {/* Replace with actual chart library implementation */}
    </div>
  );
}

function PerformanceChart({ metrics }: { metrics: BusinessMetrics['performance'] }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Avg Load Time</span>
        <span className="font-medium">{metrics.avgLoadTime}ms</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">First Contentful Paint</span>
        <span className="font-medium">{metrics.coreWebVitals.fcp}ms</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Largest Contentful Paint</span>
        <span className="font-medium">{metrics.coreWebVitals.lcp}ms</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Cumulative Layout Shift</span>
        <span className="font-medium">{metrics.coreWebVitals.cls}</span>
      </div>
    </div>
  );
}

function TopFuneralHomesTable() {
  const mockData = [
    { name: 'Sunset Memorial Services', memorials: 45, revenue: 2450 },
    { name: 'Peaceful Rest Funeral Home', memorials: 32, revenue: 1890 },
    { name: 'Garden of Memories', memorials: 28, revenue: 1650 },
    { name: 'Eternal Gardens Funeral Home', memorials: 24, revenue: 1420 },
  ];

  return (
    <div className="space-y-3">
      {mockData.map((home, index) => (
        <div key={home.name} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
          <div className="flex items-center">
            <div className="bg-granite-copper text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3">
              {index + 1}
            </div>
            <div>
              <div className="font-medium text-gray-900">{home.name}</div>
              <div className="text-sm text-gray-600">{home.memorials} memorials</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium text-granite-copper">
              {formatCurrency(home.revenue)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentActivityFeed() {
  const mockActivities = [
    { type: 'memorial_created', text: 'New memorial created for John Smith', time: '2 min ago' },
    { type: 'subscription', text: 'Sunset Memorial upgraded to Professional', time: '15 min ago' },
    { type: 'guestbook', text: '5 new guestbook entries added', time: '32 min ago' },
    { type: 'payment', text: 'Payment received from Garden of Memories', time: '1 hour ago' },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'memorial_created': return '🕊️';
      case 'subscription': return '⬆️';
      case 'guestbook': return '💬';
      case 'payment': return '💳';
      default: return '📝';
    }
  };

  return (
    <div className="space-y-3">
      {mockActivities.map((activity, index) => (
        <div key={index} className="flex items-start space-x-3 py-2">
          <span className="text-lg">{getIcon(activity.type)}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900">{activity.text}</p>
            <p className="text-xs text-gray-500">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Utility Functions
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
} 