/**
 * 샘플 음악 프록시 API
 * 외부 CC0 음악을 프록시하여 제공합니다.
 */
export default defineEventHandler(async (event) => {
  const { id } = getQuery(event);

  // CC0 샘플 음악 목록 (OpenGameArt.org 등에서 제공하는 무료 음악)
  const sampleSources: Record<string, { url: string; name: string }> = {
    '1': {
      url: 'https://opengameart.org/sites/default/files/Bit%20Bit%20Loop_0.mp3',
      name: 'Bit Bit Loop'
    },
    '2': {
      url: 'https://opengameart.org/sites/default/files/Soliloquy_0.mp3',
      name: 'Soliloquy'
    },
    '3': {
      url: 'https://opengameart.org/sites/default/files/Orbital%20Colossus.mp3',
      name: 'Orbital Colossus'
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
    const response = await fetch(sample.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sample');
    }

    const arrayBuffer = await response.arrayBuffer();

    setResponseHeader(event, 'Content-Type', 'audio/mpeg');
    setResponseHeader(event, 'Content-Disposition', `attachment; filename="${encodeURIComponent(sample.name)}.mp3"`);
    setResponseHeader(event, 'Cache-Control', 'public, max-age=86400'); // 캐시 1일

    return Buffer.from(arrayBuffer);
  } catch (error: any) {
    console.error('Sample fetch error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load sample music'
    });
  }
});
