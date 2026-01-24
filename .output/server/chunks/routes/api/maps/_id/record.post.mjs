import { c as defineEventHandler, j as getRouterParam, r as readBody, f as createError } from '../../../../_/nitro.mjs';
import { G as GameMap } from '../../../../_/Map.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import 'node:url';

const record_post = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const { score, username } = body;
  if (!id || score === void 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing mapId or score"
    });
  }
  const map = await GameMap.findById(id);
  if (!map) {
    throw createError({
      statusCode: 404,
      statusMessage: "Map not found"
    });
  }
  if (score > (map.bestScore || 0)) {
    map.bestScore = score;
    map.bestPlayer = username || "Guest";
    await map.save();
    return { success: true, updated: true, bestScore: map.bestScore };
  }
  return { success: true, updated: false, bestScore: map.bestScore };
});

export { record_post as default };
//# sourceMappingURL=record.post.mjs.map
