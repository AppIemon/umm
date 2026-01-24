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

const rate_post = defineEventHandler(async (event) => {
  const mapId = getRouterParam(event, "id");
  const body = await readBody(event);
  const { rating } = body;
  if (!rating || rating < 1 || rating > 30) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid rating. Must be between 1 and 30."
    });
  }
  const map = await GameMap.findById(mapId);
  if (!map) {
    throw createError({
      statusCode: 404,
      statusMessage: "Map not found"
    });
  }
  map.ratingSum += rating;
  map.ratingCount += 1;
  map.rating = Number((map.ratingSum / map.ratingCount).toFixed(1));
  await map.save();
  return {
    success: true,
    newRating: map.rating,
    count: map.ratingCount
  };
});

export { rate_post as default };
//# sourceMappingURL=rate.post.mjs.map
