
import fs from 'fs';
import { MPEGDecoder } from 'mpg123-decoder';

const analyze = async () => {
  console.log("Loading MP3...");
  const buffer = fs.readFileSync('public/audio/samples/I Love You.mp3');
  const decoder = new MPEGDecoder();
  await decoder.ready;

  // Decode MP3
  const { channelData, sampleRate, length } = decoder.decode(buffer);
  const rawData = channelData[0]; // Left channel

  console.log(`Decoded: ${sampleRate}Hz, ${length} samples, ${(length / sampleRate).toFixed(2)}s`);

  // --- EXISTING LOGIC PORT ---
  const step = Math.floor(sampleRate / 150);

  // Find Peak
  let peak = 0;
  for (let i = 0; i < rawData.length; i += step) {
    const val = Math.abs(rawData[i] || 0);
    if (val > peak) peak = val;
  }
  if (peak < 0.01) peak = 0.1;

  const difficulty = 10; // Normal difficulty simulation
  // From useAudioAnalyzer.ts
  const thresholdRate = 0.45 - ((difficulty - 1) / 29) * 0.35;
  // Diff=10 -> Rate = 0.45 - (9/29)*0.35 = 0.45 - 0.31*0.35 = 0.45 - 0.108 = 0.34
  // Threshold = Peak * 0.34
  const threshold = peak * thresholdRate;
  const minDistance = 0.35 - ((difficulty - 1) / 29) * 0.3;
  // MinDist = 0.35 - 0.1 = 0.25s

  console.log(`Config: Peak=${peak.toFixed(4)}, Threshold=${threshold.toFixed(4)}, MinDist=${minDistance.toFixed(3)}s`);

  const obstacles = [];
  let lastObstacleTime = 0;

  // Sliding Window Energy
  const absData = new Float32Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) absData[i] = Math.abs(rawData[i]);

  const windowSize = Math.floor(sampleRate * 0.03); // 30ms
  let currentSum = 0;
  for (let j = 0; j < Math.min(windowSize, absData.length); j++) currentSum += absData[j];

  for (let i = 0; i < rawData.length; i += step) {
    const time = i / sampleRate;
    const average = currentSum / windowSize;

    if (average > threshold) {
      if (time - lastObstacleTime > minDistance) {
        obstacles.push(time);
        lastObstacleTime = time;
      }
    }

    const limit = Math.min(i + step, rawData.length);
    for (let j = i; j < limit; j++) {
      currentSum -= absData[j];
      const enteringIdx = j + windowSize;
      if (enteringIdx < absData.length) currentSum += absData[enteringIdx];
    }
  }

  console.log(`[Existing Logic] Detected Beats: ${obstacles.length}`);
  console.log(obstacles.slice(0, 20).map(t => t.toFixed(3)).join(', '));

  // --- IMPROVED ADAPTIVE FLUX ALGORITHM ---
  console.log("--- Running Adaptive Flux Logic ---");

  // 1. RMS Profile
  const rmsWindow = Math.floor(sampleRate * 0.025); // 25ms
  const hopSize = Math.floor(sampleRate * 0.005);   // 5ms
  const energyProfile = [];

  let currentSqSum = 0;
  for (let i = 0; i < Math.min(rmsWindow, rawData.length); i++) currentSqSum += rawData[i] * rawData[i];

  for (let i = 0; i < rawData.length - rmsWindow; i += hopSize) {
    const rms = Math.sqrt(currentSqSum / rmsWindow);
    energyProfile.push({ t: i / sampleRate, e: rms });

    for (let j = 0; j < hopSize; j++) {
      const leave = rawData[i + j] || 0;
      const enter = rawData[i + rmsWindow + j] || 0;
      currentSqSum = currentSqSum - (leave * leave) + (enter * enter);
    }
    if (currentSqSum < 0) currentSqSum = 0;
  }

  // 2. Flux Profile
  const fluxes = [];
  for (let i = 1; i < energyProfile.length; i++) {
    const flux = Math.max(0, energyProfile[i].e - energyProfile[i - 1].e);
    fluxes.push(flux);
  }

  // 3. Adaptive Thresholding
  // We compute a moving average of the flux to serve as the noise floor/threshold
  const thresholdWindow = 200; // 200 * 5ms = 1 second window
  const thresholds = [];
  let tSum = 0;

  // Initial sum
  for (let i = 0; i < Math.min(thresholdWindow, fluxes.length); i++) tSum += fluxes[i];

  for (let i = 0; i < fluxes.length; i++) {
    // Sliding window centered? Or trailing? Trailing is easier, Centered is better.
    // Let's use Centered approximation: (Look Ahead + Look Behind)
    // Check window: [i - 100, i + 100]

    const start = Math.max(0, i - 100);
    const end = Math.min(fluxes.length, i + 100);
    let localSum = 0;
    for (let k = start; k < end; k++) localSum += fluxes[k];
    const localAvg = localSum / (end - start);

    thresholds.push(localAvg);
  }

  // 4. Peak Picking
  const beats = [];
  const MULTIPLIER = 1.6; // Sensitivity. Lower = More sensitive. 1.5 ~ 2.0 is common.
  const MIN_DIST = 0.2; // 200ms min distance

  let lastBeat = 0;

  for (let i = 1; i < fluxes.length - 1; i++) {
    const flux = fluxes[i];
    const threshold = thresholds[i];
    const t = energyProfile[i].t; // Time at this flux

    // Condition: Flux must be significantly above local average
    // AND it should be a local peak
    if (flux > threshold * MULTIPLIER) {
      if (flux > fluxes[i - 1] && flux > fluxes[i + 1]) {
        if (t - lastBeat > MIN_DIST) {
          beats.push(t);
          lastBeat = t;
        }
      }
    }
  }

  console.log(`[Adaptive Logic] Detected Beats: ${beats.length}`);
  console.log(beats.slice(0, 20).map(t => t.toFixed(3)).join(', '));
};

analyze();
