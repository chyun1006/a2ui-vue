<script setup>
import { computed, watch, onMounted, onUnmounted } from 'vue'
import A2UIRenderer from './A2UIRenderer.vue'

const props = defineProps({
  surfaceId: {
    type: String,
    required: true,
  },
  manager: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['action', 'error'])

const surface = computed(() => props.manager.getSurface(props.surfaceId))

const rootComponentId = computed(() => surface.value?.rootComponentId)

const styles = computed(() => surface.value?.styles || {})

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

let unsubscribe = null

onMounted(() => {
  unsubscribe = props.manager.on('surface:updated', (data) => {
    if (data.surfaceId === props.surfaceId) {
      console.log('Surface updated:', data)
    }
  })
})

watch(
  () => props.surfaceId,
  (newId) => {
    console.log('Surface changed:', newId)
  },
  { immediate: true },
)

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})
</script>

<template>
  <div v-if="surface && rootComponentId" class="a2ui-surface" :style="cssVariables">
    <A2UIRenderer
      :surface-id="surfaceId"
      :component-id="rootComponentId"
      :manager="manager"
      @action="handleAction"
    />
  </div>
  <div v-else-if="!surface" class="a2ui-surface-error">Surface not found: {{ surfaceId }}</div>
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
