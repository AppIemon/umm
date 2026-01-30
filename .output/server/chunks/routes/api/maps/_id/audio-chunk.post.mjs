import { c as defineEventHandler, j as getRouterParam, r as readBody, e as createError } from '../../../../_/nitro.mjs';
import { G as GameMap } from '../../../../_/Map.mjs';
import { A as AudioContent } from '../../../../_/AudioContent.mjs';
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
  const binaryChunk = Buffer.from(chunkData, "base64");
  let audioContent;
  if (map.audioContentId) {
    audioContent = await AudioContent.findById(map.audioContentId);
  }
  if (!audioContent) {
    audioContent = await AudioContent.create({
      hash: `map_${id}_temp`,
      chunks: new Array(totalChunks).fill(null),
      size: 0
    });
    map.audioContentId = audioContent._id;
    await map.save();
  }
  await AudioContent.updateOne(
    { _id: audioContent._id },
    { $set: { [`chunks.${chunkIndex}`]: binaryChunk } }
  );
  return { success: true, index: chunkIndex };
});

export { audioChunk_post as default };
//# sourceMappingURL=audio-chunk.post.mjs.map
