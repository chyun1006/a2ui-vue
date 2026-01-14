<template>
  <Transition name="fade">
    <div v-if="visible" class="loading-mask">
      <div class="loading-content">
        <div class="spinner"></div>
        <p v-if="text" class="loading-text">{{ text }}</p>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  text: {
    type: String,
    default: "加载中...",
  },
});
</script>

<style scoped>
.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* background-color: rgba(0, 0, 0, 0.5); */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  /* backdrop-filter: blur(2px); */
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(27, 195, 5, 0.581);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #fff;
  font-size: 16px;
  margin: 0;
  font-weight: 500;
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
