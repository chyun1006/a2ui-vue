<script setup>
import { RouterView } from "vue-router";
import AppNavigation from "../components/AppNavigation.vue";
</script>

<template>
  <div id="app">
    <AppNavigation />
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial,
    sans-serif;
  background: #f5f5f5;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  /* flex: 1; */
  /* padding: 20px; */
}
</style>
