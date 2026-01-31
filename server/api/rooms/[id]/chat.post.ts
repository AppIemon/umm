import { Room } from '~/server/models/Room'

export default defineEventHandler(async (event) => {
  const roomId = event.context.params?.id
  const body = await readBody(event)
  const { userId, username, text } = body

  if (!roomId || !userId || !text) {
    throw createError({ statusCode: 400, statusMessage: 'Missing fields' })
  }

  const msg = {
    userId,
    username,
    text,
    timestamp: new Date()
  }

  // Atomic update: push message and slice in one go (if possible) or just push
  await Room.updateOne(
    { _id: roomId },
    {
      $push: {
        messages: {
          $each: [msg],
          $slice: -50 // Keep last 50
        }
      }
    }
  )

  return { success: true }
})
