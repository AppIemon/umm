import { Room } from '~/server/models/Room'

export default defineEventHandler(async (event) => {
  const roomId = event.context.params?.id
  const body = await readBody(event)
  const { userId } = body

  if (!roomId || !userId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing fields' })
  }

  // 1. Transaction-like update: Pull player
  const result = await Room.findOneAndUpdate(
    { _id: roomId, 'players.userId': userId },
    { $pull: { players: { userId: userId } } },
    { new: true }
  )

  if (!result) return { success: true } // Already gone or not in room

  // 2. Room Cleanup
  if (result.players.length === 0) {
    await Room.deleteOne({ _id: roomId })
  } else {
    // If we removed the host, we MUST assign a new one
    if (result.hostId === userId) {
      const newHost = result.players[0]
      await Room.updateOne(
        { _id: roomId },
        {
          $set: {
            hostId: newHost.userId,
            'players.0.isHost': true
          }
        }
      )
    }
  }

  return { success: true }
})
