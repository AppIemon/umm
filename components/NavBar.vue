<template>
  <nav class="cyber-nav">
    <div class="brand">
      <div class="logo-wrapper">
        <img src="/umm.png" alt="UMM" class="nav-logo" />
      </div>
    </div>

    <div class="links">
      <NuxtLink to="/" class="nav-item">
        <span class="icon">🏠</span>
        <span class="label">HOME</span>
      </NuxtLink>
      <NuxtLink to="/play" class="nav-item">
        <span class="icon">🎮</span>
        <span class="label">PLAY</span>
      </NuxtLink>
      <NuxtLink to="/maps" class="nav-item">
        <span class="icon">📁</span>
        <span class="label">MAPS</span>
      </NuxtLink>
      <NuxtLink to="/editor" class="nav-item">
        <span class="icon">🛠️</span>
        <span class="label">EDITOR</span>
      </NuxtLink>
      <NuxtLink to="/multiplayer" class="nav-item">
        <span class="icon">⚔️</span>
        <span class="label">MULTI</span>
      </NuxtLink>
      <NuxtLink to="/guide" class="nav-item">
        <span class="icon">📖</span>
        <span class="label">GUIDE</span>
      </NuxtLink>
    </div>

    <div class="user-panel">
      <div v-if="user" class="user-info">
        <span class="username">{{ user.username }}</span>
        <button @click="logout" class="logout-btn">LOGOUT</button>
      </div>
      <div v-else class="auth-btns">
        <NuxtLink to="/login" class="auth-btn login">LOGIN</NuxtLink>
        <NuxtLink to="/register" class="auth-btn register">JOIN</NuxtLink>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuth } from '@/composables/useAuth';

const { user, logout } = useAuth();
const isGuest = computed(() => user.value?.isGuest ?? true);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;700;900&display=swap');

.cyber-nav {
  position: fixed;
  left: 0;
  top: 0;
  width: 250px;
  height: 100vh;
  background: #050510;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  padding: 2rem 1rem;
  z-index: 1000;
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.5);
  font-family: 'Outfit', sans-serif;
}

.brand {
  margin-bottom: 2rem;
  text-align: center;
  padding: 0 1rem;
}

.logo-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}

.nav-logo {
  width: 120px;
  height: auto;
  filter: drop-shadow(0 0 10px rgba(255, 77, 77, 0.4));
  transition: transform 0.3s;
}

.nav-logo:hover {
  transform: scale(1.1) rotate(-5deg);
}

.links {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  color: #666;
  text-decoration: none;
  font-weight: bold;
  border: 1px solid transparent;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}

.nav-item:hover, .nav-item.router-link-active {
  color: white;
  background: rgba(255, 77, 77, 0.05);
  border-color: rgba(255, 77, 77, 0.2);
  box-shadow: 0 0 10px rgba(255, 77, 77, 0.1);
  transform: translateX(5px);
}

.nav-item.router-link-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #ff4d4d;
  box-shadow: 0 0 10px #ff4d4d;
}

.nav-item .icon {
  margin-right: 1rem;
  font-size: 1.2rem;
}

.nav-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.lock-icon {
  margin-left: auto;
  font-size: 0.8rem;
}

.user-panel {
  margin-top: auto;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.user-info {
  text-align: center;
}

.username {
  display: block;
  font-size: 1.2rem;
  color: #4d94ff;
  margin-bottom: 1rem;
  text-transform: uppercase;
  font-weight: 900;
}

.logout-btn {
  background: transparent;
  border: 1px solid #333;
  color: #666;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  border-radius: 4px;
}

.logout-btn:hover {
  background: #222;
  color: white;
  border-color: white;
}

.auth-btns {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.auth-btn {
  display: block;
  text-align: center;
  text-decoration: none;
  padding: 0.8rem;
  font-weight: 900;
  text-transform: uppercase;
  transition: all 0.2s;
  border-radius: 4px;
}

.auth-btn.login {
  border: 1px solid #4d94ff;
  color: #4d94ff;
}

.auth-btn.login:hover {
  background: #4d94ff;
  color: black;
  box-shadow: 0 0 20px rgba(77, 148, 255, 0.4);
}

.auth-btn.register {
  background: rgba(255, 255, 255, 0.05);
  color: white;
  border: 1px solid transparent;
}

.auth-btn.register:hover {
  background: white;
  color: black;
}
</style>
