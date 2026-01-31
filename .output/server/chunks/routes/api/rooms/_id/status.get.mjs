import { c as defineEventHandler, m as getQuery, e as createError } from '../../../../_/nitro.mjs';
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
  const room = await Room.findById(roomId);
  if (!room) {
    throw createError({ statusCode: 404, statusMessage: "Room not found" });
  }
  const roundNum = (num, precision = 1) => {
    if (typeof num !== "number" || isNaN(num)) return 0;
    const factor = Math.pow(10, precision);
    return Math.round(num * factor) / factor;
  };
  const optimizeObstacles = (obs) => {
    if (!Array.isArray(obs)) return [];
    return obs.map((o) => ({
      ...o,
      x: roundNum(o.x),
      y: roundNum(o.y),
      width: roundNum(o.width),
      height: roundNum(o.height)
    }));
  };
  let optimizedMap = room.map;
  if (optimizedMap && optimizedMap.engineObstacles && !optimizedMap._alreadyOptimized) {
    optimizedMap.engineObstacles = optimizeObstacles(optimizedMap.engineObstacles);
    optimizedMap.enginePortals = optimizeObstacles(optimizedMap.enginePortals);
    optimizedMap._alreadyOptimized = true;
  }
  return {
    room: {
      _id: room._id,
      title: room.title,
      status: room.status,
      maxPlayers: room.maxPlayers,
      players: room.players,
      hostId: room.hostId,
      map: optimizedMap,
      duration: room.duration,
      startedAt: room.startedAt,
      messages: room.messages
    }
  };
});

export { status_get as default };
//# sourceMappingURL=status.get.mjs.map
