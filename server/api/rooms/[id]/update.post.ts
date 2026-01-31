import { Room } from '~/server/models/Room'

export default defineEventHandler(async (event) => {
  const roomId = event.context.params?.id
  const body = await readBody(event)
  const { userId, progress, y, isReady, isDead } = body

  // We optimize this by using updateOne instead of find+save
  const updateData: any = {
    'players.$.lastSeen': new Date()
  }

  if (progress !== undefined) {
    updateData['players.$.progress'] = progress;
    // We can't conditionally set maxProgress based on value in a single updateOne without pipeline or finding first.
    // However, Mongo's $max operator is perfect for this! 
    // Wait, updateOne with $set AND $max on same doc works fine.
    // players.$.maxProgress vs progress.
  }
  if (y !== undefined) updateData['players.$.y'] = y
  if (isReady !== undefined) updateData['players.$.isReady'] = isReady

  const updateOp: any = { $set: updateData };
  if (progress !== undefined) {
    // Use $max for maxProgress
    updateOp['$max'] = { 'players.$.maxProgress': progress };
  }

  await Room.updateOne(
    { _id: roomId, 'players.userId': userId },
    updateOp
  )

  return { success: true }
})
