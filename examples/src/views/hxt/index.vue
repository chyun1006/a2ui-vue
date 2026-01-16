<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch, shallowRef } from "vue";
import {
  Mic,
  SendHorizontal,
  Bell,
  Menu,
  Search,
  User,
  MessageSquare,
  MessageSquarePlus,
  X,
  Camera as CameraIcon,
  PlusCircle,
  LayoutGrid,
  XCircle,
  Plane,
  FileText,
  Users,
  Wrench,
  AlertTriangle,
  Image as ImageIcon,
  File as FileIcon,
} from "lucide-vue-next";
import ChatBubble from "./components/ChatBubble.vue";
import FunctionGrid from "./components/FunctionGrid.vue";
// import HongXiaoTongLogo from "./components/HongXiaoTongLogo.vue";
import { createSignalA2uiMessageProcessor, a2uiRender } from "a2ui-vue";
// import initSurface from "../../mock/init-surface.json";

// 使用全局 manager，确保与 A2UIRender 组件共享同一个 manager
const processor = createSignalA2uiMessageProcessor({ useGlobalManager: true });

const ROLES = ["营销主控", "维修席位", "航班生产控制席位", "签派放行席位"];

const NOTIFICATIONS = [
  // {
  //   id: "1",
  //   title: "航班延误预警",
  //   desc: "A61835 预计延误超过 2 小时",
  //   prompt: "处理航班 A61835 延误",
  //   time: "10:30",
  // },
  // {
  //   id: "2",
  //   title: "VIP 服务提醒",
  //   desc: "3 位白金卡旅客即将登机 A61102",
  //   prompt: "查看 A61102 航班 VIP 旅客名单",
  //   time: "11:15",
  // },
  // {
  //   id: "3",
  //   title: "机组超时风险",
  //   desc: "B-1234 机组执勤期预警",
  //   prompt: "检查 B-1234 机组执勤时间",
  //   time: "11:45",
  // },
];

const HISTORY_SESSIONS = [
  { id: "s1", title: "昨日早班运营分析", date: "昨天" },
  { id: "s2", title: "广州航线收益报表", date: "昨天" },
  { id: "s3", title: "A61835 应急处置记录", date: "2天前" },
];

// Mock Function Items
const FUNCTION_ITEMS = [
  { id: "refund_ticket", label: "我要改期", icon: Plane },
  { id: "refund_ticket", label: "我要退票", icon: FileText },
  { id: "order_ticket", label: "我要定员工票", icon: Users },
  { id: "order_ticket", label: "航班动态查询", icon: Plane },
  { id: "order_ticket", label: "查询审核结果", icon: Wrench },
  // { id: "mro", label: "维修工单", icon: Wrench },
  // { id: "dispatch", label: "签派放行", icon: Plane },
  // { id: "marketing", label: "营销数据", icon: FileText },
  // { id: "service", label: "旅客服务", icon: Users },
  // { id: "system", label: "系统设置", icon: Wrench },
];

// Mock Media Items
const MEDIA_ITEMS = [
  { id: "camera", label: "拍摄", icon: CameraIcon },
  { id: "album", label: "相册", icon: ImageIcon },
  { id: "local_file", label: "文件", icon: FileIcon },
];

// --- LOGIC ---

// State
const messages = ref([]);
const inputValue = ref("");
const activeGrid = ref("none"); // 'none' | 'business' | 'media'
const currentUserRole = ref("值班经理");
const showLeftPanel = ref(false);
const showRightPanel = ref(false);
const messagesEndRef = ref(null);
const fileInputRef = ref(null);
let chatObserver = null;

const scrollToBottom = async () => {
  await nextTick();
  if (messagesEndRef.value && messagesEndRef.value.parentElement) {
    const container = messagesEndRef.value.parentElement;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }
};

watch(
  [messages, activeGrid],
  () => {
    scrollToBottom();
  },
  { deep: true },
); // messages works better with deep watch if pushing new items, though array mutation triggers generally work.

// Local Mock Generator
const generateLocalBriefing = (role) => {
  const flightTotal = 68 + Math.floor(Math.random() * 5);
  const flightDelayed = 2 + Math.floor(Math.random() * 3);
  const normalcy = (100 - (flightDelayed / flightTotal) * 100).toFixed(1) + "%";

  return {
    type: "container",
    style: { className: "flex flex-col gap-4" },
    children: [
      {
        type: "container",
        style: { className: "bg-white border border-slate-200 rounded-xl p-4 shadow-sm" },
        children: [
          {
            type: "text",
            props: { text: "关键运行指标 (KPI)" },
            style: {
              className: "text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider",
            },
          },
          {
            type: "container",
            style: { className: "grid grid-cols-3 gap-2 mb-4" },
            children: [
              {
                type: "container",
                style: {
                  className:
                    "bg-blue-50/50 p-2 rounded-lg border border-blue-100 flex flex-col items-center justify-center",
                },
                children: [
                  {
                    type: "text",
                    props: { text: normalcy },
                    style: { className: "text-lg font-bold text-blue-700" },
                  },
                  {
                    type: "text",
                    props: { text: "正常率" },
                    style: { className: "text-[9px] text-blue-400 mt-0.5" },
                  },
                ],
              },
              {
                type: "container",
                style: {
                  className:
                    "bg-slate-50 p-2 rounded-lg border border-slate-100 flex flex-col items-center justify-center",
                },
                children: [
                  {
                    type: "text",
                    props: { text: flightTotal.toString() },
                    style: { className: "text-lg font-bold text-slate-700" },
                  },
                  {
                    type: "text",
                    props: { text: "今日航班" },
                    style: { className: "text-[9px] text-slate-400 mt-0.5" },
                  },
                ],
              },
              {
                type: "container",
                style: {
                  className:
                    "bg-orange-50/50 p-2 rounded-lg border border-orange-100 flex flex-col items-center justify-center",
                },
                children: [
                  {
                    type: "text",
                    props: { text: flightDelayed.toString() },
                    style: { className: "text-lg font-bold text-orange-600" },
                  },
                  {
                    type: "text",
                    props: { text: "当前积压" },
                    style: { className: "text-[9px] text-orange-400 mt-0.5" },
                  },
                ],
              },
            ],
          },
          {
            type: "chart",
            props: {
              chartType: "area",
              height: "100px",
              chartData: [
                { name: "08:00", value: 92 },
                { name: "10:00", value: 88 },
                { name: "12:00", value: 95 },
                { name: "14:00", value: 90 },
                { name: "16:00", value: 85 },
                { name: "18:00", value: 93 },
              ],
            },
          },
        ],
      },
      {
        type: "container",
        style: { className: "bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex gap-3" },
        children: [
          {
            type: "icon",
            props: { iconName: "Sparkles" },
            style: { className: "w-4 h-4 text-indigo-500 shrink-0 mt-0.5" },
          },
          {
            type: "text",
            props: {
              text: `今日${role}重点关注：午后华东区域有雷雨覆盖，预计造成进出港流控，建议提前预留备份运力。`,
            },
            style: { className: "text-xs text-indigo-800 leading-relaxed" },
          },
        ],
      },
      {
        type: "container",
        style: { className: "flex flex-col gap-2" },
        children: [
          {
            type: "text",
            props: { text: "建议操作" },
            style: { className: "text-[10px] font-bold text-slate-400 mb-1 ml-1" },
          },
          {
            type: "container",
            style: { className: "grid grid-cols-2 gap-2" },
            children: [
              {
                type: "button",
                props: { text: "查看延误详情", onClickIntent: "Show Delays" },
                style: {
                  className:
                    "bg-white border border-slate-200 p-2.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm",
                },
              },
              {
                type: "button",
                props: { text: "生成日报草稿", onClickIntent: "Draft Report" },
                style: {
                  className:
                    "bg-blue-600 text-white p-2.5 rounded-lg text-xs font-bold shadow-md shadow-blue-200 hover:bg-blue-700",
                },
              },
            ],
          },
        ],
      },
    ],
  };
};

const apiFlag = ref("order_ticket");
// API Call
const callGeminiDirectly = async (message, systemInstruction) => {
  const maxRetries = 3;
  const apiMap = {
    // refund_ticket: "/api/ticket/change",
    refund_ticket: "/api/agent/chat",
    order_ticket: "/api/chat",
  };
  try {
    let payload = {};
    if (apiFlag.value == "order_ticket") {
      payload = {
        message: message,
        sessionId: sessionId,
        workNo: "1760023",
      };
    } else {
      payload = {
        userId: "123456",
        memberId: "232568004001",
        sessionId: "12345689",
        query: JSON.stringify(message),
      };
    }

    // const res = await fetch(apiMap[apiFlag.value], {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(payload),
    // });

    // const data = await res.json();
    debugger;
    const data = {
      message: "为您查询到 2025-05-15 从成都到长沙的航班动态",
    };

    // 浩哥的数据结构
    if (apiFlag.value == "refund_ticket") {
      if (data.needUi) {
        return {
          parsedA2UI: data.response,
          rawText: "",
        };
      }
    } else {
      // 立哥
      const [rawText, jsonText] = data.message.split("---a2ui_JSON---");

      let a2UIJson = [];
      if (jsonText) {
        a2UIJson = JSON.parse(jsonText);
      }
      return {
        parsedA2UI: a2UIJson,
        rawText: rawText,
      };
    }
  } catch (e) {
    console.warn(` API Request failed `, e);
  }
};

const triggerDirectAIGeneration = async (prompt) => {
  const loaderId = "loader_" + Date.now();
  messages.value.push({
    id: loaderId,
    sender: "AGENT",
    type: "LOADER",
    timestamp: new Date(),
  });
  scrollToBottom();
  try {
    const history = [
      {
        role: "user",
        parts: [
          {
            text: `Generate a detail UI widget for this context: ${prompt}. IMPORTANT: All UI text, labels, and content MUST be in Simplified Chinese (简体中文). Do not say hello or provide conversational filler. Just return the JSON for the widget.`,
          },
        ],
      },
    ];

    // mockData
    const res = await callGeminiDirectly(history);
    messages.value = messages.value.filter((m) => m.id !== loaderId);
    messages.value.push({
      id: Date.now().toString() + "_ai",
      sender: "AGENT",
      type: "A2UI_WIDGET",
      thought: jsonResponse.thought || "已为您调取相关详情。",
      content: jsonResponse.summary || "",
      widgetPayload: {
        title: jsonResponse.title || "详情",
        surfaces: res.surfaces?.length || [],
        rawText: res.rawText || "",
      },
      timestamp: new Date(),
    });
  } catch (error) {
    messages.value = messages.value.filter((m) => m.id !== loaderId);
    messages.value.push({
      id: Date.now().toString() + "_err",
      sender: "AGENT",
      type: "TEXT",
      content: "抱歉，服务暂时不可用，请稍后再试。",
      timestamp: new Date(),
    });
  }
  scrollToBottom();
};

const startNewSession = async (directGenerationPrompt) => {
  const randomRole = ROLES[Math.floor(Math.random() * ROLES.length)];
  currentUserRole.value = randomRole;

  messages.value = [];

  if (directGenerationPrompt) {
    triggerDirectAIGeneration(directGenerationPrompt);
    return;
  }

  const initMsg = {
    id: "init_" + Date.now(),
    sender: "AGENT",
    type: "A2UI_WIDGET",
    // thought: `识别到您的身份为【${randomRole}】，已接入生产运行数据库 (本地直连)...`,
    content: `您好，我是鸿小通，有什么可以帮到你的吗？`,
    widgetPayload: {
      title: `您好，我是鸿小通，有什么可以帮到你的吗？`,
    },
    timestamp: new Date(),
  };
  messages.value.push(initMsg);
};

// 处理用户聊天输入框发送的消息
const processUserMessage = async (text) => {
  processUserAction({
    name: text,
    context: { submitted_text: text },
  });
};

// 处理快捷操作按钮
const quickActionHandler = (action, flag) => {
  apiFlag.value = flag;
  const params = {
    name: action.action,
    context: { submitted_text: action.action },
  };
  processUserAction(params);
};

// 处理用户操作
const processUserAction = async (action) => {
  const userMsg = {
    id: Date.now().toString(),
    sender: "USER",
    type: "TEXT",
    content: action.action || action.name,
    timestamp: new Date(),
  };
  messages.value.push(userMsg);

  const loaderId = "loader_" + Date.now();
  messages.value.push({
    id: loaderId,
    sender: "AGENT",
    type: "LOADER",
    timestamp: new Date(),
  });

  try {
    const { rawText, parsedA2UI } = await callGeminiDirectly(action);

    // 核心修改: 原位替换 loader
    const loaderIndex = messages.value.findIndex((m) => m.id === loaderId);
    if (loaderIndex === -1) return;

    const messageId = Date.now().toString() + "_ai";
    const messageTimestamp = new Date();

    const uniqueSuffix = `_${messageId}`;

    if (Array.isArray(parsedA2UI)) {
      parsedA2UI.forEach((msg) => {
        let originalId = null;
        if (msg.beginRendering) originalId = msg.beginRendering.surfaceId;
        else if (msg.surfaceUpdate) originalId = msg.surfaceUpdate.surfaceId;
        else if (msg.dataModelUpdate) originalId = msg.dataModelUpdate.surfaceId;

        if (originalId) {
          const newId = originalId + uniqueSuffix;
          if (msg.beginRendering) msg.beginRendering.surfaceId = newId;
          if (msg.surfaceUpdate) msg.surfaceUpdate.surfaceId = newId;
          if (msg.dataModelUpdate) msg.dataModelUpdate.surfaceId = newId;
        }
      });
    }

    const surfaces = processor.processMessages(parsedA2UI);

    messages.value[loaderIndex] = {
      id: messageId,
      sender: "AGENT",
      type: "A2UI_WIDGET",
      thought: surfaces.length ? "分析完成，界面已生成。" : "思考完成",
      content: surfaces.length ? "已为您生成相关业务办理界面：" : "",
      widgetPayload: {
        surfaces: surfaces,
        rawText: rawText,
      },
      timestamp: messageTimestamp,
    };
  } catch (error) {
    const loaderIndex = messages.value.findIndex((m) => m.id === loaderId);
    if (loaderIndex !== -1) {
      messages.value[loaderIndex] = {
        id: Date.now().toString() + "_err",
        sender: "AGENT",
        type: "TEXT",
        content: "抱歉，网络连接或服务暂时不可用，请稍后再试。",
        timestamp: new Date(),
      };
    }
  }
  scrollToBottom();
};

const handleSendMessage = async () => {
  if (!inputValue.value.trim()) return;
  const text = inputValue.value;
  inputValue.value = "";
  activeGrid.value = "none";

  // 根据关键词设置 apiFlag
  const refundKeywords = ["退票", "改期", "改签"];
  const hasRefundKeyword = refundKeywords.some((keyword) => text.includes(keyword));
  apiFlag.value = hasRefundKeyword ? "refund_ticket" : "order_ticket";

  await processUserMessage(text);
};

const handleNotificationClick = (notif) => {
  showRightPanel.value = false;
  startNewSession(notif.prompt);
};

const handleFileChange = (e) => {
  if (e.target.files && e.target.files.length > 0) {
    const fileName = e.target.files[0].name;
    messages.value.push({
      id: Date.now().toString(),
      sender: "USER",
      type: "TEXT",
      content: `[发送文件] ${fileName}`,
      timestamp: new Date(),
    });
    setTimeout(() => processUserMessage(`分析文件 ${fileName}`), 500);
    if (fileInputRef.value) fileInputRef.value.value = "";
  }
};

const toggleGrid = (type) => {
  // 'business' or 'media'
  if (activeGrid.value === type) {
    activeGrid.value = "none";
  } else {
    activeGrid.value = type;
  }
};

// Initial session
const hasInitialized = ref(false);
let sessionId = null;
onMounted(() => {
  sessionId = +new Date();
  if (!hasInitialized.value) {
    hasInitialized.value = true;

    startNewSession();
  }

  // Auto-scroll observer
  if (messagesEndRef.value && messagesEndRef.value.parentElement) {
    const container = messagesEndRef.value.parentElement;
    chatObserver = new MutationObserver((mutations) => {
      scrollToBottom();
    });
    chatObserver.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }
});

onUnmounted(() => {
  if (chatObserver) {
    chatObserver.disconnect();
  }
});
</script>

<template>
  <div class="flex flex-col h-screen bg-white max-w-md relative shadow-2xl overflow-hidden">
    <!-- Left Sidebar (Drawer) -->
    <div v-if="showLeftPanel" class="absolute inset-0 z-50 flex">
      <div class="w-[80%] h-full bg-white shadow-xl animate-slide-in-left flex flex-col">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
              <User class="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <div class="font-bold text-slate-800">{{ currentUserRole }}</div>
              <div class="text-xs text-slate-400">ID: 80021</div>
            </div>
          </div>
          <button @click="showLeftPanel = false" class="p-2 bg-slate-50 rounded-full">
            <X class="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div class="p-4">
          <div
            class="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 mb-6"
          >
            <Search class="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索历史会话..."
              class="bg-transparent text-sm outline-none text-slate-700 w-full"
            />
          </div>

          <div class="text-xs font-bold text-slate-400 uppercase mb-3">历史会话</div>
          <div class="space-y-2">
            <div
              v-for="session in HISTORY_SESSIONS"
              :key="session.id"
              class="p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-slate-100"
            >
              <div class="flex items-center gap-2 mb-1">
                <MessageSquare class="w-3.5 h-3.5 text-blue-500" />
                <span class="text-sm font-bold text-slate-700">{{ session.title }}</span>
              </div>
              <div class="text-[10px] text-slate-400 pl-5.5">{{ session.date }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex-1 bg-black/20 backdrop-blur-sm" @click="showLeftPanel = false"></div>
    </div>

    <!-- Right Sidebar (Notifications) -->
    <div v-if="showRightPanel" class="absolute inset-0 z-50 flex justify-end">
      <div class="flex-1 bg-black/20 backdrop-blur-sm" @click="showRightPanel = false"></div>
      <div class="w-[85%] h-full bg-white shadow-xl animate-slide-in-right flex flex-col">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 class="font-bold text-slate-800 flex items-center gap-2">
            <Bell class="w-4 h-4 text-blue-600" />
            消息通知
          </h2>
          <button @click="showRightPanel = false" class="p-2 bg-slate-50 rounded-full">
            <X class="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <div
            v-for="notif in NOTIFICATIONS"
            :key="notif.id"
            class="p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
            @click="handleNotificationClick(notif)"
          >
            <div class="flex justify-between items-start mb-1">
              <div class="flex items-center gap-1.5">
                <div class="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                <span
                  class="font-bold text-sm text-slate-800 group-hover:text-blue-600 transition-colors"
                  >{{ notif.title }}</span
                >
              </div>
              <span class="text-[10px] text-slate-400">{{ notif.time }}</span>
            </div>
            <p class="text-xs text-slate-500 mb-2">{{ notif.desc }}</p>
            <div class="flex justify-end">
              <span class="text-[10px] text-blue-500 bg-blue-50 px-2 py-0.5 rounded font-bold"
                >点击处理</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Header -->
    <header
      class="relative flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-md sticky top-0 z-20 border-b border-slate-100"
    >
      <button
        @click="showLeftPanel = true"
        class="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors"
      >
        <Menu class="w-5 h-5 text-slate-700" />
      </button>
      <div class="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div class="w-8 h-8 flex items-center justify-center">
          <img src="@/assets/logo.png" alt="" srcset="" />
        </div>
        <span class="font-bold text-lg text-slate-800 tracking-tight">鸿小通</span>
      </div>
      <div class="flex items-center gap-1 -mr-2">
        <button
          @click="startNewSession()"
          class="p-2 rounded-full hover:bg-slate-100 transition-colors"
          title="新会话"
        >
          <MessageSquarePlus class="w-5 h-5 text-slate-600" />
        </button>
        <button
          @click="showRightPanel = true"
          class="p-2 relative rounded-full hover:bg-slate-100 transition-colors"
        >
          <Bell class="w-5 h-5 text-slate-600" />
          <span
            class="absolute top-0.5 right-0.5 min-w-[14px] h-3.5 bg-red-500 border-2 border-white rounded-full text-[8px] flex items-center justify-center text-white font-bold px-0.5"
            >0</span
          >
        </button>
      </div>
    </header>

    <!-- Chat Area -->
    <main class="flex-1 overflow-y-auto p-4 pb-32 scroll-smooth no-scrollbar bg-white">
      <ChatBubble
        v-for="msg in messages"
        :key="msg.id"
        :message="msg"
        @actionClick="processUserAction"
      />
      <div ref="messagesEndRef" />
    </main>

    <!-- Bottom Input Area (Overlay) -->
    <footer class="fixed bottom-0 z-40 w-full max-w-md pointer-events-none">
      <!-- Quick Actions Bar (Top Row) -->
      <div class="flex items-center justify-between px-4 pb-2 pointer-events-auto">
        <!-- Scrollable Chips -->
        <div
          class="flex-1 overflow-x-auto no-scrollbar flex items-center gap-2 pr-2 mask-linear-fade"
        >
          <button
            v-for="item in FUNCTION_ITEMS"
            :key="item.id"
            @click="quickActionHandler({ action: item.label }, item.id)"
            class="flex-shrink-0 bg-white/90 backdrop-blur-sm border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1"
          >
            <span>{{ item.label }}</span>
          </button>
        </div>

        <!-- More Button -->
        <button
          @click="toggleGrid('business')"
          style="z-index: 999"
          class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all duration-300 backdrop-blur-md border"
          :class="
            activeGrid === 'business'
              ? 'bg-blue-600 text-white border-blue-600 rotate-90'
              : 'bg-white/80 text-slate-500 border-white hover:bg-white'
          "
        >
          <XCircle v-if="activeGrid === 'business'" class="w-5 h-5" />
          <LayoutGrid v-else class="w-4 h-4" />
        </button>
      </div>

      <!-- Input Bar + Media Panel Container -->
      <div
        class="bg-white/95 backdrop-blur-xl border-t border-slate-100 pointer-events-auto shadow-[0_-5px_20px_rgba(0,0,0,0.03)] transition-all"
      >
        <!-- Input Row -->
        <div class="p-3 pb-6 flex items-center gap-3">
          <!-- Left: Voice -->
          <button
            class="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600 active:scale-90"
          >
            <Mic class="w-6 h-6" />
          </button>

          <!-- Center: Input -->
          <div
            class="flex-1 bg-slate-100 rounded-2xl flex items-center px-4 py-2.5 border border-transparent focus-within:border-blue-200 focus-within:bg-white transition-all"
          >
            <input
              type="text"
              v-model="inputValue"
              @keydown.enter="handleSendMessage"
              placeholder="发消息或按住说话..."
              class="bg-transparent w-full outline-none text-slate-800 placeholder-slate-400 text-sm"
            />
          </div>

          <!-- Right: Camera & Plus -->
          <div class="flex items-center gap-1">
            <template v-if="inputValue.trim()">
              <button
                @click="handleSendMessage"
                class="p-2 bg-blue-600 rounded-full shadow-lg shadow-blue-200 active:scale-90 transition-transform hover:bg-blue-700"
              >
                <SendHorizontal class="w-5 h-5 text-white" />
              </button>
            </template>
            <template v-else>
              <!-- <button
                @click="fileInputRef?.click()"
                class="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600 active:scale-90"
              >
                <CameraIcon class="w-6 h-6" />
              </button> -->
              <button
                @click="toggleGrid('media')"
                class="p-2 rounded-full transition-all duration-300 active:scale-90"
                :class="
                  activeGrid === 'media'
                    ? 'bg-slate-100 rotate-45 text-slate-800'
                    : 'hover:bg-slate-100 text-slate-600'
                "
              >
                <PlusCircle class="w-6 h-6" />
              </button>
            </template>
          </div>
        </div>

        <!-- Media Grid (Drawer) -->
        <FunctionGrid
          :is-open="activeGrid === 'media'"
          mode="media"
          :items="MEDIA_ITEMS"
          @itemClick="
            (item) => {
              if (item.id === 'camera' || item.id === 'album' || item.id === 'local_file') {
                fileInputRef?.click();
              } else {
                processUserMessage(`打开${item.label}`);
              }
              activeGrid = 'none';
            }
          "
        />
      </div>

      <!-- Hidden File Input -->
      <input type="file" ref="fileInputRef" class="hidden" @change="handleFileChange" />

      <!-- Business Grid (Popover) -->
      <FunctionGrid
        :is-open="activeGrid === 'business'"
        title="常用功能"
        mode="business"
        :items="FUNCTION_ITEMS"
        @itemClick="
          (item) => {
            processUserMessage(item.label);
            activeGrid = 'none';
          }
        "
      />
    </footer>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Animations */
@keyframes slide-in-left {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
.animate-slide-in-left {
  animation: slide-in-left 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
.animate-slide-in-right {
  animation: slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fade-in-up {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
.animate-fade-in-up {
  animation: fade-in-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.mask-linear-fade {
  mask-image: linear-gradient(to right, black 85%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, black 85%, transparent 100%);
}
</style>
