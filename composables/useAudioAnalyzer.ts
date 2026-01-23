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

    const obstacles: number[] = [];
    let lastObstacleTime = 0;

    // Optimized beat detection with sliding window energy approach
    const absData = new Float32Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
      // We can skip this full loop if memory is tight, but Float32Array is faster for lookups
      absData[i] = Math.abs(rawData[i] || 0);
    }

    const windowSize = Math.floor(sampleRate * 0.03); // 30ms window
    let currentSum = 0;
    // Initial window sum
    for (let j = 0; j < Math.min(windowSize, absData.length); j++) {
      currentSum += absData[j]!;
    }

    const totalIterations = rawData.length / step;
    let iterations = 0;

    for (let i = 0; i < rawData.length; i += step) {
      iterations++;
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
        currentSum -= absData[j]!;
        const enteringIdx = j + windowSize;
        if (enteringIdx < absData.length) {
          currentSum += absData[enteringIdx]!;
        }
      }

      // Update progress every 10% of this loop (covering 35% to 70% range)
      if (onProgress && iterations % Math.floor(totalIterations / 10) === 0) {
        const loopPercent = (iterations / totalIterations) * 35;
        onProgress({
          step: '비트 패턴을 분석 중입니다...',
          percent: Math.floor(35 + loopPercent)
        });
      }
    }

    if (onProgress) onProgress({ step: '장애물을 최적 배치하고 있습니다...', percent: 75 });

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
        if (gap > minDistance * 2.5) {
          interpolatedObstacles.push(current + gap / 2);
        }
        if (gap > minDistance * 4) {
          interpolatedObstacles.push(current + gap / 3);
          interpolatedObstacles.push(current + gap * 2 / 3);
        }
      }
    }

    interpolatedObstacles.sort((a, b) => a - b);

    if (interpolatedObstacles.length < 30) {
      const interval = minDistance * 1.2;
      for (let t = 0; t < audioBuffer.duration; t += interval) {
        const tooClose = interpolatedObstacles.some(b => Math.abs(b - t) < minDistance * 0.8);
        if (!tooClose) interpolatedObstacles.push(t);
      }
      interpolatedObstacles.sort((a, b) => a - b);
    }

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

    if (onProgress) onProgress({ step: '맵 생성을 완료했습니다!', percent: 100 });

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
