import { c as defineEventHandler, r as readBody, e as createError } from '../../../_/nitro.mjs';
import { G as GameMap } from '../../../_/Map.mjs';
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
  const body = await readBody(event);
  const { roomId, userId, mapIndex } = body;
  if (!roomId || !userId) {
    throw createError({ statusCode: 400, statusMessage: "Missing roomId or userId" });
  }
  const room = await Room.findById(roomId);
  if (!room) {
    throw createError({ statusCode: 404, statusMessage: "Room not found" });
  }
  if (!room.mapQueue) {
    room.mapQueue = [];
    if (room.map) room.mapQueue.push(room.map);
  }
  if (mapIndex >= room.mapQueue.length) {
    const verifiedCount = await GameMap.countDocuments({ isShared: true, isVerified: true });
    if (verifiedCount > 0) {
      const skip = Math.floor(Math.random() * verifiedCount);
      const newMap2 = await GameMap.findOne({ isShared: true, isVerified: true }).skip(skip);
      if (newMap2) {
        room.mapQueue.push(newMap2._id);
        await room.save();
        return { map: newMap2, mapIndex };
      }
    }
    const { GameEngine } = await import('../../../_/game-engine.mjs');
    const engine = new GameEngine({ difficulty: 7, density: 1, portalFrequency: 0.15 });
    const duration = 60;
    const seed = `multi_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    engine.generateMap([], [], duration, Math.floor(Math.random() * 1e5), false, 0, 120, 2);
    const newMap = await GameMap.create({
      title: `MULTI_MAP_${Date.now()}`,
      difficulty: 7,
      seed,
      creatorName: "SYSTEM",
      creatorId: null,
      beatTimes: [],
      sections: [],
      engineObstacles: engine.obstacles,
      enginePortals: engine.portals,
      autoplayLog: engine.autoplayLog,
      duration,
      isShared: true,
      isVerified: true,
      isAiVerified: true
    });
    room.mapQueue.push(newMap._id);
    await room.save();
    return { map: newMap, mapIndex };
  }
  const existingMapId = room.mapQueue[mapIndex];
  const existingMap = await GameMap.findById(existingMapId);
  return { map: existingMap, mapIndex };
});

export { nextMap_post as default };
//# sourceMappingURL=next-map.post.mjs.map
