export class AudioAnalyzerClient {
  private audioContext: AudioContext;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  async decodeAudio(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
    return await this.audioContext.decodeAudioData(arrayBuffer);
  }

  /**
   * Analyze audio to find "volume spikes" (onsets)
   * Corresponds to 'Adaptive Flux Logic' in analyze_beat.js
   */
  async findOnsets(buffer: AudioBuffer, difficulty: number = 10): Promise<{ times: number[], peaks: number[] }> {
    const rawData = buffer.getChannelData(0); // Left channel
    const sampleRate = buffer.sampleRate;

    // 1. RMS Profile
    const rmsWindow = Math.floor(sampleRate * 0.025); // 25ms
    const hopSize = Math.floor(sampleRate * 0.005);   // 5ms
    const energyProfile: { t: number, e: number }[] = [];

    let currentSqSum = 0;
    // Initial window
    for (let i = 0; i < Math.min(rmsWindow, rawData.length); i++) {
      const val = rawData[i] || 0;
      currentSqSum += val * val;
    }

    for (let i = 0; i < rawData.length - rmsWindow; i += hopSize) {
      const rms = Math.sqrt(currentSqSum / rmsWindow);
      energyProfile.push({ t: i / sampleRate, e: rms });

      // Slide window
      for (let j = 0; j < hopSize; j++) {
        const leave = rawData[i + j] || 0;
        const enter = rawData[i + rmsWindow + j] || 0;
        currentSqSum = currentSqSum - (leave * leave) + (enter * enter);
      }
      if (currentSqSum < 0) currentSqSum = 0;
    }

    // 2. Flux Profile (Spectral Flux approx via Energy Flux)
    const fluxes: number[] = [];
    for (let i = 1; i < energyProfile.length; i++) {
      const eCurrent = energyProfile[i]?.e || 0;
      const ePrev = energyProfile[i - 1]?.e || 0;
      const flux = Math.max(0, eCurrent - ePrev);
      fluxes.push(flux);
    }

    // 3. Adaptive Thresholding
    const thresholdWindow = 200; // 1 second roughly
    const thresholds: number[] = [];

    // We do a centered moving average for threshold
    // Pre-calculate sums for optimization? Flux array ~ few thousand items. Naive loop is okay.
    for (let i = 0; i < fluxes.length; i++) {
      const start = Math.max(0, i - 100);
      const end = Math.min(fluxes.length, i + 100);
      let localSum = 0;
      for (let k = start; k < end; k++) localSum += (fluxes[k] || 0);
      const localAvg = localSum / (end - start);
      thresholds.push(localAvg);
    }

    // 4. Peak Picking
    // User wants "Volume suddenly goes up" = Notes.
    // Iterative approach to find best parameters?
    // We return a set of beats. The Smart Generator will loop and re-call this if needed, 
    // or we can try to optimize here.
    // But the user said: "Modify Path until match".
    // So we might need to assume this detection is the "Ground Truth" and we adjust the Path Generator?
    // OR we adjust the Detection Threshold until the Path Generator can handle it?
    // "Volume... goes up... = Notes" -> This implies the Logic is fixed: Flux > Threshold.
    // The "97.5% match" check is between "Detected volume spikes" and "Final Map Move Events".

    const beats: number[] = [];
    const peaks: number[] = [];

    // Sensitivity Multiplier
    const MULTIPLIER = 1.5;
    const MIN_DIST = 0.1; // 100ms - Piano notes can be fast.

    let lastBeat = 0;

    for (let i = 1; i < fluxes.length - 1; i++) {
      const flux = fluxes[i];
      const prevFlux = fluxes[i - 1];
      const nextFlux = fluxes[i + 1];
      const threshold = thresholds[i];
      const t = energyProfile[i]?.t;

      if (flux !== undefined && prevFlux !== undefined && nextFlux !== undefined && threshold !== undefined && t !== undefined) {
        if (flux > threshold * MULTIPLIER) {
          if (flux > prevFlux && flux > nextFlux) { // Local max
            if (t - lastBeat > MIN_DIST) {
              beats.push(t);
              peaks.push(flux);
              lastBeat = t;
            }
          }
        }
      }
    }

    return { times: beats, peaks };
  }
}
