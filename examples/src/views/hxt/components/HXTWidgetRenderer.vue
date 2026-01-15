<script setup>
import { computed } from "vue";
import * as LucideIcons from "lucide-vue-next";

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
});

// Recursive self-reference
const HXTWidgetRenderer = "hxt-widget-renderer";

const type = computed(() => props.node.type);
const style = computed(() => props.node.style || {});
const className = computed(() => style.value.className || "");
const properties = computed(() => props.node.props || {});
const children = computed(() => props.node.children || []);

const iconComponent = computed(() => {
  if (type.value === "icon" && properties.value.iconName) {
    return LucideIcons[properties.value.iconName] || LucideIcons.HelpCircle;
  }
  return null;
});

// Mock chart - simple bar chart using CSS
const isChart = computed(() => type.value === "chart");
const chartData = computed(() => properties.value.chartData || []);

const handleOnClick = () => {
  if (properties.value.onClickIntent) {
    console.log("Widget Action:", properties.value.onClickIntent);
    // In a real app, emit event up
  }
};
</script>

<template>
  <!-- Container -->
  <div v-if="type === 'container'" :class="className">
    <HXTWidgetRenderer v-for="(child, idx) in children" :key="idx" :node="child" />
  </div>

  <!-- Text -->
  <span v-else-if="type === 'text'" :class="className">
    {{ properties.text }}
  </span>

  <!-- Icon -->
  <component v-else-if="type === 'icon'" :is="iconComponent" :class="className" />

  <!-- Button -->
  <button v-else-if="type === 'button'" :class="className" @click="handleOnClick">
    {{ properties.text }}
  </button>

  <!-- Badge -->
  <span v-else-if="type === 'badge'" :class="className">
    {{ properties.text }}
  </span>

  <!-- Chart (Simple Mock) -->
  <div
    v-else-if="type === 'chart'"
    class="flex items-end gap-1 h-full w-full"
    :style="{ height: properties.height || '100px' }"
  >
    <div
      v-for="(d, i) in chartData"
      :key="i"
      class="bg-blue-100 rounded-t-sm flex-1 relative group"
      :style="{ height: d.value + '%' }"
    >
      <div
        class="absolute bottom-full mb-1 text-[8px] text-slate-400 hidden group-hover:block w-full text-center"
      >
        {{ d.value }}
      </div>
    </div>
  </div>

  <!-- Fallback -->
  <div v-else class="text-red-500 text-xs">Unknown: {{ type }}</div>
</template>

<script>
export default {
  name: "HXTWidgetRenderer",
};
</script>
