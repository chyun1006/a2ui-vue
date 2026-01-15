<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { createSignalA2uiMessageProcessor, a2uiRender } from "a2ui-vue";
import initSurface from "../mock/init-surface-flight.json";
import LoadingMask from "../components/LoadingMask.vue";

// 使用全局 manager，确保与 A2UIRender 组件共享同一个 manager
const processor = createSignalA2uiMessageProcessor({ useGlobalManager: true });

const message = ref("我要订员工票");
const isLoading = ref(false);
const markdownText = ref("");

const mockData = [
  {
    beginRendering: {
      surfaceId: "flight-card-success",
      root: "root",
      styles: { primaryColor: "#FF0000", font: "Roboto" },
    },
  },
  {
    surfaceUpdate: {
      surfaceId: "flight-card-success",
      components: [
        { id: "root", component: { Card: { child: "cardContent" } } },
        {
          id: "cardContent",
          component: {
            Column: {
              children: { explicitList: ["titleRow", "descLine1", "descLine2"] },
              distribution: "start",
              alignment: "stretch",
            },
          },
        },
        {
          id: "titleRow",
          component: {
            Row: {
              children: { explicitList: ["titleIcon", "titleText"] },
              distribution: "start",
              alignment: "center",
            },
          },
        },
        { id: "titleIcon", component: { Icon: { name: { literalString: "check" } } } },
        {
          id: "titleText",
          component: { Text: { text: { literalString: "提交成功！" }, usageHint: "h5" } },
        },
        {
          id: "descLine1",
          component: {
            Text: { text: { literalString: "您的申请已提交，正在等待审批：" }, usageHint: "body" },
          },
        },
        {
          id: "descLine2",
          component: { Text: { text: { path: "/dynamicText" }, usageHint: "body" } },
        },
      ],
    },
  },
  {
    dataModelUpdate: {
      surfaceId: "flight-card-success",
      contents: [{ key: "dynamicText", valueString: "张强(1760000)" }],
    },
  },
];

onMounted(() => {
  // 清空所有 surfaces，确保从干净状态开始
  processor.clearSurfaces();
  // processor.processMessages(initSurface);
  processor.processMessages(mockData);
});

onUnmounted(() => {
  // 组件卸载时销毁 processor
  processor.destroy();
});

// 从 A2UI TextField 发送消息
const sendMsgFromA2UI = async (message) => {
  isLoading.value = true;
  try {
    const payload = {
      message: message,
      sessionId: +new Date(),
      workNo: "1760023",
    };
    const res = await fetch("/api/chat", {
      body: JSON.stringify(payload),
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
    });

    if (res.status != 200) {
      return;
    }

    const data = await res.json();
    console.log("Response:", data);

    const messageStr = data.message;

    const [a, b] = messageStr.split("---a2ui_JSON---");

    if (a) {
      markdownText.value = a;
    }
    if (b) {
      const aa = b.trim("");
      const cc = JSON.parse(aa);
      processor.clearSurfaces();
      markdownText.value = "";
      processor.processMessages(cc, { clearBefore: true });
    }
  } catch (error) {
    console.error("Error sending message:", error);
  } finally {
    isLoading.value = false;
  }
};

const handleAction = (action) => {
  console.log("Action received:", action);

  // 防止重复提交
  if (isLoading.value) {
    console.warn("请求进行中,请勿重复提交");
    return;
  }

  sendMsgFromA2UI(action);
};
</script>

<template>
  <div style="padding: 10px">
    <div v-html="markdownText"></div>
    <a2uiRender @action="handleAction" />
    <LoadingMask :visible="isLoading" text="正在处理请求..." />
  </div>
</template>

<style scoped>
.container {
  border-radius: 8px;
  padding: 2rem;
}

h1 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;
}

.message-form {
  display: flex;
  gap: 10px;
  margin-bottom: 2rem;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.3s;
}

.message-input:focus {
  border-color: #42b883;
}

.send-button {
  padding: 12px 24px;
  font-size: 1rem;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.send-button:hover {
  background-color: #33a06f;
}

.message-list h2 {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 1rem;
}

.message-item {
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
  margin-bottom: 8px;
  color: #555;
}
</style>
