<template>
  <div class="editor-page">
    <div class="background-anim"></div>
    <h1 class="glitch-title">TIMING DATA EDITOR</h1>
    <div class="container glass-panel">
      <div class="editor-pane">
        <textarea v-model="levelJson" placeholder="[ 1.0, 1.5, 2.0 ]"></textarea>
        <div class="buttons">
          <button @click="copyJson" class="action-btn">COPY SEQUENCE</button>
        </div>
      </div>
      <div class="help-pane">
        <h3>SEQUENCE FORMAT</h3>
        <pre>
[
  1.234,
  1.850,
  2.450,
  3.100
]
        </pre>
        <p><strong>DATA:</strong> Timestamp Array (Seconds)</p>
        <p>Used for manual Engine Calibration.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const levelJson = ref('[]');
const router = useRouter();

const copyJson = () => {
    navigator.clipboard.writeText(levelJson.value);
    alert("Sequence Copied");
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;700;900&display=swap');

.editor-page {
  background: #050510;
  color: white;
  min-height: 100vh;
  padding: 30px;
  position: relative;
  overflow: hidden;
  font-family: 'Outfit', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.background-anim {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: radial-gradient(circle at 50% 50%, #1a1a3a 0%, #000 100%);
  z-index: 0;
}

.glitch-title {
  z-index: 10;
  font-size: 3rem;
  color: #ff4d4d;
  text-align: center;
  margin-bottom: 2rem;
  font-weight: 900;
  text-shadow: 0 0 20px rgba(255, 77, 77, 0.4);
}

.container {
  z-index: 10;
  display: flex;
  gap: 20px;
  width: 100%;
  max-width: 1000px;
  height: 70vh;
}

.glass-panel {
  background: rgba(20, 20, 30, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 0 50px rgba(0,0,0,0.5);
}

.editor-pane {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

textarea {
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.3);
  color: #4d94ff;
  font-family: monospace;
  border: 1px solid rgba(255,255,255,0.1);
  padding: 1rem;
  border-radius: 8px;
  resize: none;
  font-size: 1rem;
}

textarea:focus {
  outline: none;
  border-color: #4d94ff;
  background: rgba(77, 148, 255, 0.05);
}

.help-pane {
  flex: 1;
  background: rgba(255,255,255,0.03);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.05);
}

h3 {
  color: #888;
  margin-bottom: 1rem;
}

.action-btn {
  padding: 1rem 2rem;
  background: #4d94ff;
  border: none;
  font-weight: 900;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 0 20px rgba(77, 148, 255, 0.3);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(77, 148, 255, 0.5);
}

pre {
  background: rgba(0,0,0,0.5);
  padding: 1rem;
  border-radius: 8px;
  overflow: auto;
  color: #00ff88;
  border: 1px solid rgba(255,255,255,0.1);
}
</style>
