import { c as defineEventHandler, r as readBody, e as createError } from '../../../_/nitro.mjs';
import { R as Room } from '../../../_/Room.mjs';
import { U as User } from '../../../_/User.mjs';
import mongoose from 'mongoose';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const join_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { roomId, userId, username: passedUsername } = body;
  if (!roomId || !userId) {
    throw createError({ statusCode: 400, statusMessage: "Missing fields" });
  }
  const room = await Room.findById(roomId);
  if (!room) throw createError({ statusCode: 404, statusMessage: "Room not found" });
  if (room.status !== "waiting") throw createError({ statusCode: 403, statusMessage: "Game already started" });
  const existingPlayer = room.players.find((p) => p.userId === userId);
  if (existingPlayer) return { success: true, roomId: room._id };
  if (room.players.length >= room.maxPlayers) {
    throw createError({ statusCode: 403, statusMessage: "Room is full" });
  }
  const isValidId = mongoose.Types.ObjectId.isValid(userId);
  const user = isValidId ? await User.findById(userId) : null;
  const username = passedUsername || (user == null ? void 0 : user.displayName) || (user == null ? void 0 : user.username) || `Guest_${Math.floor(Math.random() * 1e3)}`;
  const result = await Room.updateOne(
    { _id: roomId, status: "waiting", "players.userId": { $ne: userId } },
    {
      $push: {
        players: {
          userId,
          username,
          isHost: false,
          isReady: false,
          progress: 0,
          y: 360,
          lastSeen: /* @__PURE__ */ new Date()
        }
      }
    }
  );
  if (result.matchedCount === 0) {
    const check = await Room.findById(roomId);
    if (!check) throw createError({ statusCode: 404, statusMessage: "Room disappeared" });
    if (check.status !== "waiting") throw createError({ statusCode: 403, statusMessage: "Game started" });
    if (check.players.length >= check.maxPlayers) throw createError({ statusCode: 403, statusMessage: "Full" });
    if (check.players.some((p) => p.userId === userId)) return { success: true, roomId: check._id };
  }
  return { success: true, roomId: room._id };
});

export { join_post as default };
//# sourceMappingURL=join.post.mjs.map
