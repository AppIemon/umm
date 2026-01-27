import { Readable } from 'stream';

// List of Invidious instances to try (fallback chain)
// Updated with currently working instances
const INVIDIOUS_INSTANCES = [
  'https://api.invidious.io',      // Official API instance
  'https://invidious.snopyta.org',
  'https://invidious.kavin.rocks',
  'https://inv.riverside.rocks',
  'https://yt.artemislena.eu',
  'https://invidious.flokinet.to',
  'https://invidious.esmailelbob.xyz',
  'https://inv.bp.projectsegfau.lt',
];

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

async function getAudioFromInvidious(videoId: string): Promise<{ audioUrl: string; title: string } | null> {
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      console.log(`[YouTube] Trying Invidious instance: ${instance}`);
      const apiUrl = `${instance}/api/v1/videos/${videoId}`;
      const response = await fetchWithTimeout(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      }, 15000);

      if (!response.ok) {
        console.log(`[YouTube] Invidious ${instance} returned ${response.status}`);
        continue;
      }

      const data = await response.json() as any;
      const title = data.title || 'audio';

      // Find audio-only format (prefer higher quality)
      const adaptiveFormats = data.adaptiveFormats || [];
      let audioFormat = adaptiveFormats
        .filter((f: any) => f.type?.startsWith('audio/'))
        .sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0))[0];

      if (audioFormat?.url) {
        console.log(`[YouTube] Found audio from ${instance}: ${audioFormat.type}, bitrate: ${audioFormat.bitrate}`);
        return { audioUrl: audioFormat.url, title };
      }

      // Fallback: Try formatStreams (contains both audio and video)
      const formatStreams = data.formatStreams || [];
      if (formatStreams.length > 0) {
        console.log(`[YouTube] Using formatStream from ${instance}`);
        return { audioUrl: formatStreams[0].url, title };
      }

    } catch (error: any) {
      console.log(`[YouTube] Invidious ${instance} error: ${error.message}`);
      continue;
    }
  }
  return null;
}

// Cobalt API v10 format
async function getAudioFromCobalt(videoId: string): Promise<{ audioUrl: string; title: string } | null> {
  // Main cobalt instance
  const cobaltUrl = 'https://api.cobalt.tools';

  try {
    console.log(`[YouTube] Trying Cobalt API...`);
    const response = await fetchWithTimeout(cobaltUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: `https://www.youtube.com/watch?v=${videoId}`,
        downloadMode: 'audio',
        audioFormat: 'mp3'
      })
    }, 30000);

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`[YouTube] Cobalt returned ${response.status}: ${errorText}`);
      return null;
    }

    const data = await response.json() as any;

    // Handle different response formats
    if (data.status === 'tunnel' || data.status === 'redirect') {
      const audioUrl = data.url || data.audio;
      if (audioUrl) {
        console.log(`[YouTube] Got audio URL from Cobalt`);
        return { audioUrl, title: data.filename || 'audio' };
      }
    } else if (data.url) {
      console.log(`[YouTube] Got direct URL from Cobalt`);
      return { audioUrl: data.url, title: 'audio' };
    }

    console.log(`[YouTube] Cobalt response format not recognized:`, data);
  } catch (error: any) {
    console.log(`[YouTube] Cobalt error: ${error.message}`);
  }

  return null;
}

// Piped API as additional fallback
async function getAudioFromPiped(videoId: string): Promise<{ audioUrl: string; title: string } | null> {
  const pipedInstances = [
    'https://pipedapi.kavin.rocks',
    'https://api.piped.yt',
    'https://pipedapi.adminforge.de',
  ];

  for (const instance of pipedInstances) {
    try {
      console.log(`[YouTube] Trying Piped instance: ${instance}`);
      const response = await fetchWithTimeout(`${instance}/streams/${videoId}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }, 15000);

      if (!response.ok) {
        console.log(`[YouTube] Piped ${instance} returned ${response.status}`);
        continue;
      }

      const data = await response.json() as any;
      const title = data.title || 'audio';

      // Get audio streams
      const audioStreams = data.audioStreams || [];
      if (audioStreams.length > 0) {
        // Sort by bitrate and get highest quality
        const bestAudio = audioStreams.sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0))[0];
        if (bestAudio?.url) {
          console.log(`[YouTube] Found audio from Piped ${instance}: bitrate ${bestAudio.bitrate}`);
          return { audioUrl: bestAudio.url, title };
        }
      }

    } catch (error: any) {
      console.log(`[YouTube] Piped ${instance} error: ${error.message}`);
      continue;
    }
  }
  return null;
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { url } = body;

  if (!url) {
    throw createError({
      statusCode: 400,
      statusMessage: 'URL is required'
    });
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid YouTube URL'
    });
  }

  console.log(`[YouTube] Processing video ID: ${videoId}`);

  try {
    // Try Invidious first (most reliable)
    let result = await getAudioFromInvidious(videoId);

    // If Invidious fails, try Piped
    if (!result) {
      console.log('[YouTube] All Invidious instances failed, trying Piped...');
      result = await getAudioFromPiped(videoId);
    }

    // If Piped fails, try Cobalt
    if (!result) {
      console.log('[YouTube] All Piped instances failed, trying Cobalt...');
      result = await getAudioFromCobalt(videoId);
    }

    if (!result) {
      throw new Error('All audio extraction methods failed. Please try again later.');
    }

    const { audioUrl, title } = result;
    const sanitizedTitle = title.replace(/[\/\\:*?"<>|]/g, '_');

    console.log(`[YouTube] Streaming audio for: ${sanitizedTitle}`);

    // Fetch the audio and stream it to client
    const audioResponse = await fetchWithTimeout(audioUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://www.youtube.com/',
      }
    }, 60000);

    if (!audioResponse.ok) {
      throw new Error(`Failed to fetch audio stream: ${audioResponse.status}`);
    }

    // Set response headers
    const contentType = audioResponse.headers.get('content-type') || 'audio/mpeg';
    setResponseHeader(event, 'Content-Type', contentType);

    const encodedTitle = encodeURIComponent(sanitizedTitle + '.mp3');
    setResponseHeader(event, 'Content-Disposition', `attachment; filename*=UTF-8''${encodedTitle}`);

    const contentLength = audioResponse.headers.get('content-length');
    if (contentLength) {
      setResponseHeader(event, 'Content-Length', parseInt(contentLength, 10));
    }

    // Convert Web ReadableStream to Node.js Readable stream
    if (audioResponse.body) {
      const reader = audioResponse.body.getReader();
      const stream = new Readable({
        async read() {
          try {
            const { done, value } = await reader.read();
            if (done) {
              this.push(null);
            } else {
              this.push(Buffer.from(value));
            }
          } catch (err) {
            this.destroy(err as Error);
          }
        }
      });
      return sendStream(event, stream);
    }

    throw new Error('No response body available');

  } catch (error: any) {
    console.error("[YouTube] Download Error:", {
      message: error.message,
      videoId: videoId
    });

    throw createError({
      statusCode: 500,
      statusMessage: `Failed to process YouTube video: ${error.message}`
    });
  }
});
