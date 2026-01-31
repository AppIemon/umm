import { c as defineEventHandler, j as getRouterParam, e as createError, k as sendRedirect, l as setHeader } from '../../../../_/nitro.mjs';
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

const audio_get = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const map = await GameMap.findById(id).select("audioContentId audioChunks audioUrl audioData");
  if (!map) {
    throw createError({
      statusCode: 404,
      statusMessage: "Map not found"
    });
  }
  if (map.audioUrl) {
    return sendRedirect(event, map.audioUrl);
  }
  let finalBuffer = null;
  if (map.audioContentId) {
    const ac = await AudioContent.findById(map.audioContentId);
    if (ac && ac.chunks && ac.chunks.length > 0) {
      const validChunks = ac.chunks.filter((c) => c);
      if (validChunks.length > 0) {
        finalBuffer = Buffer.concat(validChunks);
      }
    }
  }
  if (!finalBuffer && map.audioData && map.audioData.length > 0) {
    try {
      const matches = map.audioData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        finalBuffer = Buffer.from(matches[2], "base64");
      } else {
        finalBuffer = Buffer.from(map.audioData, "base64");
      }
    } catch (e) {
      console.error("Failed to decode legacy audioData", e);
    }
  }
  if (!finalBuffer && map.audioChunks && map.audioChunks.length > 0) {
    try {
      const fullBase64 = map.audioChunks.join("");
      const matches = fullBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        finalBuffer = Buffer.from(matches[2], "base64");
      } else {
        finalBuffer = Buffer.from(fullBase64, "base64");
      }
    } catch (e) {
      console.error("Failed to decode legacy audio chunks", e);
    }
  }
  if (!finalBuffer) {
    throw createError({
      statusCode: 404,
      statusMessage: "Audio not found"
    });
  }
  setHeader(event, "Content-Type", "audio/wav");
  setHeader(event, "Content-Length", finalBuffer.length);
  return finalBuffer;
});

export { audio_get as default };
//# sourceMappingURL=audio.get.mjs.map
