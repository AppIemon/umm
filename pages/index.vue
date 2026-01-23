<template>
  <div class="menu-container">
    <!-- Animated background waves -->
    <div class="wave-bg">
      <div class="wave wave1"></div>
      <div class="wave wave2"></div>
      <div class="wave wave3"></div>
    </div>
    
    <div class="hero-content">
      <div class="logo-container">
        <div class="wave-icon-large">◆</div>
        <h1 class="game-title-main">ULTRA MUSIC MANIA</h1>
      </div>
      <p class="subtitle">GEOMETRY • RHYTHM • WAVE</p>
      
      <div class="actions">
        <NuxtLink to="/play" class="play-btn-large">SINGLE PLAY</NuxtLink>
        <NuxtLink to="/multiplayer" class="play-btn-large secondary">MULTIPLAYER</NuxtLink>
      </div>

      <div class="user-preview" v-if="user">
        <span class="welcome">WELCOME, <strong>{{ user.username }}</strong></span>
        <div class="user-stats">
          <span class="rating">RATING: {{ user.rating || 1000 }}</span>
          <NuxtLink to="/mypage" class="profile-link">[ PROFILE ]</NuxtLink>
        </div>
      </div>
      <div class="auth-actions" v-else>
        <NuxtLink to="/login" class="auth-btn">LOGIN</NuxtLink>
        <NuxtLink to="/register" class="auth-btn">REGISTER</NuxtLink>
      </div>

      <div class="stats-preview">
        <div class="stat-box">
          <span class="val">{{ user?.matchHistory?.length || 0 }}</span>
          <span class="lbl">BATTLES</span>
        </div>
        <div class="stat-box">
          <span class="val">WAVE</span>
          <span class="lbl">MODE</span>
        </div>
        <div class="stat-box">
          <span class="val">{{ user?.rating || 1000 }}</span>
          <span class="lbl">SKILL</span>
        </div>
      </div>
      
      <div class="how-to-play">
        <h3>HOW TO PLAY</h3>
        <p>클릭/터치 유지 = 위로 이동</p>
        <p>해제 = 아래로 이동</p>
        <p>장애물을 피해 끝까지 도달하세요!</p>
      </div>
    </div>
    
    <!-- Floating particles -->
    <div class="particles">
      <div class="particle p1"></div>
      <div class="particle p2"></div>
      <div class="particle p3"></div>
      <div class="particle p4"></div>
      <div class="particle p5"></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useAuth } from '@/composables/useAuth';
const { user } = useAuth();
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;700;900&display=swap');

.menu-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a1a 0%, #1a0a2a 50%, #0a1a2a 100%);
  color: white;
  font-family: 'Outfit', sans-serif;
  overflow: hidden;
  position: relative;
}

.wave-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.wave {
  position: absolute;
  width: 200%;
  height: 200%;
  background: radial-gradient(ellipse at center, transparent 0%, rgba(0, 255, 255, 0.03) 50%, transparent 70%);
  animation: waveMove 15s linear infinite;
}

.wave1 {
  top: -50%;
  left: -50%;
  animation-duration: 20s;
}

.wave2 {
  top: -30%;
  left: -30%;
  animation-duration: 15s;
  animation-delay: -5s;
  background: radial-gradient(ellipse at center, transparent 0%, rgba(255, 0, 255, 0.03) 50%, transparent 70%);
}

.wave3 {
  top: -40%;
  left: -40%;
  animation-duration: 25s;
  animation-delay: -10s;
}

@keyframes waveMove {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.hero-content {
  text-align: center;
  max-width: 800px;
  z-index: 10;
  position: relative;
  padding: 2rem;
}

.logo-container {
  margin-bottom: 1.5rem;
  animation: float 4s ease-in-out infinite;
}

.wave-icon-large {
  font-size: 8rem;
  color: transparent;
  background: linear-gradient(135deg, #00ffff 0%, #ff00ff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  text-shadow: 0 0 50px rgba(0, 255, 255, 0.5);
  animation: iconPulse 2s ease-in-out infinite;
  transform: rotate(-45deg);
  display: inline-block;
}

.game-title-main {
  font-size: 4.5rem;
  font-weight: 900;
  margin: 0.5rem 0;
  background: linear-gradient(135deg, #00ffff 0%, #ff00ff 50%, #00ffff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% 200%;
  animation: gradientShift 3s ease infinite;
  letter-spacing: 4px;
  text-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes iconPulse {
  0%, 100% { 
    transform: rotate(-45deg) scale(1);
    filter: drop-shadow(0 0 20px rgba(0, 255, 255, 0.5));
  }
  50% { 
    transform: rotate(-45deg) scale(1.1);
    filter: drop-shadow(0 0 40px rgba(255, 0, 255, 0.7));
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.subtitle {
  font-size: 1.1rem;
  color: #888;
  letter-spacing: 10px;
  margin-bottom: 2.5rem;
  text-transform: uppercase;
  font-weight: 300;
}

.actions {
  margin-bottom: 3rem;
}

.play-btn-large {
  display: inline-block;
  padding: 1.2rem 4rem;
  font-size: 1.8rem;
  font-weight: 900;
  color: #000;
  background: linear-gradient(135deg, #00ffff 0%, #ff00ff 100%);
  text-decoration: none;
  border: none;
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 4px;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  z-index: 1;
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.4), 0 0 60px rgba(255, 0, 255, 0.2);
  border-radius: 8px;
}

.play-btn-large:hover {
  transform: scale(1.08) translateY(-3px);
  box-shadow: 0 0 50px rgba(0, 255, 255, 0.6), 0 0 100px rgba(255, 0, 255, 0.4);
}

.play-btn-large:active {
  transform: scale(1.02);
}

.play-btn-large.secondary {
  background: transparent;
  color: #fff;
  border: 2px solid #ff00ff;
  box-shadow: 0 0 20px rgba(255, 0, 255, 0.3);
  margin-left: 1rem;
}

.play-btn-large.secondary:hover {
  background: rgba(255, 0, 255, 0.1);
  box-shadow: 0 0 40px rgba(255, 0, 255, 0.5);
}

.user-preview {
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(255,255,255,0.05);
  border-radius: 12px;
  display: inline-block;
  border-left: 4px solid #00ffff;
}

.welcome {
  display: block;
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 0.5rem;
}

.user-stats {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.rating {
  font-weight: 900;
  color: #00ffff;
  font-size: 1.2rem;
}

.profile-link {
  color: #888;
  text-decoration: none;
  font-size: 0.8rem;
  transition: color 0.2s;
}

.profile-link:hover {
  color: #fff;
}

.auth-actions {
  margin-bottom: 2rem;
  display: flex;
  gap: 2rem;
  justify-content: center;
}

.auth-btn {
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: bold;
  letter-spacing: 2px;
  transition: color 0.2s;
}

.auth-btn:hover {
  color: #4d94ff;
}

.stats-preview {
  display: flex;
  justify-content: center;
  gap: 4rem;
  margin-bottom: 3rem;
}

.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
}

.val {
  font-size: 2rem;
  font-weight: 900;
  background: linear-gradient(135deg, #00ffff 0%, #ff00ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.lbl {
  font-size: 0.75rem;
  color: #666;
  letter-spacing: 3px;
  margin-top: 5px;
}

.how-to-play {
  background: rgba(0, 0, 0, 0.3);
  padding: 1.5rem 2.5rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.how-to-play h3 {
  color: #00ffff;
  margin: 0 0 1rem 0;
  letter-spacing: 3px;
  font-size: 1rem;
}

.how-to-play p {
  color: #aaa;
  margin: 0.5rem 0;
  font-size: 0.9rem;
}

.particles {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
}

.particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: #00ffff;
  border-radius: 50%;
  opacity: 0.6;
  animation: particleFloat 10s ease-in-out infinite;
}

.p1 { left: 10%; top: 20%; animation-delay: 0s; background: #00ffff; }
.p2 { left: 80%; top: 30%; animation-delay: -2s; background: #ff00ff; }
.p3 { left: 30%; top: 70%; animation-delay: -4s; background: #00ffff; }
.p4 { left: 70%; top: 60%; animation-delay: -6s; background: #ff00ff; }
.p5 { left: 50%; top: 40%; animation-delay: -8s; background: #ffffff; }

@keyframes particleFloat {
  0%, 100% { 
    transform: translateY(0) translateX(0);
    opacity: 0.6;
  }
  25% { 
    transform: translateY(-30px) translateX(20px);
    opacity: 1;
  }
  50% { 
    transform: translateY(-10px) translateX(-15px);
    opacity: 0.4;
  }
  75% { 
    transform: translateY(-50px) translateX(10px);
    opacity: 0.8;
  }
}

@media (max-width: 768px) {
  .game-title-main {
    font-size: 2.5rem;
  }
  
  .wave-icon-large {
    font-size: 5rem;
  }
  
  .play-btn-large {
    padding: 1rem 2.5rem;
    font-size: 1.2rem;
  }
  
  .stats-preview {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
