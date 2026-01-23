import { ref } from 'vue';

export interface SongSection {
  startTime: number;
  endTime: number;
  intensity: number; // 0-1
}

export const useAudioAnalyzer = () => {
  const audioContext = ref<AudioContext | null>(null);

  /**
   * 오디오 파일을 분석하여 비트 타이밍 배열을 반환합니다.
   * 웨이브 게임용으로 장애물 생성 타이밍과 박자 입력 타이밍을 제공합니다.
   * @param file 사용자가 업로드한 오디오 파일
   * @param difficulty 난이도 (1 ~ 30)
   */
  const analyzeAudio = async (file: File, difficulty: number) => {
    if (!audioContext.value) {
      audioContext.value = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.value.decodeAudioData(arrayBuffer);

    const rawData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;

    // Higher resolution for better beat detection
    const step = Math.floor(sampleRate / 150); // 더 높은 해상도

    // Find peak amplitude
    let peak = 0;
    for (let i = 0; i < rawData.length; i += step) {
      const val = Math.abs(rawData[i] || 0);
      if (val > peak) peak = val;
    }
    if (peak < 0.01) peak = 0.1;

    // 난이도(1~30)에 따른 동적 설정
    // 1(쉬움) ~ 30(매우 어려움)
    // 1일 때 0.45, 30일 때 0.1 정도로 선형 보간
    const thresholdRate = 0.45 - ((difficulty - 1) / 29) * 0.35;
    const threshold = peak * thresholdRate;

    // minDistance: 1일 때 0.35, 30일 때 0.05
    const minDistance = 0.35 - ((difficulty - 1) / 29) * 0.3;

    const obstacles: number[] = [];
    let lastObstacleTime = 0;

    // Optimized beat detection with sliding window energy approach
    const absData = new Float32Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
      absData[i] = Math.abs(rawData[i] || 0);
    }

    const windowSize = Math.floor(sampleRate * 0.03); // 30ms window
    let currentSum = 0;
    // Initial window sum
    for (let j = 0; j < Math.min(windowSize, absData.length); j++) {
      currentSum += absData[j]!;
    }

    for (let i = 0; i < rawData.length; i += step) {
      const time = i / sampleRate;
      const average = currentSum / windowSize;

      if (average > threshold) {
        if (time - lastObstacleTime > minDistance) {
          obstacles.push(time);
          lastObstacleTime = time;
        }
      }

      // Move window by step
      const limit = Math.min(i + step, rawData.length);
      for (let j = i; j < limit; j++) {
        // Subtract samples leaving the window
        currentSum -= absData[j]!;
        // Add samples entering the window
        const enteringIdx = j + windowSize;
        if (enteringIdx < absData.length) {
          currentSum += absData[enteringIdx]!;
        }
      }
    }

    // 추가: 비트 사이에 보간 (더 많은 장애물)
    const interpolatedObstacles: number[] = [];
    for (let i = 0; i < obstacles.length; i++) {
      const current = obstacles[i];
      if (current === undefined) continue;

      interpolatedObstacles.push(current);

      if (i < obstacles.length - 1) {
        const next = obstacles[i + 1];
        if (next === undefined) continue;

        const gap = next - current;

        // 큰 간격이면 중간에 비트 추가
        if (gap > minDistance * 2.5) {
          const midPoint = current + gap / 2;
          interpolatedObstacles.push(midPoint);
        }

        // 더 큰 간격이면 더 많이 추가
        if (gap > minDistance * 4) {
          interpolatedObstacles.push(current + gap / 3);
          interpolatedObstacles.push(current + gap * 2 / 3);
        }
      }
    }

    interpolatedObstacles.sort((a, b) => a - b);

    // Fallback: 비트가 너무 적으면 추가 생성
    if (interpolatedObstacles.length < 30) {
      const interval = minDistance * 1.2;
      for (let t = 0.5; t < audioBuffer.duration - 0.5; t += interval) {
        // 기존 비트와 겹치지 않으면 추가
        const tooClose = interpolatedObstacles.some(b => Math.abs(b - t) < minDistance * 0.8);
        if (!tooClose) {
          interpolatedObstacles.push(t);
        }
      }
      interpolatedObstacles.sort((a, b) => a - b);
    }

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
      const rms = Math.sqrt(sum / (limit - i || 1));
      energyPerSecond.push(rms);
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
      const isBigChange = energyDiff > 0.4;

      if (duration >= MIN_SECTION_DURATION && (isBigChange || duration >= 15)) {
        const avgEnergy = currentSectionEnergySum / currentSectionCount;

        sections.push({
          startTime: lastSplitIndex,
          endTime: t,
          intensity: avgEnergy
        });

        lastSplitIndex = t;
        currentSectionEnergySum = 0;
        currentSectionCount = 0;
        lastAvgEnergy = avgEnergy || 0.001;
      }
    }

    if (lastSplitIndex < energyPerSecond.length) {
      const avgEnergy = currentSectionCount > 0 ? (currentSectionEnergySum / currentSectionCount) : 0;
      sections.push({
        startTime: lastSplitIndex,
        endTime: audioBuffer.duration,
        intensity: avgEnergy
      });
    }

    // Normalize intensities
    const maxIntensity = Math.max(...sections.map(s => s.intensity), 0.001);
    sections.forEach(section => {
      section.intensity = section.intensity / maxIntensity;
    });

    console.log(`[AudioAnalyzer] Detected ${interpolatedObstacles.length} beats for difficulty: ${difficulty}`);

    return {
      buffer: audioBuffer,
      obstacles: interpolatedObstacles,
      sections: sections,
      duration: audioBuffer.duration
    };
  };

  return {
    analyzeAudio
  };
};
