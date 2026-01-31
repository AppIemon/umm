import { MusicRequest } from '~/server/models/MusicRequest'

// GET: Fetch all music requests
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const status = query.status as string | undefined;

    const filter: any = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      filter.status = status;
    }

    const requests = await MusicRequest.find(filter)
      .populate('requestedBy', 'username displayName')
      .populate('processedBy', 'username displayName')
      .sort({ createdAt: -1 });

    return requests;
  } catch (error: any) {
    console.error('[MusicRequests] Error fetching requests:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch music requests'
    });
  }
})
