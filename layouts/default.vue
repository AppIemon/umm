<template>
  <div class="layout-container">
    <LandscapeOverlay />
    <NavBar v-if="showNavbar" />
    <div class="content-area" :class="{ 'full-width': !showNavbar }">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const showNavbar = useState('showNavbar', () => true)
</script>

<style>
/* Global resets */
body, html {
  margin: 0;
  padding: 0;
  background: #000;
  color: white;
  font-family: 'Segoe UI', sans-serif;
  overflow-x: hidden;
}

.layout-container {
  display: flex;
  min-height: 100vh;
}

.content-area {
  flex: 1;
  margin-left: 250px; /* Navbar width */
  position: relative;
  min-height: 100vh;
  transition: margin-left 0.3s;
}

.content-area.full-width {
  margin-left: 0 !important;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #111;
}
::-webkit-scrollbar-thumb {
  background: #333;
}
::-webkit-scrollbar-thumb:hover {
  background: #00ff88;
}

@media (max-width: 1024px) {
  .content-area {
    margin-left: 70px; /* Collapsed navbar width */
  }
}

@media (max-width: 768px) {
  .content-area {
    margin-left: 70px; /* Keep space for icon bar or 0 if we hide it completely */
    margin-bottom: 60px;
  }

  .content-area.full-width {
    margin-left: 0 !important;
    margin-bottom: 0 !important;
  }
  
  .layout-container {
    flex-direction: column;
  }
}
</style>
