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

const leave_post = defineEventHandler(async (event) => {
  var _a;
  const roomId = (_a = event.context.params) == null ? void 0 : _a.id;
  const body = await readBody(event);
  const { userId } = body;
  if (!roomId || !userId) {
    throw createError({ statusCode: 400, statusMessage: "Missing fields" });
  }
  await Room.findById(roomId);
  const result = await Room.findOneAndUpdate(
    { _id: roomId, "players.userId": userId },
    { $pull: { players: { userId } } },
    { new: true }
  );
  if (!result) return { success: true };
  if (result.players.length === 0) {
    console.log(`[Room] Empty room ${roomId} deleted.`);
    await Room.deleteOne({ _id: roomId });
  } else {
    if (result.hostId === userId) {
      const newHost = result.players[0];
      console.log(`[Room] Host migration in ${roomId}: ${userId} -> ${newHost.userId}`);
      const updateData = {
        hostId: newHost.userId,
        "players.0.isHost": true
      };
      await Room.updateOne(
        { _id: roomId },
        { $set: updateData }
      );
    }
  }
  return { success: true };
});

export { leave_post as default };
//# sourceMappingURL=leave.post.mjs.map
