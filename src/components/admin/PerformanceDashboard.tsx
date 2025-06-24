'use client'

import React, { useState, useEffect } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: string;
  timeToInteractive: number;
}

interface PerformanceData {
  totalSessions: number;
  averageMetrics: PerformanceMetrics | null;
  recentSessions: any[];
}

interface InteractionData {
  totalInteractions: number;
  recentInteractions: any[];
  topElements: { element: string; count: number }[];
  topActions: { action: string; count: number }[];
}

export default function PerformanceDashboard() {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [interactionData, setInteractionData] = useState<InteractionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      const [perfResponse, interactionResponse] = await Promise.all([
        fetch('/api/analytics/performance'),
        fetch('/api/analytics/interaction'),
      ]);

      if (perfResponse.ok) {
        const perfData = await perfResponse.json();
        setPerformanceData(perfData);
      }

      if (interactionResponse.ok) {
        const intData = await interactionResponse.json();
        setInteractionData(intData);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getPerformanceScore = (metrics: PerformanceMetrics | null) => {
    if (!metrics) return 'N/A';
    
    let score = 100;
    
    // Deduct points based on Core Web Vitals thresholds
    if (metrics.firstContentfulPaint > 2500) score -= 20;
    if (metrics.largestContentfulPaint > 2500) score -= 20;
    if (parseFloat(metrics.cumulativeLayoutShift) > 0.1) score -= 20;
    if (metrics.timeToInteractive > 3800) score -= 20;
    if (metrics.loadTime > 3000) score -= 20;
    
    return Math.max(score, 0);
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const performanceScore = getPerformanceScore(performanceData?.averageMetrics || null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Performance Analytics
        </h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
          {lastUpdated && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-2">Performance Score</h3>
          <div className={`text-3xl font-bold ${
            typeof performanceScore === 'number' && performanceScore >= 90 
              ? 'text-green-600' 
              : typeof performanceScore === 'number' && performanceScore >= 70 
                ? 'text-yellow-600' 
                : 'text-red-600'
          }`}>
            {performanceScore}
            {typeof performanceScore === 'number' && '/100'}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-2">Total Sessions</h3>
          <div className="text-3xl font-bold text-blue-600">
            {performanceData?.totalSessions || 0}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-2">Total Interactions</h3>
          <div className="text-3xl font-bold text-purple-600">
            {interactionData?.totalInteractions || 0}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-2">Avg Load Time</h3>
          <div className="text-3xl font-bold text-orange-600">
            {performanceData?.averageMetrics 
              ? formatTime(performanceData.averageMetrics.loadTime)
              : 'N/A'
            }
          </div>
        </div>
      </div>

      {/* Core Web Vitals */}
      {performanceData?.averageMetrics && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold mb-4">Core Web Vitals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                First Contentful Paint
              </div>
              <div className="text-xl font-bold">
                {formatTime(performanceData.averageMetrics.firstContentfulPaint)}
              </div>
              <div className="text-xs text-gray-400">Good: &lt; 2.5s</div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Largest Contentful Paint
              </div>
              <div className="text-xl font-bold">
                {formatTime(performanceData.averageMetrics.largestContentfulPaint)}
              </div>
              <div className="text-xs text-gray-400">Good: &lt; 2.5s</div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Cumulative Layout Shift
              </div>
              <div className="text-xl font-bold">
                {performanceData.averageMetrics.cumulativeLayoutShift}
              </div>
              <div className="text-xs text-gray-400">Good: &lt; 0.1</div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Time to Interactive
              </div>
              <div className="text-xl font-bold">
                {formatTime(performanceData.averageMetrics.timeToInteractive)}
              </div>
              <div className="text-xs text-gray-400">Good: &lt; 3.8s</div>
            </div>
          </div>
        </div>
      )}

      {/* Top Interactions */}
      {interactionData && interactionData.topElements.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold mb-4">Most Clicked Elements</h3>
          <div className="space-y-3">
            {interactionData.topElements.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="font-medium">{item.element}</span>
                <span className="text-blue-600 font-bold">{item.count} clicks</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      {performanceData && performanceData.recentSessions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Sessions</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  <th className="pb-2">Memorial ID</th>
                  <th className="pb-2">Load Time</th>
                  <th className="pb-2">FCP</th>
                  <th className="pb-2">LCP</th>
                  <th className="pb-2">Connection</th>
                  <th className="pb-2">Time</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {performanceData.recentSessions.slice(0, 10).map((session: any, index) => (
                  <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="py-2 font-mono text-xs">
                      {session.memorialId.slice(-8)}
                    </td>
                    <td className="py-2">{formatTime(session.metrics.loadTime)}</td>
                    <td className="py-2">{formatTime(session.metrics.firstContentfulPaint)}</td>
                    <td className="py-2">{formatTime(session.metrics.largestContentfulPaint)}</td>
                    <td className="py-2">{session.connectionType}</td>
                    <td className="py-2">
                      {new Date(session.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Data State */}
      {(!performanceData || performanceData.totalSessions === 0) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Performance Data Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Visit some memorial pages to start collecting performance metrics.
          </p>
          <a 
            href="/memorial/explore"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Explore Memorials
          </a>
        </div>
      )}
    </div>
  );
} 