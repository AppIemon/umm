import { c as defineEventHandler } from '../../../_/nitro.mjs';
import { R as Room } from '../../../_/Room.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import 'node:url';

const cleanup_get = defineEventHandler(async (event) => {
  var _a, _b;
  const staleThreshold = new Date(Date.now() - 30 * 1e3);
  await Room.deleteMany({ players: { $size: 0 } });
  const rooms = await Room.find({});
  let deletedCount = 0;
  for (const room of rooms) {
    const activePlayers = room.players.filter((p) => new Date(p.lastSeen) > staleThreshold);
    if (activePlayers.length === 0) {
      await Room.deleteOne({ _id: room._id });
      deletedCount++;
    } else if (activePlayers.length < room.players.length) {
      const newHostId = ((_a = activePlayers.find((p) => p.isHost)) == null ? void 0 : _a.userId) || ((_b = activePlayers[0]) == null ? void 0 : _b.userId);
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
});

export { cleanup_get as default };
//# sourceMappingURL=cleanup.get.mjs.map
