import { c as defineEventHandler, r as readBody } from '../../../../_/nitro.mjs';
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

const update_post = defineEventHandler(async (event) => {
  var _a;
  const roomId = (_a = event.context.params) == null ? void 0 : _a.id;
  const body = await readBody(event);
  const { userId, progress, y, isReady, isDead } = body;
  const updateData = {
    "players.$.lastSeen": /* @__PURE__ */ new Date()
  };
  if (progress !== void 0) updateData["players.$.progress"] = progress;
  if (y !== void 0) updateData["players.$.y"] = y;
  if (isReady !== void 0) updateData["players.$.isReady"] = isReady;
  await Room.updateOne(
    { _id: roomId, "players.userId": userId },
    { $set: updateData }
  );
  return { success: true };
});

export { update_post as default };
//# sourceMappingURL=update.post.mjs.map
