import mongoose from 'mongoose'

// Explicitly disable buffering globally to prevent 10s hangs in serverless
mongoose.set('bufferCommands', false);

/**
 * Caching connection for serverless longevity
 */
let cachedPromise: Promise<typeof mongoose> | null = null

export default defineNitroPlugin(async (nitroApp) => {
  const config = useRuntimeConfig()

  if (mongoose.connection.readyState === 1) {
    return
  }

  if (!cachedPromise) {
    const uri = config.mongodbUri as string
    if (!uri) {
      console.error('[Nitro] DB ERROR: MONGODB_URI is empty')
      return
    }

    const opts = {
      bufferCommands: false, // Disable buffering to catch connection issues early
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    }

    cachedPromise = mongoose.connect(uri, opts as any).then((m) => {
      console.log('[Nitro] Successfully connected to MongoDB Atlas')
      return m
    }).catch(err => {
      cachedPromise = null // Reset on error
      console.error('[Nitro] DB Connection Error:', err.message)
      throw err
    })
  }

  try {
    await cachedPromise
  } catch (e) {
    // Already logged above
  }
})
