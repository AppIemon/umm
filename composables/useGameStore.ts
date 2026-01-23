
import { useState } from '#app';

export interface GameStoreState {
  song: File | null;
  difficulty: 'very_easy' | 'easy' | 'normal' | 'hard' | 'heaven' | 'crazy' | 'hell' | 'impossible';
  mode: 'single' | 'multi';
  opponentSong: File | null;
}

export const useGameStore = () => {
  return useState<GameStoreState>('game-store', () => ({
    song: null,
    difficulty: 'normal',
    mode: 'single',
    opponentSong: null
  }));
};
