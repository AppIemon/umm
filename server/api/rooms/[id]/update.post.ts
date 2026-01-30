import { Room } from '~/server/models/Room'

export default defineEventHandler(async (event) => {
  const roomId = event.context.params?.id
  const body = await readBody(event)
  const { userId, progress, y, isReady, isDead } = body

  // We optimize this by using updateOne instead of find+save
  const updateData: any = {
    'players.$.lastSeen': new Date()
  }

  if (progress !== undefined) updateData['players.$.progress'] = progress
  if (y !== undefined) updateData['players.$.y'] = y
  if (isReady !== undefined) updateData['players.$.isReady'] = isReady

  await Room.updateOne(
    { _id: roomId, 'players.userId': userId },
    { $set: updateData }
  )

  return { success: true }
})
