<template>
  <div class="game-layout">
    <LandscapeOverlay />
    <slot />
  </div>
</template>

<style>
.game-layout {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
}
</style>
