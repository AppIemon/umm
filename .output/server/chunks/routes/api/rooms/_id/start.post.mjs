import { c as defineEventHandler, r as readBody, e as createError } from '../../../../_/nitro.mjs';
import { R as Room } from '../../../../_/Room.mjs';
import mongoose from 'mongoose';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const roundNum = (num, precision = 1) => {
  if (typeof num !== "number" || isNaN(num)) return 0;
  const factor = Math.pow(10, precision);
  return Math.round(num * factor) / factor;
};
const optimizeObstacles = (obs) => {
  if (!Array.isArray(obs)) return [];
  return obs.map((o) => {
    const optimized = {
      ...o,
      x: roundNum(o.x),
      y: roundNum(o.y),
      width: roundNum(o.width),
      height: roundNum(o.height)
    };
    if (o.children) optimized.children = optimizeObstacles(o.children);
    return optimized;
  });
};
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
  try {
    const { GameEngine } = await import('../../../../_/game-engine.mjs');
    const engine = new GameEngine({ difficulty: room.difficulty || 10 });
    const seed = Math.floor(Math.random() * 1e6);
    const hostPlayer = room.players.find((p) => p.isHost);
    const maxDuration = room.duration || 120;
    const rounds = [];
    console.log(`[StartGame] Room ${room.title} duration: ${maxDuration}s. Generating inline rounds...`);
    let currentDifficulty = room.difficulty || 10;
    for (let d = 10; d <= maxDuration; d += 10) {
      engine.setMapConfig({ difficulty: currentDifficulty });
      engine.generateMap([], [], d, seed, false);
      const mapData = {
        _id: new mongoose.Types.ObjectId(),
        // Virtual ID for tracking
        title: `ROOM_${room.title}_ROUND_${d / 10}`,
        difficulty: currentDifficulty,
        seed,
        engineObstacles: optimizeObstacles(engine.obstacles),
        enginePortals: optimizeObstacles(engine.portals),
        duration: d,
        audioUrl: room.musicUrl || null,
        isVerified: true,
        createdAt: /* @__PURE__ */ new Date()
      };
      rounds.push(mapData);
      currentDifficulty++;
      if (rounds.length >= 100) break;
    }
    const updatedRoom = await Room.findOneAndUpdate(
      { _id: roomId, status: "waiting" },
      {
        $set: {
          map: rounds[0],
          mapQueue: rounds,
          status: "playing",
          startedAt: /* @__PURE__ */ new Date(),
          "players.$[].progress": 0,
          "players.$[].isReady": false
        }
      },
      { new: true }
    );
    if (!updatedRoom) {
      const checkAgain = await Room.findById(roomId);
      if ((checkAgain == null ? void 0 : checkAgain.status) === "playing") return { success: true };
      throw new Error("Room state changed or room was deleted during map generation");
    }
    console.log(`[StartGame] Successfully started game in room ${roomId} with ${rounds.length} inline rounds.`);
    return { success: true };
  } catch (err) {
    console.error("[StartGame] Fatal error:", err);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to start: ${err.message || "Unknown error"}`
    });
  }
});

export { start_post as default };
//# sourceMappingURL=start.post.mjs.map
