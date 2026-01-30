import { Room } from '~/server/models/Room'

export default defineEventHandler(async (event) => {
  const roomId = event.context.params?.id
  const query = getQuery(event)
  const userId = query.userId as string

  // Update lastSeen if userId provided
  if (roomId && userId) {
    // We can maximize performance by not waiting for this write
    Room.updateOne(
      { _id: roomId, 'players.userId': userId },
      { $set: { 'players.$.lastSeen': new Date() } }
    ).exec().catch(console.error)
  }

  const room = await Room.findById(roomId)
    .populate('map') // Populate map if game started

  if (!room) {
    throw createError({ statusCode: 404, statusMessage: 'Room not found' })
  }

  // Cleanup inactive players (timeout > 15s)
  // Only host should do this? Or automatic?
  // For now, simpler is better: return room state

  return {
    room: {
      _id: room._id,
      title: room.title,
      status: room.status,
      maxPlayers: room.maxPlayers,
      players: room.players,
      hostId: room.hostId,
      map: room.map // Will be null until generated
    }
  }
})
