export interface ApiError {
  message: string
  code?: string
  statusCode?: number
}

export class AppError extends Error {
  public readonly statusCode: number
  public readonly code?: string
  public readonly isOperational: boolean

  constructor(message: string, statusCode: number = 500, code?: string, isOperational: boolean = true) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = isOperational

    Error.captureStackTrace(this, this.constructor)
  }
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: 500
    }
  }

  return {
    message: 'An unexpected error occurred',
    statusCode: 500
  }
}

export const createApiResponse = <T>(
  data?: T,
  error?: ApiError,
  statusCode: number = 200
) => {
  if (error) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.statusCode || 500 }
    )
  }

  return Response.json(data, { status: statusCode })
}

// Client-side error handling
export const handleClientError = (error: unknown, fallbackMessage: string = 'Something went wrong'): string => {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return fallbackMessage
}

// Async operation wrapper with error handling
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  errorHandler?: (error: unknown) => void
): Promise<{ data?: T; error?: string }> => {
  try {
    const data = await operation()
    return { data }
  } catch (error) {
    const errorMessage = handleClientError(error)
    errorHandler?.(error)
    return { error: errorMessage }
  }
}

// Rate limiting helper
export const isRateLimited = (error: unknown): boolean => {
  return error instanceof AppError && error.statusCode === 429
}

// Network error helper
export const isNetworkError = (error: unknown): boolean => {
  return error instanceof Error && (
    error.message.includes('fetch') ||
    error.message.includes('network') ||
    error.message.includes('offline')
  )
} 