<script setup>
import { computed } from "vue";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  mode: {
    type: String,
    default: "business", // 'business' or 'media'
  },
  title: {
    type: String,
    default: "",
  },
  items: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["itemClick"]);

const containerClass = computed(() => {
  if (props.mode === "business") {
    return `absolute bottom-20 left-4 right-4 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-100 p-4 transition-all duration-300 origin-bottom-right z-50 ${
      props.isOpen
        ? "opacity-100 scale-100 translate-y-0"
        : "opacity-0 scale-95 translate-y-4 pointer-events-none"
    }`;
  } else {
    // media mode (expands the footer)
    return `overflow-hidden transition-all duration-300 ease-in-out bg-slate-50/50 ${
      props.isOpen ? "max-h-60 border-t border-slate-100 opacity-100" : "max-h-0 opacity-0"
    }`;
  }
});

const gridClass = computed(() => {
  return props.mode === "business" ? "grid grid-cols-4 gap-4" : "grid grid-cols-4 gap-4 p-4";
});
</script>

<template>
  <div :class="containerClass">
    <div v-if="title" class="text-xs font-bold text-slate-400 mb-3 px-1">{{ title }}</div>
    <div :class="gridClass">
      <button
        v-for="item in items"
        :key="item.id"
        @click="emit('itemClick', item)"
        class="flex flex-col items-center gap-2 group active:scale-95 transition-transform"
      >
        <div
          class="w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-sm group-hover:shadow-md border border-slate-100"
          :class="[
            mode === 'business'
              ? 'bg-white text-blue-600 group-hover:bg-blue-50 group-hover:border-blue-200'
              : 'bg-white text-slate-600 group-hover:bg-slate-100',
          ]"
        >
          <!-- Dynamic Icon Component -->
          <component :is="item.icon" :class="mode === 'business' ? 'w-6 h-6' : 'w-5 h-5'" />
        </div>
        <span class="text-[10px] font-medium text-slate-600">{{ item.label }}</span>
      </button>
    </div>
  </div>
</template>
