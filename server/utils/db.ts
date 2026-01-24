import mongoose from 'mongoose'

// Disable buffering to prevent hangs in serverless environments
mongoose.set('bufferCommands', false);

let cachedPromise: Promise<typeof mongoose> | null = null

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  if (!cachedPromise) {
    const config = useRuntimeConfig()
    const uri = config.mongodbUri as string

    if (!uri) {
      throw new Error('MONGODB_URI is not defined in runtime config')
    }

    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    }

    console.log('[DB] Connecting to MongoDB...')
    cachedPromise = mongoose.connect(uri, opts as any).then((m) => {
      console.log('[DB] Connected')
      return m
    }).catch(err => {
      cachedPromise = null
      console.error('[DB] Error:', err.message)
      throw err
    })
  }

  try {
    await cachedPromise
    return mongoose.connection
  } catch (e) {
    cachedPromise = null
    throw e
  }
}
