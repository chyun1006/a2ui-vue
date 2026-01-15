<script setup>
import { computed, watch } from 'vue'
import A2UIProvider from './A2UIProvider.vue'
import A2UIRenderer from './A2UIRenderer.vue'

const props = defineProps({
  surface: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['action', 'error'])

// 直接使用传入的surface对象
const surfaceObj = computed(() => props.surface)

const rootComponentId = computed(() => surfaceObj.value?.root)

const styles = computed(() => surfaceObj.value?.styles || {})

const cssVariables = computed(() => {
  const vars = {}

  if (styles.value.primaryColor) {
    vars['--primary-color'] = styles.value.primaryColor
  }

  if (styles.value.font) {
    vars['--font-family'] = styles.value.font
  }

  return vars
})

const handleAction = (actionData) => {
  emit('action', actionData)
}

// 移除manager相关的生命周期钩子
// 不再需要监听surface更新，因为surface是通过prop传入的响应式对象

watch(
  () => props.surface,
  (newSurface) => {
    console.log('Surface changed:', newSurface?.id)
    console.log('Surface root:', newSurface?.root)
    console.log('Surface components:', newSurface?.components)
    console.log('Full surface object:', newSurface)
  },
  { immediate: true },
)
</script>

<template>
  <div v-if="surfaceObj && rootComponentId" class="a2ui-surface" :style="cssVariables">
    <A2UIProvider :surface="surfaceObj">
      <A2UIRenderer :component-id="rootComponentId" @action="handleAction" />
    </A2UIProvider>
  </div>
  <div v-else-if="!surfaceObj" class="a2ui-surface-error">Surface object is missing</div>
  <div v-else class="a2ui-surface-loading">Loading surface...</div>
</template>

<style scoped>
.a2ui-surface {
  font-family: var(
    --font-family,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    sans-serif
  );
  color: #333;
  line-height: 1.5;
}

.a2ui-surface-error {
  padding: 16px;
  background: #fee;
  border: 2px solid #fcc;
  border-radius: 8px;
  color: #c00;
  font-weight: 500;
}

.a2ui-surface-loading {
  padding: 16px;
  text-align: center;
  color: #666;
}
</style>
