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

const clear_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { roomId, matchId, userId } = body;
  const id = roomId || matchId;
  if (!id || !userId) {
    throw createError({ statusCode: 400, statusMessage: "Missing roomId or userId" });
  }
  const result = await Room.updateOne(
    { _id: id, "players.userId": userId },
    {
      $inc: { "players.$.clearCount": 1 },
      $set: { "players.$.lastSeen": /* @__PURE__ */ new Date() }
    }
  );
  if (result.matchedCount === 0) {
    throw createError({ statusCode: 404, statusMessage: "Room or Player not found" });
  }
  console.log(`[Clear] Player ${userId} win recorded in room ${id}`);
  return { success: true };
});

export { clear_post as default };
//# sourceMappingURL=clear.post.mjs.map
