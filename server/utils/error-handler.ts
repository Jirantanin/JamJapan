export function handleApiError(error: unknown): never {
  console.error('[API Error]', error)

  // Re-throw if already an H3 error
  if (error && typeof error === 'object' && 'statusCode' in error) {
    throw error
  }

  throw createError({
    statusCode: 500,
    statusMessage: 'Internal server error',
  })
}
