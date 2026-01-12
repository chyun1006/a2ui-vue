<script setup>
const props = defineProps({
  surfaceId: {
    type: String,
    required: true,
  },
  componentId: {
    type: String,
    required: true,
  },
  manager: {
    type: Object,
    required: true,
  },
  axis: {
    type: String,
    default: 'horizontal',
    validator: (value) => ['horizontal', 'vertical'].includes(value),
  },
})
</script>

<template>
  <div :class="['a2ui-divider', `a2ui-divider--${axis}`]" />
</template>

<style scoped>
.a2ui-divider {
  background: #e0e0e0;
}

.a2ui-divider--horizontal {
  width: 100%;
  height: 1px;
  margin: 16px 0;
}

.a2ui-divider--vertical {
  width: 1px;
  height: 100%;
  margin: 0 16px;
  align-self: stretch;
}
</style>
