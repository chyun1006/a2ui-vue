<script setup>
import { computed } from "vue";
import { User, Sparkles, Loader2 } from "lucide-vue-next";
// import HongXiaoTongLogo from "./HongXiaoTongLogo.vue";
import HXTWidgetRenderer from "./HXTWidgetRenderer.vue";
import { a2uiRender } from "a2ui-vue";

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
  manager: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["actionClick"]); // Propagate actions

const isUser = computed(() => props.message.sender === "USER");
const isAgent = computed(() => props.message.sender === "AGENT");
const isLoader = computed(() => props.message.type === "LOADER");

const timeString = computed(() => {
  if (!props.message.timestamp) return "";
  return new Date(props.message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
});
</script>

<template>
  <div
    class="mb-6 flex w-full animate-fade-in-up"
    :class="isUser ? 'justify-end' : 'justify-start'"
  >
    <!-- User Avatar (Right) -->
    <!-- Not strictly needed as per most chat UIs, usually just bubble. React code doesn't show user avatar?
         Checked React code: NO user avatar shown, just bubble. Agent HAS avatar.
    -->

    <!-- Agent Avatar (Left) -->
    <div
      v-if="isAgent || isLoader"
      class="w-8 h-8 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center mr-2 shrink-0 overflow-hidden"
    >
      <!-- <HongXiaoTongLogo class="w-5 h-5" /> -->
      <img src="@/assets/logo.png" alt="" srcset="" />
    </div>

    <!-- Message Content -->
    <div class="max-w-[85%] flex flex-col" :class="isUser ? 'items-end' : 'items-start'">
      <!-- Sender Name (Agent only) -->
      <span v-if="isAgent" class="text-[10px] text-slate-400 mb-1 ml-1"
        >鸿小通 {{ timeString }}</span
      >

      <!-- Loader -->
      <div
        v-if="isLoader"
        class="bg-white border border-slate-100 rounded-bl-2xl rounded-tr-2xl rounded-br-2xl p-4 shadow-sm"
      >
        <div class="flex items-center gap-2 text-slate-500 text-xs">
          <Loader2 class="w-4 h-4 animate-spin text-blue-500" />
          <span>正在思考...</span>
        </div>
      </div>

      <!-- User Text Bubble -->
      <div
        v-else-if="isUser"
        class="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-md text-sm leading-relaxed"
      >
        {{ message.content }}
      </div>

      <!-- Agent Widget/Content -->
      <div v-else class="flex flex-col gap-2 w-full">
        <!-- Thought/Reasoning (Optional) -->
        <div
          v-if="message.thought"
          class="bg-indigo-50/50 rounded-xl p-3 border border-indigo-100/50 inline-block w-full"
        >
          <div class="flex items-center gap-1.5 mb-1">
            <Sparkles class="w-3 h-3 text-indigo-400" />
            <span class="text-[10px] font-bold text-indigo-400 uppercase tracking-wide"
              >Thought Process</span
            >
          </div>
          <p class="text-[11px] text-indigo-800/80 leading-relaxed italic">{{ message.thought }}</p>
        </div>

        <!-- Main Content -->
        <div
          class="bg-white border border-slate-200 rounded-bl-2xl rounded-tr-2xl rounded-br-2xl p-1 shadow-sm overflow-hidden w-full"
        >
          <!-- Widget Header -->
          <div
            v-if="message.widgetPayload?.title"
            class="px-4 py-2 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center"
          >
            <span class="text-xs font-bold text-slate-500">{{ message.widgetPayload.title }}</span>
            <span class="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-bold"
              >A2UI</span
            >
          </div>

          <!-- Render Widget Root Node -->
          <div class="p-3">
            <div
              v-if="message.content && !message.widgetPayload"
              class="text-sm text-slate-700 whitespace-pre-wrap"
            >
              {{ message.content }}
            </div>

            <!-- <HXTWidgetRenderer
              v-if="message.widgetPayload?.rootNode"
              :node="message.widgetPayload.rootNode"
            /> -->

            <a2uiRender
              v-if="message.widgetPayload?.rootNode"
              :surfaceList="message.widgetPayload.rootNode"
              :manager="manager"
            ></a2uiRender>
          </div>
        </div>
      </div>

      <!-- User timestamp (Right) -->
      <span v-if="isUser" class="text-[9px] text-slate-300 mt-1 mr-1">{{ timeString }}</span>
    </div>
  </div>
</template>
