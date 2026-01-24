import ytdl from '@distube/ytdl-core';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { url } = body;

  if (!url || !ytdl.validateURL(url)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid YouTube URL'
    });
  }

  try {
    // Create an agent to maintain session
    const agent = ytdl.createAgent(undefined);

    const requestOptions = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    };

    const info = await ytdl.getInfo(url, { agent, requestOptions });
    const title = info.videoDetails.title.replace(/[\/\\:*?"<>|]/g, '_'); // Sanitize filename for standard FS
    const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });

    // Set headers
    setResponseHeader(event, 'Content-Type', 'audio/mpeg'); // or audio/webm depending on format
    const encodedTitle = encodeURIComponent(title + '.mp3');
    setResponseHeader(event, 'Content-Disposition', `attachment; filename*=UTF-8''${encodedTitle}`);

    // Stream directly using the already fetched info
    return sendStream(event, ytdl.downloadFromInfo(info, { format, agent, requestOptions }));

  } catch (error: any) {
    console.error("YouTube Download Error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to process YouTube video: ' + error.message
    });
  }
});
