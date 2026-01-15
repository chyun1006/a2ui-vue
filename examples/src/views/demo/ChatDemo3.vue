<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { createSignalA2uiMessageProcessor, a2uiRender } from "a2ui-vue";
import initSurface from "../../mock/init-surface-flight.json";
import LoadingMask from "../../components/LoadingMask.vue";

// 使用全局 manager，确保与 A2UIRender 组件共享同一个 manager
const processor = createSignalA2uiMessageProcessor({ useGlobalManager: true });

const message = ref("我要订员工票");
const isLoading = ref(false);
const markdownText = ref("");

const mockData = [
  { beginRendering: { surfaceId: "flight-card", root: "mainColumn" } },
  {
    surfaceUpdate: {
      surfaceId: "flight-card",
      components: [
        {
          id: "mainColumn",
          component: {
            Column: {
              children: {
                explicitList: ["applicantSection", "travelSection", "submitButtonWrapper"],
              },
              distribution: "start",
              alignment: "stretch",
            },
          },
        },
        {
          id: "applicantSection",
          component: {
            Column: {
              children: { explicitList: ["applicantTitle", "applicantRow1", "phoneField"] },
              title: "申请人信息",
            },
          },
        },
        {
          id: "applicantTitle",
          component: { Text: { text: { literalString: "申请人信息：" }, usageHint: "h3" } },
        },
        {
          id: "applicantRow1",
          component: {
            Row: {
              children: { explicitList: ["nameField", "employeeIdField"] },
              distribution: "spaceBetween",
            },
          },
        },
        {
          id: "nameField",
          component: {
            TextField: {
              label: { literalString: "姓名" },
              path: "/applicant/realName",
              type: "shortText",
            },
          },
        },
        {
          id: "employeeIdField",
          component: {
            TextField: {
              label: { literalString: "工号" },
              path: "/applicant/workNo",
              type: "shortText",
            },
          },
        },
        {
          id: "phoneField",
          component: {
            TextField: {
              label: { literalString: "电话号码" },
              path: "/applicant/phone",
              type: "shortText",
            },
          },
        },
        {
          id: "travelSection",
          component: {
            Column: {
              children: {
                explicitList: [
                  "travelTitle",
                  "travelFlightNumberMC",
                  "travelDepartureMC",
                  "travelDestinationMC",
                  "travelDate",
                  "travelIdCard",
                  "travelRemarks",
                ],
              },
              title: "行程信息",
            },
          },
        },
        {
          id: "travelTitle",
          component: { Text: { text: { literalString: "行程信息：" }, usageHint: "h3" } },
        },
        {
          id: "travelFlightNumberMC",
          component: {
            MultipleChoice: {
              selections: { path: "/travel/flightNumber" },
              options: [{ label: { literalString: "A67719" }, value: "A67719" }],
              maxAllowedSelections: 1,
            },
          },
        },
        {
          id: "travelDepartureMC",
          component: {
            MultipleChoice: {
              selections: { path: "/travel/departure" },
              options: [
                { label: { literalString: "成都天府" }, value: "TFU" },
                { label: { literalString: "无锡" }, value: "WUX" },
                { label: { literalString: "长沙" }, value: "CsX" },
                { label: { literalString: "昆明" }, value: "KMG" },
              ],
              maxAllowedSelections: 1,
            },
          },
        },
        {
          id: "travelDestinationMC",
          component: {
            MultipleChoice: {
              selections: { path: "/travel/arrival" },
              options: [
                { label: { literalString: "成都天府" }, value: "TFU" },
                { label: { literalString: "无锡" }, value: "WUX" },
                { label: { literalString: "长沙" }, value: "CsX" },
                { label: { literalString: "昆明" }, value: "KMG" },
              ],
              maxAllowedSelections: 1,
            },
          },
        },
        {
          id: "travelDate",
          component: {
            DateTimeInput: { value: { path: "/travel/date" }, enableDate: true, enableTime: false },
          },
        },
        {
          id: "travelIdCard",
          component: {
            TextField: {
              label: { literalString: "身份证" },
              path: "/travel/idCard",
              type: "shortText",
            },
          },
        },
        {
          id: "travelRemarks",
          component: {
            TextField: {
              label: { literalString: "备注" },
              path: "/travel/remarks",
              type: "longText",
            },
          },
        },
        {
          id: "submitButtonWrapper",
          component: {
            Row: { children: { explicitList: ["submitButton"] }, distribution: "center" },
          },
        },
        {
          id: "submitButton",
          component: {
            Button: {
              child: "Text",
              primary: true,
              action: {
                name: "我要订员工票，这是我的订票信息",
                context: [
                  { key: "realName", value: { path: "/applicant/realName" } },
                  { key: "workNo", value: { path: "/applicant/workNo" } },
                  { key: "phone", value: { path: "/applicant/phone" } },
                  { key: "flightNumber", value: { path: "/travel/flightNumber" } },
                  { key: "departure", value: { path: "/travel/departure" } },
                  { key: "arrival", value: { path: "/travel/arrival" } },
                  { key: "departureDate", value: { path: "/travel/date" } },
                  { key: "idCard", value: { path: "/travel/idCard" } },
                  { key: "remark", value: { path: "/travel/remarks" } },
                ],
              },
            },
          },
        },
        { id: "Text", component: { Text: { text: { literalString: "提交申请" } } } },
      ],
    },
  },
  {
    dataModelUpdate: {
      surfaceId: "flight-card",
      contents: [
        {
          key: "/applicant",
          valueMap: [
            { key: "realName", valueString: "" },
            { key: "workNo", valueString: "1760007" },
            { key: "phone", valueString: "" },
          ],
        },
        {
          key: "/travel",
          valueMap: [
            { key: "flightNumber", valueString: "" },
            { key: "departure", valueString: "" },
            { key: "arrival", valueString: "" },
            { key: "date", valueString: "" },
            { key: "idCard", valueString: "" },
            { key: "remarks", valueString: "" },
          ],
        },
      ],
    },
  },
];

onMounted(() => {
  // 清空所有 surfaces，确保从干净状态开始
  processor.clearSurfaces();
  processor.processMessages(initSurface);
  // processor.processMessages(mockData);
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
