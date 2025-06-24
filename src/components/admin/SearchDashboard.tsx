'use client';

import { useState, useEffect } from 'react';

interface SearchAnalytics {
  overview: {
    totalSearches: number;
    uniqueUsers: number;
    avgResultsPerSearch: number;
    zeroResultRate: number;
    dailyTrend: { date: string; searches: number }[];
  };
  popular: {
    queries: {
      query: string;
      count: number;
      avgResults: number;
    }[];
  };
  trends: {
    hourlyTrend: { hour: string; searches: number }[];
    trendingTerms: { term: string; count: number }[];
  };
  performance: {
    avgExecutionTime: number;
    performanceBuckets: {
      fast: number;
      medium: number;
      slow: number;
      verySlow: number;
    };
    avgQueryLength: number;
    totalQueries: number;
  };
}

export default function SearchDashboard() {
  const [analytics, setAnalytics] = useState<SearchAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [overview, popular, trends, performance] = await Promise.all([
        fetch(`/api/analytics/search?period=${period}&type=overview`).then(r => r.json()),
        fetch(`/api/analytics/search?period=${period}&type=popular`).then(r => r.json()),
        fetch(`/api/analytics/search?period=${period}&type=trends`).then(r => r.json()),
        fetch(`/api/analytics/search?period=${period}&type=performance`).then(r => r.json())
      ]);

      setAnalytics({ overview, popular, trends, performance });
    } catch (error) {
      console.error('Failed to fetch search analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-granite-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-granite-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-granite-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-granite-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-granite-200 p-6">
        <p className="text-granite-600">Unable to load search analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-granite-900">Search Analytics</h2>
        <div className="flex items-center space-x-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-granite-300 rounded-lg focus:ring-2 focus:ring-copper-500 focus:border-copper-500"
          >
            <option value="1">Last 24 hours</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-copper-600 text-white rounded-lg hover:bg-copper-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Total Searches"
          value={analytics.overview.totalSearches.toLocaleString()}
          icon="🔍"
          trend="+12%"
        />
        <MetricCard
          title="Unique Users"
          value={analytics.overview.uniqueUsers.toLocaleString()}
          icon="👥"
          trend="+8%"
        />
        <MetricCard
          title="Avg Results"
          value={analytics.overview.avgResultsPerSearch.toString()}
          icon="📊"
          trend="+5%"
        />
        <MetricCard
          title="Zero Results"
          value={`${analytics.overview.zeroResultRate}%`}
          icon="🚫"
          trend="-3%"
          trendPositive={false}
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-granite-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'popular', label: 'Popular Searches' },
            { id: 'trends', label: 'Trends' },
            { id: 'performance', label: 'Performance' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-copper-500 text-copper-600'
                  : 'border-transparent text-granite-500 hover:text-granite-700 hover:border-granite-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-granite-200 p-6">
        {activeTab === 'overview' && (
          <OverviewTab analytics={analytics.overview} />
        )}
        {activeTab === 'popular' && (
          <PopularSearchesTab analytics={analytics.popular} />
        )}
        {activeTab === 'trends' && (
          <TrendsTab analytics={analytics.trends} />
        )}
        {activeTab === 'performance' && (
          <PerformanceTab analytics={analytics.performance} />
        )}
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: string;
  trend?: string;
  trendPositive?: boolean;
}

function MetricCard({ title, value, icon, trend, trendPositive = true }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-granite-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-granite-600">{title}</p>
          <p className="text-2xl font-bold text-granite-900">{value}</p>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
      {trend && (
        <div className="mt-2">
          <span className={`text-sm font-medium ${
            trendPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend}
          </span>
          <span className="text-sm text-granite-500"> vs previous period</span>
        </div>
      )}
    </div>
  );
}

function OverviewTab({ analytics }: { analytics: SearchAnalytics['overview'] }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-granite-900">Search Volume Trend</h3>
      
      {analytics.dailyTrend.length > 0 ? (
        <div className="space-y-4">
          <div className="h-64 bg-granite-50 rounded-lg flex items-end justify-center p-4">
            <div className="flex items-end space-x-2 h-full w-full">
              {analytics.dailyTrend.map((day, index) => {
                const maxSearches = Math.max(...analytics.dailyTrend.map(d => d.searches));
                const height = (day.searches / maxSearches) * 100;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-copper-500 rounded-t-sm transition-all hover:bg-copper-600"
                      style={{ height: `${height}%`, minHeight: '4px' }}
                      title={`${day.date}: ${day.searches} searches`}
                    />
                    <span className="text-xs text-granite-500 mt-2 transform -rotate-45 origin-left">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="text-center text-sm text-granite-600">
            Daily search volume over the last {analytics.dailyTrend.length} days
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-granite-500">
          No search data available for this period
        </div>
      )}
    </div>
  );
}

function PopularSearchesTab({ analytics }: { analytics: SearchAnalytics['popular'] }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-granite-900">Most Popular Search Queries</h3>
      
      {analytics.queries.length > 0 ? (
        <div className="space-y-2">
          {analytics.queries.map((query, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-granite-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="flex items-center justify-center w-6 h-6 bg-copper-100 text-copper-700 rounded-full text-sm font-medium">
                  {index + 1}
                </span>
                <span className="font-medium text-granite-900">"{query.query}"</span>
              </div>
              <div className="flex items-center space-x-6 text-sm text-granite-600">
                <span>{query.count} searches</span>
                <span>{query.avgResults} avg results</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-granite-500">
          No search queries found for this period
        </div>
      )}
    </div>
  );
}

function TrendsTab({ analytics }: { analytics: SearchAnalytics['trends'] }) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-granite-900 mb-4">Trending Search Terms</h3>
        {analytics.trendingTerms.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {analytics.trendingTerms.map((term, index) => (
              <div key={index} className="bg-gradient-to-r from-copper-100 to-copper-50 rounded-lg p-3 text-center">
                <div className="font-semibold text-copper-700">{term.term}</div>
                <div className="text-xs text-copper-600">{term.count} mentions</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-granite-500">No trending terms found</div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-granite-900 mb-4">Hourly Search Pattern</h3>
        {analytics.hourlyTrend.length > 0 ? (
          <div className="text-center py-4 text-granite-500">
            Hourly trend visualization would go here
          </div>
        ) : (
          <div className="text-center py-4 text-granite-500">No hourly data available</div>
        )}
      </div>
    </div>
  );
}

function PerformanceTab({ analytics }: { analytics: SearchAnalytics['performance'] }) {
  const total = Object.values(analytics.performanceBuckets).reduce((sum, count) => sum + count, 0);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-granite-900 mb-4">Performance Distribution</h3>
          <div className="space-y-3">
            {Object.entries(analytics.performanceBuckets).map(([bucket, count]) => {
              const percentage = total > 0 ? (count / total) * 100 : 0;
              const labels = {
                fast: 'Fast (< 100ms)',
                medium: 'Medium (100-500ms)',
                slow: 'Slow (500ms-1s)',
                verySlow: 'Very Slow (> 1s)'
              };
              const colors = {
                fast: 'bg-green-500',
                medium: 'bg-yellow-500',
                slow: 'bg-orange-500',
                verySlow: 'bg-red-500'
              };
              
              return (
                <div key={bucket} className="flex items-center justify-between">
                  <span className="text-sm text-granite-700">{labels[bucket as keyof typeof labels]}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-granite-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${colors[bucket as keyof typeof colors]} transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-granite-600 w-12 text-right">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-granite-900 mb-4">Key Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-granite-700">Average Execution Time</span>
              <span className="font-semibold text-granite-900">{analytics.avgExecutionTime}ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-granite-700">Average Query Length</span>
              <span className="font-semibold text-granite-900">{analytics.avgQueryLength} chars</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-granite-700">Total Queries Analyzed</span>
              <span className="font-semibold text-granite-900">{analytics.totalQueries.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 