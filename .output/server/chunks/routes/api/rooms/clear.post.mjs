import { c as defineEventHandler, r as readBody, f as createError } from '../../../_/nitro.mjs';
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

const clear_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { matchId, userId } = body;
  if (!matchId || !userId) {
    throw createError({ statusCode: 400, statusMessage: "Missing matchId (roomId) or userId" });
  }
  const room = await Room.findById(matchId);
  if (!room) {
    throw createError({ statusCode: 404, statusMessage: "Room not found" });
  }
  const player = room.players.find((p) => p.userId === userId);
  if (!player) {
    throw createError({ statusCode: 404, statusMessage: "Player not found in room" });
  }
  player.clearCount = (player.clearCount || 0) + 1;
  player.lastSeen = /* @__PURE__ */ new Date();
  await room.save();
  return { success: true, clearCount: player.clearCount };
});

export { clear_post as default };
//# sourceMappingURL=clear.post.mjs.map
