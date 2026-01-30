<template>
  <div class="landscape-overlay">
    <div class="content">
      <div class="icon">📱</div>
      <h1>PLEASE ROTATE YOUR DEVICE</h1>
      <p>This game is designed for landscape mode.</p>
    </div>
  </div>
</template>

<style scoped>
.landscape-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  z-index: 9999;
  display: none; /* Hidden by default */
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
}

.content {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: pulse 2s infinite;
}

.icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: rotate 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
}

h1 {
  font-family: 'Outfit', sans-serif;
  font-weight: 900;
  color: #00ffff;
  margin-bottom: 0.5rem;
}

p {
  font-family: 'Outfit', sans-serif;
  color: #888;
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(90deg); }
  100% { transform: rotate(90deg); }
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(0, 255, 255, 0.1); }
  70% { box-shadow: 0 0 0 20px rgba(0, 255, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 255, 255, 0); }
}

/* Show only on portrait mobile devices */
@media screen and (orientation: portrait) and (max-width: 1024px) {
  .landscape-overlay {
    display: flex;
  }
}
</style>
