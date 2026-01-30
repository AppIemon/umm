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

const create_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { title, maxPlayers, duration, userId, username: passedUsername } = body;
  if (!userId || !title) {
    throw createError({ statusCode: 400, statusMessage: "Missing required fields" });
  }
  const isValidId = mongoose.Types.ObjectId.isValid(userId);
  const user = isValidId ? await User.findById(userId) : null;
  const username = passedUsername || (user == null ? void 0 : user.displayName) || (user == null ? void 0 : user.username) || `Guest_${Math.floor(Math.random() * 1e3)}`;
  const newRoom = await Room.create({
    title,
    hostId: userId,
    maxPlayers: maxPlayers || 4,
    duration: duration || 60,
    players: [{
      userId,
      username,
      isHost: true,
      isReady: true,
      // Host is always ready? Or explicit?
      progress: 0,
      y: 360,
      lastSeen: /* @__PURE__ */ new Date()
    }],
    status: "waiting"
  });
  return { success: true, roomId: newRoom._id, room: newRoom };
});

export { create_post as default };
//# sourceMappingURL=create.post.mjs.map
