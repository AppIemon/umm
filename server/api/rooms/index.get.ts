import { Room } from '~/server/models/Room'

export default defineEventHandler(async (event) => {
  // List all waiting rooms
  // Only recent rooms (active in last 30s?) -> Room model expires in 1h, but we only want 'waiting' status
  // Also clean up ghost rooms where host left?

  const rooms = await Room.find({ status: 'waiting' })
    .select('title maxPlayers players duration createdAt')
    .sort({ createdAt: -1 })
    .limit(20)

  return {
    rooms: rooms.map(r => ({
      _id: r._id,
      title: r.title,
      currentPlayers: r.players.length,
      maxPlayers: r.maxPlayers,
      duration: r.duration,
      host: r.players.find((p: any) => p.isHost)?.username || 'Unknown'
    }))
  }
})
