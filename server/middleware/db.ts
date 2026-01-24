import { connectDB } from '../utils/db'

export default defineEventHandler(async (event) => {
  // Only apply to API routes
  if (event.path.startsWith('/api/')) {
    try {
      await connectDB()
    } catch (e: any) {
      console.error('[DB Middleware] Error:', e.message)
      throw createError({
        statusCode: 503,
        statusMessage: 'Service Unavailable: Database connection failed. ' + e.message
      })
    }
  }
})
