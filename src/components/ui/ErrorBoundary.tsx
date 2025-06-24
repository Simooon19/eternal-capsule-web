'use client'

import React from 'react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

const DefaultErrorFallback = ({ error, retry }: { error: Error; retry: () => void }) => (
  <div className="min-h-[200px] flex items-center justify-center">
    <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
      <div className="text-red-600 dark:text-red-400 mb-4">
        <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Something went wrong</h3>
      <p className="text-red-600 dark:text-red-400 text-sm mb-4">
        {process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred.'}
      </p>
      <button
        onClick={retry}
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
      >
        Try again
      </button>
    </div>
  </div>
)

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // console.error('Error caught by boundary:', error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return (
        <FallbackComponent
          error={this.state.error!}
          retry={() => this.setState({ hasError: false, error: null })}
        />
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary 