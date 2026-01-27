/**
 * Audio utility functions for trimming and chunking audio data
 */

/**
 * Trim an AudioBuffer to a specific duration
 * @param buffer Original AudioBuffer
 * @param durationSeconds Target duration in seconds
 * @returns New trimmed AudioBuffer
 */
export function trimAudioBuffer(
  buffer: AudioBuffer,
  durationSeconds: number
): AudioBuffer {
  // If buffer is already shorter than target, return as-is
  if (buffer.duration <= durationSeconds) {
    return buffer;
  }

  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const targetSamples = Math.floor(durationSeconds * buffer.sampleRate);

  // Create new buffer with trimmed length
  const trimmedBuffer = audioCtx.createBuffer(
    buffer.numberOfChannels,
    targetSamples,
    buffer.sampleRate
  );

  // Copy channel data up to target length
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const sourceData = buffer.getChannelData(channel);
    const targetData = trimmedBuffer.getChannelData(channel);
    targetData.set(sourceData.subarray(0, targetSamples));
  }

  return trimmedBuffer;
}

/**
 * Convert AudioBuffer to WAV Blob
 * Uses WAV format for reliable encoding
 */
export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  // Interleave channels
  let interleaved: Float32Array;
  if (numChannels === 2) {
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    interleaved = new Float32Array(left.length * 2);
    for (let i = 0; i < left.length; i++) {
      interleaved[i * 2] = left[i]!;
      interleaved[i * 2 + 1] = right[i]!;
    }
  } else {
    interleaved = buffer.getChannelData(0);
  }

  // Convert to 16-bit samples
  const dataLength = interleaved.length * (bitDepth / 8);
  const headerLength = 44;
  const totalLength = headerLength + dataLength;

  const arrayBuffer = new ArrayBuffer(totalLength);
  const view = new DataView(arrayBuffer);

  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, totalLength - 8, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true); // byte rate
  view.setUint16(32, numChannels * (bitDepth / 8), true); // block align
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  // Write samples
  let offset = 44;
  for (let i = 0; i < interleaved.length; i++) {
    let sample = Math.max(-1, Math.min(1, interleaved[i]!));
    sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    view.setInt16(offset, sample, true);
    offset += 2;
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Convert Blob to Base64 data URL
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Split a Base64 string into chunks of specified size
 * @param base64 The full Base64 string
 * @param chunkSize Size of each chunk in characters
 * @returns Array of chunks
 */
export function splitBase64ToChunks(base64: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < base64.length; i += chunkSize) {
    chunks.push(base64.substring(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Trim audio buffer to duration and encode as Base64
 * Returns the trimmed audio as Base64 data URL
 */
export async function trimAndEncodeAudio(
  buffer: AudioBuffer,
  durationSeconds: number
): Promise<string> {
  const trimmedBuffer = trimAudioBuffer(buffer, durationSeconds);
  const wavBlob = audioBufferToWavBlob(trimmedBuffer);
  return blobToBase64(wavBlob);
}

// Constants
export const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB chunks for Vercel safety
export const MAX_SINGLE_UPLOAD_SIZE = 4.5 * 1024 * 1024; // 4.5MB threshold
