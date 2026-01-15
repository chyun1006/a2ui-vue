<script setup>
import { ref, onMounted } from "vue";
import { createSignalA2uiMessageProcessor, a2uiRender } from "a2ui-vue";
import demoMessages from "../../mock/comprehensive-demo.json";

// 创建processor
const processor = createSignalA2uiMessageProcessor({ useGlobalManager: true });

// 存储Surface对象数组
const demoSurfaces = ref([]);

onMounted(() => {
  console.log("Loading comprehensive demo messages...");
  // 处理A2UI JSON，获取Surface对象数组
  const surfaces = processor.processMessages(demoMessages);
  demoSurfaces.value = surfaces;
  console.log("Loaded surfaces:", surfaces);
});

const handleAction = (event) => {
  console.log("Action triggered:", event);
};
</script>

<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-6xl mx-auto">
      <a2uiRender :surfaceList="demoSurfaces" @action="handleAction" />
    </div>
  </div>
</template>
