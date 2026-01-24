import { connectDB } from '../utils/db'

export default defineNitroPlugin(async (nitroApp) => {
  try {
    await connectDB()
  } catch (e) {
    console.error('[Nitro Plugin] DB Init Error:', e)
  }
})
