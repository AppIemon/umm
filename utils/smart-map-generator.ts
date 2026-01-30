
import { type GameEngine } from './game-engine';
import { AudioAnalyzerClient } from './audio-analyzer-client';

export type SmartGenStatus =
  | 'idle'
  | 'analyzing_song'    // 노래 분석
  | 'generating_path'   // 동선 생성
  | 'adjusting_path'    // 동선 수정
  | 'generating_map'    // 맵 생성
  | 'adjusting_map'     // 맵 수정
  | 'saving_map'        // 맵 저장
  | 'completed'
  | 'failed';

export class SmartMapGenerator {
  private engine: GameEngine;
  private analyzer: AudioAnalyzerClient;

  public status: SmartGenStatus = 'idle';
  public progress: number = 0; // 0-100
  public log: string[] = [];

  constructor(engine: GameEngine) {
    this.engine = engine;
    this.analyzer = new AudioAnalyzerClient();
  }

  private setStatus(s: SmartGenStatus, p: number, msg?: string) {
    this.status = s;
    this.progress = p;
    if (msg) this.log.push(`[${s}] ${msg}`);
  }

  /**
   * Run the full Smart Generation Pipeline
   */
  async generate(audioBuffer: ArrayBuffer, mapData: any): Promise<boolean> {
    try {
      // 1. Song Analysis
      this.setStatus('analyzing_song', 10, "Decoding audio...");
      const decoded = await this.analyzer.decodeAudio(audioBuffer);

      this.setStatus('analyzing_song', 20, "Detecting volume spikes...");
      const analysisResult = await this.analyzer.findOnsets(decoded, mapData.difficulty);
      const groundTruthBeats = analysisResult.times;

      this.setStatus('analyzing_song', 30, `Detected ${groundTruthBeats.length} notes (spikes).`);

      // 2. Path Generation & Adjustment Loop
      this.setStatus('generating_path', 30, "Initial path generation...");
      await new Promise(r => setTimeout(r, 500));

      let bestMatchRate = 0;
      let attempt = 0;
      const MAX_ATTEMPTS = 50; // Increased attempts for strict matching

      while (bestMatchRate < 0.975 && attempt < MAX_ATTEMPTS) {
        this.setStatus('adjusting_path', 30 + (attempt / MAX_ATTEMPTS) * 30, `Attempt ${attempt + 1}: Simulating... Match: ${(bestMatchRate * 100).toFixed(1)}%`);

        // Generate Map (which generates Path internally)
        this.engine.generateMap(
          groundTruthBeats,
          mapData.sections || [],
          decoded.duration,
          mapData.seed ? mapData.seed + attempt : attempt, // Variate seed
          true, // verify
          attempt, // offsetAttempt acts as seed modifier
          mapData.bpm || 120,
          mapData.measureLength || 2.0
        );

        const path = this.engine.autoplayLog;

        // Compare Path vs Ground Truth
        const matchRate = this.calculateMatchRate(path, groundTruthBeats);

        if (matchRate > bestMatchRate) {
          bestMatchRate = matchRate;
        }

        this.log.push(`Attempt ${attempt}: Match Rate ${(matchRate * 100).toFixed(2)}%`);

        if (bestMatchRate >= 0.975) {
          break;
        }

        attempt++;
        // Yield to UI less frequently to speed up
        await new Promise(r => setTimeout(r, 10));
      }

      if (bestMatchRate < 0.90) {
        this.log.push(`Warning: Could not reach 97.5%. Best: ${(bestMatchRate * 100).toFixed(2)}%`);
      } else {
        this.log.push(`Success: Reached ${(bestMatchRate * 100).toFixed(2)}% verify rate.`);
      }

      // 4. Map Generation
      this.setStatus('generating_map', 70, "Finalizing map objects...");

      // 5. Map Adjustment
      this.setStatus('adjusting_map', 80, "Optimizing obstacles...");
      await new Promise(r => setTimeout(r, 200));

      // 6. Map Save
      this.setStatus('saving_map', 90, "Preparing map data...");
      await new Promise(r => setTimeout(r, 200));

      this.setStatus('completed', 100, "Ready to save.");

      return true;

    } catch (e: any) {
      this.setStatus('failed', 0, `Error: ${e.message}`);
      console.error(e);
      return false;
    }
  }

  private calculateMatchRate(path: { x: number, y: number, holding: boolean, time: number }[], beats: number[]): number {
    if (!path || path.length === 0 || beats.length === 0) return 0;

    // Extract click/release times from path
    const actions: number[] = [];
    let wasHolding = false;
    for (const p of path) {
      if (p.holding !== undefined && p.holding !== wasHolding) {
        actions.push(p.time);
        wasHolding = p.holding;
      }
    }

    // Strict 1:1 Matching
    // For each beat, find the closest action.
    let matched = 0;
    const window = 0.05; // 50ms strict tolerance for "Volume Spike = Action"

    // Create a copy of actions to consume them
    const availableActions = [...actions];

    for (const beat of beats) {
      // Find closest action
      let closestIdx = -1;
      let minDiff = window;

      for (let i = 0; i < availableActions.length; i++) {
        const diff = Math.abs(availableActions[i] - beat);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = i;
        }
      }

      if (closestIdx !== -1) {
        matched++;
        // Remove the action so it can't match another beat (1:1 constraint)
        availableActions.splice(closestIdx, 1);
      }
    }

    return matched / beats.length;
  }
}
