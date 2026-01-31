import { c as defineEventHandler, r as readBody, e as createError } from '../../../_/nitro.mjs';
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

const nextMap_post = defineEventHandler(async (event) => {
  var _a;
  const body = await readBody(event);
  const { roomId, userId, mapIndex } = body;
  if (!roomId || !userId) {
    throw createError({ statusCode: 400, statusMessage: "Missing roomId or userId" });
  }
  const room = await Room.findById(roomId);
  if (!room) throw createError({ statusCode: 404, statusMessage: "Room not found" });
  if (mapIndex < (((_a = room.mapQueue) == null ? void 0 : _a.length) || 0)) {
    const map = room.mapQueue[mapIndex];
    return { map, mapIndex };
  }
  if (room.mapQueue && room.mapQueue.length > 0) {
    return { map: room.mapQueue[room.mapQueue.length - 1], mapIndex: room.mapQueue.length - 1 };
  }
  return { map: null, mapIndex };
});

export { nextMap_post as default };
//# sourceMappingURL=next-map.post.mjs.map
