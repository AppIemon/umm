import { c as defineEventHandler, j as getRouterParam, r as readBody, e as createError } from '../../../_/nitro.mjs';
import { G as GameMap } from '../../../_/Map.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import 'node:url';

const _id__patch = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const {
    title,
    difficulty,
    seed,
    beatTimes,
    sections,
    engineObstacles,
    enginePortals,
    autoplayLog,
    duration,
    audioUrl,
    audioData,
    audioChunks,
    isShared,
    bpm,
    measureLength
  } = body;
  const updateData = {};
  if (title !== void 0) updateData.title = title;
  if (difficulty !== void 0) updateData.difficulty = difficulty;
  if (seed !== void 0) updateData.seed = seed;
  if (beatTimes !== void 0) updateData.beatTimes = beatTimes;
  if (sections !== void 0) updateData.sections = sections;
  if (engineObstacles !== void 0) updateData.engineObstacles = engineObstacles;
  if (enginePortals !== void 0) updateData.enginePortals = enginePortals;
  if (autoplayLog !== void 0) updateData.autoplayLog = autoplayLog;
  if (duration !== void 0) updateData.duration = duration;
  if (audioUrl !== void 0) updateData.audioUrl = audioUrl;
  if (audioData !== void 0) updateData.audioData = audioData;
  if (audioChunks !== void 0) updateData.audioChunks = audioChunks;
  if (isShared !== void 0) updateData.isShared = isShared;
  if (bpm !== void 0) updateData.bpm = bpm;
  if (measureLength !== void 0) updateData.measureLength = measureLength;
  const updatedMap = await GameMap.findByIdAndUpdate(id, { $set: updateData }, { new: true });
  if (!updatedMap) {
    throw createError({
      statusCode: 404,
      statusMessage: "Map not found"
    });
  }
  return updatedMap;
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map
