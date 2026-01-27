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

const audioChunk_post = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const { chunkIndex, chunkData, totalChunks } = body;
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing ID" });
  }
  if (chunkIndex === void 0 || !chunkData || !totalChunks) {
    throw createError({ statusCode: 400, statusMessage: "Missing chunk data" });
  }
  const map = await GameMap.findById(id);
  if (!map) {
    throw createError({ statusCode: 404, statusMessage: "Map not found" });
  }
  await GameMap.updateOne(
    { _id: id },
    { $set: { [`audioChunks.${chunkIndex}`]: chunkData } }
  );
  return { success: true, index: chunkIndex };
});

export { audioChunk_post as default };
//# sourceMappingURL=audio-chunk.post.mjs.map
