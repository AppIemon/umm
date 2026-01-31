import { c as defineEventHandler, r as readBody, e as createError } from '../../../../_/nitro.mjs';
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

const chat_post = defineEventHandler(async (event) => {
  var _a;
  const roomId = (_a = event.context.params) == null ? void 0 : _a.id;
  const body = await readBody(event);
  const { userId, username, text } = body;
  if (!roomId || !userId || !text) {
    throw createError({ statusCode: 400, statusMessage: "Missing fields" });
  }
  const msg = {
    userId,
    username,
    text,
    timestamp: /* @__PURE__ */ new Date()
  };
  await Room.updateOne(
    { _id: roomId },
    {
      $push: {
        messages: {
          $each: [msg],
          $slice: -50
          // Keep last 50
        }
      }
    }
  );
  return { success: true };
});

export { chat_post as default };
//# sourceMappingURL=chat.post.mjs.map
