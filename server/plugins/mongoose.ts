import mongoose from 'mongoose'

export default defineNitroPlugin(async (nitroApp) => {
  const config = useRuntimeConfig()

  try {
    if (!config.mongodbUri) {
      throw new Error('MONGODB_URI is not defined in runtime config')
    }
    await mongoose.connect(config.mongodbUri as string)
    console.log('Connected to MongoDB')
  } catch (e) {
    console.error('Error connecting to MongoDB: ', e)
  }
})
