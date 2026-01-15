<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { createSignalA2uiMessageProcessor, a2uiRender } from "a2ui-vue";
import initSurface from "../../mock/init-surface.json";

// 使用全局 manager，确保与 A2UIRender 组件共享同一个 manager
const processor = createSignalA2uiMessageProcessor({ useGlobalManager: true });

const message = ref("我要退票");

const mockData = [
  {
    beginRendering: {
      surfaceId: "default",
      root: "root",
      styles: {
        primaryColor: "#FF0000",
        font: "Roboto",
      },
    },
  },
  {
    surfaceUpdate: {
      surfaceId: "default",
      components: [
        {
          id: "root",
          component: {
            List: {
              children: {
                template: {
                  componentId: "orderCard",
                  dataBinding: "/orders",
                },
              },
              direction: "vertical",
              alignment: "stretch",
            },
          },
        },
        {
          id: "orderCard",
          component: {
            Card: {
              child: "orderCardContent",
            },
          },
        },
        {
          id: "orderCardContent",
          component: {
            Row: {
              children: {
                explicitList: ["orderNumberText", "detailButton"],
              },
              distribution: "spaceBetween",
              alignment: "center",
            },
          },
        },
        {
          id: "orderNumberText",
          component: {
            Text: {
              text: {
                path: "orderNumber",
              },
              usageHint: "body",
            },
          },
        },
        {
          id: "detailButton",
          component: {
            Button: {
              child: "detailButtonText",
              action: {
                name: "s_m_s_refundTicketSkill",
                context: [
                  {
                    key: "orderNumber",
                    value: {
                      path: "orderNumber",
                    },
                  },
                  {
                    key: "method",
                    value: {
                      path: "method",
                    },
                  },
                ],
              },
              primary: true,
            },
          },
        },
        {
          id: "detailButtonText",
          component: {
            Text: {
              text: {
                literalString: "详情",
              },
            },
          },
        },
      ],
    },
  },
  {
    dataModelUpdate: {
      surfaceId: "default",
      path: "/",
      contents: [
        {
          key: "orders",
          valueMap: [
            {
              key: "0", // 第一个订单的索引
              valueMap: [
                { key: "orderNumber", valueString: "260112180225620309" },
                { key: "method", valueString: "queryRefundOrderDetail" },
              ],
            },
            {
              key: "1",
              valueMap: [
                { key: "orderNumber", valueString: "1234" },
                { key: "method", valueString: "queryRefundO啊啊谁懂发rderDetail" },
              ],
            },
          ],
        },
      ],
    },
  },
];

onMounted(() => {
  // 清空所有 surfaces，确保从干净状态开始`
  processor.clearSurfaces();
  processor.processMessages(initSurface);
  // processor.processMessages(mockData);
});

onUnmounted(() => {
  // 组件卸载时销毁 processor
  processor.destroy();
});

// 从 A2UI TextField 发送消息
const sendMsgFromA2UI = async (action) => {
  try {
    const payload = {
      userId: "123456",
      memberId: "232568004001",
      sessionId: "12345689",
      query: JSON.stringify(action),
    };
    // const res = await fetch("/api/agent/chat", {
    //   body: JSON.stringify(payload),
    //   method: "POST",
    //   headers: {
    //     "content-type": "application/json",
    //   },
    // });
    const res = await fetch("/api/ticket/change", {
      body: JSON.stringify(payload),
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
    });

    const data = await res.json();
    if (data.needUi) {
      // const aa = JSON.parse(data.response);
      processor.processMessages(data.response, { clearBefore: true });
    }
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

const handleAction = (action) => {
  console.log("Action received:", action);
  sendMsgFromA2UI(action);
  // // 从 action.context 中获取提交的文本
  // const submittedText = action.context?.submitted_text;
  // if (submittedText && submittedText.trim()) {
  //   // 使用 A2UI TextField 中的文本发送消息
  //   sendMsgFromA2UI(action);
  // }
};
</script>

<template>
  <main class="message-page">
    <!-- <div class="container">
      <h1>消息发送页面</h1>

      <div class="message-form">
        <input
          v-model="message"
          type="text"
          placeholder="请输入消息..."
          class="message-input"
          @keyup.enter="sendMessage"
        />
        <button @click="sendMessage" class="send-button">发送</button>
      </div>
    </div> -->

    <div class="user-interface-container">
      <a2uiRender @action="handleAction" />
    </div>
  </main>
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
