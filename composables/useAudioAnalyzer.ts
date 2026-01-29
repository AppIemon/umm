import { ref } from 'vue';

export interface SongSection {
  startTime: number;
  endTime: number;
  intensity: number; // 0-1
}

export interface AnalysisProgress {
  step: string;
  percent: number;
}

export const useAudioAnalyzer = () => {
  const audioContext = ref<AudioContext | null>(null);

  /**
   * 오디오 파일을 분석하여 비트 타이밍 배열을 반환합니다.
   * 웨이브 게임용으로 장애물 생성 타이밍과 박자 입력 타이밍을 제공합니다.
   * @param file 사용자가 업로드한 오디오 파일
   * @param difficulty 난이도 (1 ~ 30)
   * @param onProgress 진행률 업데이트 콜백
   */
  const analyzeAudio = async (
    file: File,
    difficulty: number,
    onProgress?: (progress: AnalysisProgress) => void
  ) => {
    if (onProgress) onProgress({ step: '오디오 헤더를 읽는 중...', percent: 5 });

    if (!audioContext.value) {
      audioContext.value = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const arrayBuffer = await file.arrayBuffer();
    if (onProgress) onProgress({ step: '오디오 데이터를 디코딩하는 중...', percent: 15 });

    const audioBuffer = await audioContext.value.decodeAudioData(arrayBuffer);

    const rawData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;

    // Higher resolution for better beat detection
    const step = Math.floor(sampleRate / 150); // 더 높은 해상도

    if (onProgress) onProgress({ step: '최고 음량을 파악하고 있습니다...', percent: 25 });

    // Find peak amplitude
    let peak = 0;
    for (let i = 0; i < rawData.length; i += step) {
      const val = Math.abs(rawData[i] || 0);
      if (val > peak) peak = val;
    }
    if (peak < 0.01) peak = 0.1;

    // 난이도(1~30)에 따른 동적 설정
    const thresholdRate = 0.45 - ((difficulty - 1) / 29) * 0.35;
    const threshold = peak * thresholdRate;
    const minDistance = 0.35 - ((difficulty - 1) / 29) * 0.3;

    if (onProgress) onProgress({ step: '비트 패턴을 분석 중입니다...', percent: 35 });

    if (onProgress) onProgress({ step: '비트 패턴을 분석 중입니다... (Energy Flux)', percent: 35 });

    const obstacles: number[] = [];
    let lastObstacleTime = 0;

    // --- NEW ALGORITHM: ENERGY FLUX (ONSET DETECTION) ---
    // 기존의 단순 볼륨 크기(RMS) 기반이 아닌, "볼륨이 급격히 커지는 순간(Flux)"을 포착합니다.
    // 이는 피아노 건반을 누르는 순간이나 드럼 타격음을 훨씬 정확하게 잡아냅니다.

    const rmsWindow = Math.floor(sampleRate * 0.05); // 50ms window for smoothing
    const hopSize = Math.floor(sampleRate / 100);    // 10ms hop for finer resolution
    const energyProfile: { t: number, e: number }[] = [];

    // 1. Calculate RMS Energy Profile
    let currentSqSum = 0;
    // Initial window
    for (let i = 0; i < Math.min(rmsWindow, rawData.length); i++) {
      currentSqSum += rawData[i]! * rawData[i]!;
    }

    // Sliding window
    for (let i = 0; i < rawData.length - rmsWindow; i += hopSize) {
      const rms = Math.sqrt(currentSqSum / rmsWindow);
      energyProfile.push({ t: i / sampleRate, e: rms });

      // Update sum: subtract leaving samples, add entering samples
      for (let j = 0; j < hopSize; j++) {
        const leave = rawData[i + j] || 0;
        const enter = rawData[i + rmsWindow + j] || 0;
        currentSqSum = currentSqSum - (leave * leave) + (enter * enter);
      }
      if (currentSqSum < 0) currentSqSum = 0; // Floating point error safety
    }

    // 2. Flux Profile & Adaptive Thresholding
    const fluxes: number[] = [];
    for (let i = 1; i < energyProfile.length; i++) {
      const flux = Math.max(0, energyProfile[i]!.e - energyProfile[i - 1]!.e);
      fluxes.push(flux);
    }

    // Adaptive Threshold: Moving Average (Window ~ 1s)
    // hopSize = sampleRate/200 => 5ms. 1s = 200 hops.
    const thresholdWindow = 200;
    const thresholds: number[] = [];
    // Calculate thresholds using centered window approximation
    for (let i = 0; i < fluxes.length; i++) {
      const start = Math.max(0, i - 100);
      const end = Math.min(fluxes.length, i + 100);
      let localSum = 0;
      for (let k = start; k < end; k++) localSum += fluxes[k]!;
      const localAvg = localSum / (end - start);
      thresholds.push(localAvg);
    }

    // Sensitivity based on difficulty
    // Easy: 1.8 (Needs stronger beats)
    // Hard: 1.4 (Detects more details)
    const MULTIPLIER = 1.8 - ((difficulty - 1) / 29) * 0.4;

    // 3. Peak Picking
    for (let i = 1; i < fluxes.length - 1; i++) {
      const flux = fluxes[i]!;
      const threshold = thresholds[i]!;
      const t = energyProfile[i]!.t; // Time at this flux
      const energy = energyProfile[i]!.e;

      // Condition: Flux > Adaptive Threshold AND Local Peak AND Minimum Energy
      if (flux > threshold * MULTIPLIER && energy > 0.02) {
        if (flux > fluxes[i - 1]! && flux > fluxes[i + 1]!) {
          if (t - lastObstacleTime > minDistance) {
            obstacles.push(t);
            lastObstacleTime = t;
          }
        }
      }

      // Progress update
      if (onProgress && i % 1000 === 0) {
        const prog = 35 + (i / fluxes.length) * 40;
        onProgress({ step: '정밀 비트 분석 중... (Adaptive)', percent: Math.floor(prog) });
      }
    }

    console.log(`[AudioAnalyzer] Adaptive Logic Detected ${obstacles.length} beats`);

    if (onProgress) onProgress({ step: '장애물을 최적 배치하고 있습니다...', percent: 75 });

    // No interpolation needed for accurate piano mapping.
    const interpolatedObstacles = [...obstacles];

    if (interpolatedObstacles.length < 10) {
      console.log("Too few beats detected, adding fallback beats...");
      const fallbackInterval = 0.5;
      for (let t = 0; t < audioBuffer.duration; t += fallbackInterval) {
        interpolatedObstacles.push(t);
      }
    }
    interpolatedObstacles.sort((a, b) => a - b);

    if (onProgress) onProgress({ step: 'BPM을 분석하는 중...', percent: 80 });

    // BPM Detection using beat intervals
    let bpm = 120; // Default fallback
    if (obstacles.length >= 4) {
      const intervals: number[] = [];
      for (let i = 1; i < Math.min(obstacles.length, 50); i++) {
        const interval = obstacles[i]! - obstacles[i - 1]!;
        if (interval > 0.2 && interval < 2.0) {
          intervals.push(interval);
        }
      }
      if (intervals.length > 0) {
        // Sort and take median to avoid outliers
        intervals.sort((a, b) => a - b);
        const medianInterval = intervals[Math.floor(intervals.length / 2)]!;
        const rawBpm = 60 / medianInterval;

        // Quantize to common BPM values (round to nearest 5)
        bpm = Math.round(rawBpm / 5) * 5;
        bpm = Math.max(60, Math.min(200, bpm)); // Clamp to reasonable range
      }
    }

    // 한 마디(4박자) 길이 (초)
    const beatLength = 60 / bpm;
    const measureLength = beatLength * 4;

    console.log(`[AudioAnalyzer] Detected BPM: ${bpm}, Measure Length: ${measureLength.toFixed(3)}s`);

    if (onProgress) onProgress({ step: '곡의 분위기 변화를 감지하는 중...', percent: 85 });

    // Section detection
    const sections: SongSection[] = [];
    const macroStep = sampleRate;
    const energyPerSecond: number[] = [];
    for (let i = 0; i < rawData.length; i += macroStep) {
      let sum = 0;
      const limit = Math.min(rawData.length, i + macroStep);
      for (let j = i; j < limit; j++) {
        const val = rawData[j] ?? 0;
        sum += val * val;
      }
      energyPerSecond.push(Math.sqrt(sum / (limit - i || 1)));
    }

    const MIN_SECTION_DURATION = 6;
    let lastSplitIndex = 0;
    let lastAvgEnergy = energyPerSecond[0] || 0.001;
    let currentSectionEnergySum = 0;
    let currentSectionCount = 0;

    for (let t = 0; t < energyPerSecond.length; t++) {
      const energy = energyPerSecond[t] ?? 0;
      currentSectionEnergySum += energy;
      currentSectionCount++;
      const duration = t - lastSplitIndex;
      const energyDiff = Math.abs(energy - lastAvgEnergy) / lastAvgEnergy;
      if (duration >= MIN_SECTION_DURATION && (energyDiff > 0.4 || duration >= 15)) {
        const avgEnergy = currentSectionEnergySum / currentSectionCount;
        sections.push({ startTime: lastSplitIndex, endTime: t, intensity: avgEnergy });
        lastSplitIndex = t;
        currentSectionEnergySum = 0;
        currentSectionCount = 0;
        lastAvgEnergy = avgEnergy || 0.001;
      }
    }

    if (lastSplitIndex < energyPerSecond.length) {
      const avgEnergy = currentSectionCount > 0 ? (currentSectionEnergySum / currentSectionCount) : 0;
      sections.push({ startTime: lastSplitIndex, endTime: audioBuffer.duration, intensity: avgEnergy });
    }

    const maxIntensity = Math.max(...sections.map(s => s.intensity), 0.001);
    sections.forEach(section => { section.intensity = section.intensity / maxIntensity; });

    // 4. Generate Volume Profile (High Resolution: 0.1s) for Map Trend
    if (onProgress) onProgress({ step: '볼륨의 흐름을 분석 중...', percent: 90 });

    const volumeProfile: number[] = [];
    const profileStep = Math.floor(sampleRate / 10); // 0.1s resolution

    let maxProfileEnergy = 0;

    for (let i = 0; i < rawData.length; i += profileStep) {
      const limit = Math.min(rawData.length, i + profileStep);
      let sum = 0;
      for (let j = i; j < limit; j++) {
        const val = rawData[j] || 0;
        sum += val * val;
      }
      const rms = Math.sqrt(sum / (limit - i));
      volumeProfile.push(rms);
      if (rms > maxProfileEnergy) maxProfileEnergy = rms;
    }

    // Normalize Profile
    if (maxProfileEnergy > 0) {
      for (let i = 0; i < volumeProfile.length; i++) {
        volumeProfile[i] = volumeProfile[i]! / maxProfileEnergy;
      }
    }

    if (onProgress) onProgress({ step: '맵 생성을 완료했습니다!', percent: 100 });

    return {
      buffer: audioBuffer,
      obstacles: interpolatedObstacles,
      sections: sections,
      duration: audioBuffer.duration,
      bpm: bpm,
      measureLength: measureLength,
      volumeProfile: volumeProfile // Exported for Trend Logic
    };
  };

  return {
    analyzeAudio
  };
};
