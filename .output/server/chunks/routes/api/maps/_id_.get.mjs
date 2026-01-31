import { c as defineEventHandler, j as getRouterParam, e as createError } from '../../../_/nitro.mjs';
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

const _id__get = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const map = await GameMap.findById(id).populate("audioContentId");
  if (!map) {
    throw createError({
      statusCode: 404,
      statusMessage: "Map not found"
    });
  }
  const mapObj = map.toObject();
  const roundNum = (num, precision = 1) => {
    if (typeof num !== "number" || isNaN(num)) return 0;
    const factor = Math.pow(10, precision);
    return Math.round(num * factor) / factor;
  };
  const optimizeObstacles = (obs) => {
    if (!Array.isArray(obs)) return [];
    return obs.map((o) => ({
      ...o,
      x: roundNum(o.x),
      y: roundNum(o.y),
      width: roundNum(o.width),
      height: roundNum(o.height)
    }));
  };
  const optimizeLog = (log) => {
    if (!Array.isArray(log) || log.length === 0) return [];
    return log.map((p) => ({
      ...p,
      x: roundNum(p.x),
      y: roundNum(p.y),
      time: roundNum(p.time, 3)
    }));
  };
  if (mapObj.audioUrl && mapObj.audioUrl.length > 5) {
    delete mapObj.audioContentId;
    delete mapObj.audioChunks;
    delete mapObj.audioData;
  } else if (mapObj.audioContentId || mapObj.audioChunks && mapObj.audioChunks.length > 0 || mapObj.audioData && mapObj.audioData.length > 100) {
    mapObj.audioUrl = `/api/maps/${id}/audio`;
    delete mapObj.audioContentId;
    delete mapObj.audioChunks;
    delete mapObj.audioData;
  }
  if (mapObj.engineObstacles) mapObj.engineObstacles = optimizeObstacles(mapObj.engineObstacles);
  if (mapObj.enginePortals) mapObj.enginePortals = optimizeObstacles(mapObj.enginePortals);
  if (mapObj.autoplayLog) mapObj.autoplayLog = optimizeLog(mapObj.autoplayLog);
  delete mapObj.audioChunks;
  return mapObj;
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
