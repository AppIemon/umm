<template>
  <div class="layout-container">
    <NavBar />
    <div class="content-area">
      <slot />
    </div>
  </div>
</template>

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
</style>
