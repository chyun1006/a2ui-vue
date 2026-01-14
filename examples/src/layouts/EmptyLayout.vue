<script setup>
import { RouterView } from "vue-router";
</script>

<template>
  <RouterView />
</template>

<style>
#app-empty {
  height: 100vh;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background: #ffffff;
}
</style>
