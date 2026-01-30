import { c as defineEventHandler, r as readBody, e as createError } from '../../../../_/nitro.mjs';
import { R as Room } from '../../../../_/Room.mjs';
import { G as GameMap } from '../../../../_/Map.mjs';
import mongoose from 'mongoose';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const start_post = defineEventHandler(async (event) => {
  var _a;
  const roomId = (_a = event.context.params) == null ? void 0 : _a.id;
  const body = await readBody(event);
  const { userId } = body;
  const room = await Room.findById(roomId);
  if (!room) throw createError({ statusCode: 404, statusMessage: "Room not found" });
  if (room.hostId !== userId) {
    throw createError({ statusCode: 403, statusMessage: "Only host can start game" });
  }
  if (room.status !== "waiting") {
    return { success: true };
  }
  const verifiedMapCount = await GameMap.countDocuments({ isShared: true, isVerified: true });
  let selectedMapId = null;
  if (verifiedMapCount > 0) {
    const skip = Math.floor(Math.random() * verifiedMapCount);
    const m = await GameMap.findOne({ isShared: true, isVerified: true }).skip(skip).select("_id");
    selectedMapId = m == null ? void 0 : m._id;
  }
  if (!selectedMapId) {
    const { GameEngine } = await import('../../../../_/game-engine.mjs');
    const engine = new GameEngine({ difficulty: room.difficulty || 5 });
    const seed = Math.floor(Math.random() * 1e6);
    engine.generateMap([], [], room.duration || 60, seed, false);
    const hostIsRegistered = mongoose.Types.ObjectId.isValid(room.hostId);
    const creatorId = hostIsRegistered ? room.hostId : new mongoose.Types.ObjectId("000000000000000000000000");
    const hostPlayer = room.players.find((p) => p.isHost);
    const newMap = await GameMap.create({
      title: `ROOM_${room.title}`,
      difficulty: room.difficulty || 5,
      seed,
      creator: creatorId,
      creatorName: (hostPlayer == null ? void 0 : hostPlayer.username) || "SYSTEM",
      beatTimes: [],
      sections: [],
      engineObstacles: engine.obstacles,
      enginePortals: engine.portals,
      autoplayLog: [],
      duration: room.duration || 60,
      isShared: false,
      isVerified: true
    });
    selectedMapId = newMap._id;
  }
  room.map = selectedMapId;
  room.status = "playing";
  room.players.forEach((p) => {
    p.progress = 0;
    p.isReady = false;
  });
  await room.save();
  return { success: true, mapId: selectedMapId };
});

export { start_post as default };
//# sourceMappingURL=start.post.mjs.map
