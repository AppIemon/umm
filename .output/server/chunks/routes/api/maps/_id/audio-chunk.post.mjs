import { c as defineEventHandler, j as getRouterParam, r as readBody, e as createError } from '../../../../_/nitro.mjs';
import { G as GameMap } from '../../../../_/Map.mjs';
import { A as AudioContent } from '../../../../_/AudioContent.mjs';
import fs from 'fs';
import path from 'path';
import require$$1 from 'crypto';
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
  if (chunkIndex === void 0 || !chunkData || totalChunks === void 0) {
    throw createError({ statusCode: 400, statusMessage: "Missing chunk info" });
  }
  const map = await GameMap.findById(id);
  if (!map) {
    throw createError({ statusCode: 404, statusMessage: "Map not found" });
  }
  if (!map.audioChunks) map.audioChunks = [];
  map.audioChunks[chunkIndex] = chunkData;
  map.markModified("audioChunks");
  await map.save();
  const uploadedCount = map.audioChunks.filter((c) => !!c).length;
  if (uploadedCount >= totalChunks) {
    console.log(`[Audio] All chunks received for map ${id}. Merging...`);
    const buffers = map.audioChunks.map((c) => Buffer.from(c, "base64"));
    const mergedData = Buffer.concat(buffers);
    const hash = require$$1.createHash("sha256").update(mergedData).digest("hex");
    const isVercel = !!process.env.VERCEL;
    if (isVercel) {
      let audioContent = await AudioContent.findOne({ hash });
      if (!audioContent) {
        audioContent = await AudioContent.create({
          hash,
          chunks: buffers,
          size: mergedData.length
        });
      }
      map.audioUrl = null;
      map.audioContentId = audioContent._id;
    } else {
      try {
        const finalFilename = `${hash}.wav`;
        const musicDir = path.join(process.cwd(), "public", "music");
        if (!fs.existsSync(musicDir)) {
          fs.mkdirSync(musicDir, { recursive: true });
        }
        const finalPath = path.join(musicDir, finalFilename);
        if (!fs.existsSync(finalPath)) {
          fs.writeFileSync(finalPath, mergedData);
        }
        map.audioUrl = `/music/${finalFilename}`;
        map.audioContentId = null;
      } catch (err) {
        console.error("[Audio] FS Merge failed, falling back to DB:", err);
        let audioContent = await AudioContent.findOne({ hash });
        if (!audioContent) {
          audioContent = await AudioContent.create({
            hash,
            chunks: buffers,
            size: mergedData.length
          });
        }
        map.audioUrl = null;
        map.audioContentId = audioContent._id;
      }
    }
    map.audioData = null;
    map.audioChunks = [];
    await map.save();
    return { success: true, finished: true, url: map.audioUrl, audioContentId: map.audioContentId };
  }
  return { success: true, finished: false, index: chunkIndex };
});

export { audioChunk_post as default };
//# sourceMappingURL=audio-chunk.post.mjs.map
