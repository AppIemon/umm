import { Room } from '~/server/models/Room'

export default defineEventHandler(async (event) => {
  const roomId = event.context.params?.id
  const body = await readBody(event)
  const { userId } = body

  if (!roomId || !userId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing fields' })
  }

  const room = await Room.findById(roomId);

  // 1. Transaction-like update: Pull player
  // If the game is already finished or playing, we might want to handle it differently?
  // But generally, leaving means removing from list.

  const result = await Room.findOneAndUpdate(
    { _id: roomId, 'players.userId': userId },
    { $pull: { players: { userId: userId } } },
    { new: true }
  )

  if (!result) return { success: true } // Already gone or not in room

  // 2. Room Cleanup Logic
  // If no players left -> DELETE ROOM
  if (result.players.length === 0) {
    console.log(`[Room] Empty room ${roomId} deleted.`);
    await Room.deleteOne({ _id: roomId })
  } else {
    // If players remain...

    // A. If ONLY offline/disconnected players remain? (Optional advanced check)
    // For now, we trust the client 'leave' call. 
    // Ideally we should have a cron/interval to clean up rooms where 'players' are all stale.
    // But per user request: "When all players leave... room auto delete" - satisfied by length === 0.

    // B. Host Migration (If host left)
    if (result.hostId === userId) {
      const newHost = result.players[0]
      console.log(`[Room] Host migration in ${roomId}: ${userId} -> ${newHost.userId}`);

      // If the game status is 'finished', maybe we should just reset to 'waiting'?
      // Or if the game is 'playing', do we stop it? for now keep playing.

      const updateData: any = {
        hostId: newHost.userId,
        'players.0.isHost': true
      };

      // OPTIONAL: If game was finished, reset to lobby for remaining players? 
      // User request: "After multiplayer end, return to lobby -> Delete room"
      // This implies if everyone returns to lobby and then leaves, it deletes.
      // If some people are in lobby (finished), they are still in room.

      await Room.updateOne(
        { _id: roomId },
        { $set: updateData }
      )
    }
  }

  return { success: true }
})
