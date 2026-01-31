import { Room } from '~/server/models/Room'

export default defineEventHandler(async (event) => {
  // Run cleanup for all rooms
  // 1. Delete rooms with 0 players (redundant check)
  // 2. Delete rooms where all players are 'stale' (lastSeen > 30s ago)

  const staleThreshold = new Date(Date.now() - 30 * 1000); // 30 seconds

  // Find rooms where ALL players are stale OR empty
  // Actually, standard keep-alive is 1s, so 30s is very safe.

  // A. Delete logically empty rooms (should be handled by leave, but safe fallback)
  await Room.deleteMany({ players: { $size: 0 } });

  // B. Clean stale participants
  // This is tricky in Mongo. easier to fetch active rooms and check in memory if scaling allows, 
  // or use sophisticated query.
  // For now, let's just use this endpoint as a "Global Cleanup" triggered by lobby refresh or similar.
  // Or better, trigger it on Lobby Refresh.

  const rooms = await Room.find({});
  let deletedCount = 0;

  for (const room of rooms) {
    const activePlayers = room.players.filter((p: any) => new Date(p.lastSeen) > staleThreshold);

    if (activePlayers.length === 0) {
      await Room.deleteOne({ _id: room._id });
      deletedCount++;
    } else if (activePlayers.length < room.players.length) {
      // Some players timed out? Remove them.
      // If host timed out, migrate.

      const newHostId = activePlayers.find((p: any) => p.isHost)?.userId
        || activePlayers[0]?.userId;

      await Room.updateOne(
        { _id: room._id },
        {
          $set: {
            players: activePlayers,
            hostId: newHostId
          }
        }
      );
    }
  }

  return { deleted: deletedCount };
})
