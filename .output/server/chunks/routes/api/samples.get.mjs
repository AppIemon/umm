import { c as defineEventHandler, k as getQuery, f as createError, l as setResponseHeader } from '../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'mongoose';
import 'node:url';

const samples_get = defineEventHandler(async (event) => {
  const { id } = getQuery(event);
  const sampleSources = {
    "1": {
      // SoundHelix - Song 1 (Reliable test audio)
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      name: "Electronic Future Beats"
    },
    "2": {
      // SoundHelix - Song 8
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
      name: "Synthwave Retro"
    },
    "3": {
      // SoundHelix - Song 10
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
      name: "Epic Cinematic"
    }
  };
  const sample = sampleSources[id];
  if (!sample) {
    throw createError({
      statusCode: 404,
      statusMessage: "Sample not found"
    });
  }
  try {
    console.log(`[Samples] Fetching: ${sample.name} from ${sample.url}`);
    const response = await fetch(sample.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "audio/mpeg,audio/*;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://pixabay.com/"
      }
    });
    if (!response.ok) {
      console.error(`[Samples] Failed to fetch: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch sample: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    console.log(`[Samples] Successfully fetched ${sample.name}, size: ${arrayBuffer.byteLength} bytes`);
    setResponseHeader(event, "Content-Type", "audio/mpeg");
    setResponseHeader(event, "Content-Disposition", `attachment; filename="${encodeURIComponent(sample.name)}.mp3"`);
    setResponseHeader(event, "Cache-Control", "public, max-age=604800");
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("[Samples] Error:", error.message);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to load sample music: ${error.message}`
    });
  }
});

export { samples_get as default };
//# sourceMappingURL=samples.get.mjs.map
