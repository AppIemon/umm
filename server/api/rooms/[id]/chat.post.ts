import { Room } from '~/server/models/Room'

export default defineEventHandler(async (event) => {
  const roomId = event.context.params?.id
  const body = await readBody(event)
  const { userId, username, text } = body

  if (!userId || !text) {
    throw createError({ statusCode: 400, statusMessage: 'Missing fields' })
  }

  const room = await Room.findById(roomId)
  if (!room) throw createError({ statusCode: 404, statusMessage: 'Room not found' })

  const msg = {
    userId,
    username,
    text,
    timestamp: new Date()
  }

  room.messages.push(msg)

  // Keep only last 50 messages
  if (room.messages.length > 50) {
    room.messages = room.messages.slice(room.messages.length - 50)
  }

  await room.save()

  return { success: true }
})
