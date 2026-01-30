import { c as defineEventHandler, k as getQuery, e as createError } from '../../../../_/nitro.mjs';
import { R as Room } from '../../../../_/Room.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import 'node:url';

const status_get = defineEventHandler(async (event) => {
  var _a;
  const roomId = (_a = event.context.params) == null ? void 0 : _a.id;
  const query = getQuery(event);
  const userId = query.userId;
  if (roomId && userId) {
    Room.updateOne(
      { _id: roomId, "players.userId": userId },
      { $set: { "players.$.lastSeen": /* @__PURE__ */ new Date() } }
    ).exec().catch(console.error);
  }
  const room = await Room.findById(roomId).populate("map");
  if (!room) {
    throw createError({ statusCode: 404, statusMessage: "Room not found" });
  }
  return {
    room: {
      _id: room._id,
      title: room.title,
      status: room.status,
      maxPlayers: room.maxPlayers,
      players: room.players,
      hostId: room.hostId,
      map: room.map
      // Will be null until generated
    }
  };
});

export { status_get as default };
//# sourceMappingURL=status.get.mjs.map
