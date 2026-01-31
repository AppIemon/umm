import { MusicRequest } from '~/server/models/MusicRequest'
import { User } from '~/server/models/User'
import fs from 'fs'
import path from 'path'

// POST: Approve or reject a music request
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { requestId, action, adminUserId } = body; // action: 'approve' | 'reject'

    // Verify localhost only
    const host = getRequestHeader(event, 'host');
    const isLocalhost = host?.includes('localhost') || host?.includes('127.0.0.1');

    if (!isLocalhost) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Music management is only available on localhost'
      });
    }

    if (!requestId || !['approve', 'reject'].includes(action)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request parameters'
      });
    }

    const request = await MusicRequest.findById(requestId);
    if (!request) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Music request not found'
      });
    }

    // Update request status
    request.status = action === 'approve' ? 'approved' : 'rejected';
    request.processedAt = new Date();

    if (adminUserId) {
      const admin = await User.findById(adminUserId);
      if (admin) {
        request.processedBy = admin._id;
      }
    }

    await request.save();

    // If rejecting, optionally delete the physical file from public/music if it exists
    if (action === 'reject') {
      const musicDir = path.join(process.cwd(), 'public', 'music');
      const filePath = path.join(musicDir, request.filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`[MusicRequest] Deleted rejected music file: ${request.filename}`);
      }

      // Also remove from MongoDB
      await MusicRequest.findByIdAndDelete(requestId);
      console.log(`[MusicRequest] Deleted rejected request: ${requestId}`);

      return {
        success: true,
        action: 'rejected',
        message: 'Music request rejected and deleted'
      };
    }

    // If approving, the file should already exist in public/music (from localhost upload)
    console.log(`[MusicRequest] Approved music request: ${request.filename}`);

    return {
      success: true,
      action: 'approved',
      request
    };
  } catch (error: any) {
    console.error('[MusicRequest] Error processing request:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Failed to process music request'
    });
  }
})
