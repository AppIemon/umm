import { ref } from 'vue';

// Wave game settings
const playerColor = ref('#00ffff');
const trailColor = ref('#ff00ff');
const obstacleColor = ref('#ff4444');

// Persist settings
if (typeof localStorage !== 'undefined') {
  const saved = localStorage.getItem('wave_game_settings');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      playerColor.value = parsed.playerColor || '#00ffff';
      trailColor.value = parsed.trailColor || '#ff00ff';
      obstacleColor.value = parsed.obstacleColor || '#ff4444';
    } catch (e) { }
  }
}

const saveSettings = () => {
  localStorage.setItem('wave_game_settings', JSON.stringify({
    playerColor: playerColor.value,
    trailColor: trailColor.value,
    obstacleColor: obstacleColor.value
  }));
};

export const useGameSettings = () => {
  return {
    playerColor,
    trailColor,
    obstacleColor,
    saveSettings
  };
};
