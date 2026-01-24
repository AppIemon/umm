/**
 * 샘플 음악 프록시 API
 * 안정적인 CC0/무료 라이선스 음악을 프록시하여 제공합니다.
 */
export default defineEventHandler(async (event) => {
  const { id } = getQuery(event);

  // CC0/무료 라이선스 샘플 음악 목록
  // Pixabay Music 또는 다른 안정적인 소스 사용
  const sampleSources: Record<string, { url: string; name: string }> = {
    '1': {
      // Pixabay - Electronic (Free for commercial use)
      url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3',
      name: 'Electronic Future Beats'
    },
    '2': {
      // Pixabay - Synthwave (Free for commercial use)
      url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bab.mp3',
      name: 'Synthwave Retro'
    },
    '3': {
      // Pixabay - Epic Electronic (Free for commercial use)
      url: 'https://cdn.pixabay.com/download/audio/2021/11/25/audio_91b32e02f9.mp3',
      name: 'Epic Cinematic'
    }
  };

  const sample = sampleSources[id as string];
  if (!sample) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Sample not found'
    });
  }

  try {
    console.log(`[Samples] Fetching: ${sample.name} from ${sample.url}`);

    const response = await fetch(sample.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'audio/mpeg,audio/*;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://pixabay.com/'
      }
    });

    if (!response.ok) {
      console.error(`[Samples] Failed to fetch: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch sample: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    console.log(`[Samples] Successfully fetched ${sample.name}, size: ${arrayBuffer.byteLength} bytes`);

    setResponseHeader(event, 'Content-Type', 'audio/mpeg');
    setResponseHeader(event, 'Content-Disposition', `attachment; filename="${encodeURIComponent(sample.name)}.mp3"`);
    setResponseHeader(event, 'Cache-Control', 'public, max-age=604800'); // 1주일 캐시

    return Buffer.from(arrayBuffer);
  } catch (error: any) {
    console.error('[Samples] Error:', error.message);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to load sample music: ${error.message}`
    });
  }
});
