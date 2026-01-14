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
      surfaceId: "flight-card",
      root: "root",
      styles: {
        primaryColor: "#FF0000",
        font: "Roboto",
      },
    },
  },
  {
    surfaceUpdate: {
      surfaceId: "flight-card",
      components: [
        { id: "root", component: { Card: { child: "mainColumn" } } },
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
              children: { explicitList: ["applicantTitle", "applicantRow1", "applicantRow2"] },
              distribution: "start",
              alignment: "stretch",
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
              alignment: "start",
            },
          },
        },
        {
          id: "nameField",
          component: {
            TextField: {
              label: { literalString: "姓名" },
              text: { path: "/applicant/realName" },
              textFieldType: "shortText",
            },
          },
        },
        {
          id: "employeeIdField",
          component: {
            TextField: {
              label: { literalString: "工号" },
              text: { path: "/applicant/workNo" },
              textFieldType: "shortText",
            },
          },
        },
        {
          id: "applicantRow2",
          component: {
            Row: {
              children: { explicitList: ["phoneField"] },
              distribution: "start",
              alignment: "center",
            },
          },
        },
        {
          id: "phoneField",
          component: {
            TextField: {
              label: { literalString: "电话号码" },
              text: { path: "/applicant/phone" },
              textFieldType: "shortText",
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
                  "travelFlightNumber",
                  "travelDeparture",
                  "travelDestination",
                  "travelDate",
                  "travelIdCard",
                  "travelRemarks",
                ],
              },
              distribution: "start",
              alignment: "stretch",
            },
          },
        },
        {
          id: "travelTitle",
          component: { Text: { text: { literalString: "行程信息：" }, usageHint: "h3" } },
        },
        {
          id: "travelFlightNumber",
          component: {
            Column: {
              children: { explicitList: ["travelFlightNumberLabel", "travelFlightNumberMC"] },
            },
          },
        },
        {
          id: "travelFlightNumberLabel",
          component: { Text: { text: { literalString: "航班号" }, usageHint: "body" } },
        },
        {
          id: "travelFlightNumberMC",
          component: {
            MultipleChoice: {
              selections: { path: "/travel/flightNumber" },
              options: [
                { label: { literalString: "HU7604" }, value: "HU7604" },
                { label: { literalString: "HU7608" }, value: "HU7608" },
                { label: { literalString: "HU7602" }, value: "HU7602" },
                { label: { literalString: "HU7610" }, value: "HU7610" },
              ],
              maxAllowedSelections: 1,
            },
          },
        },
        {
          id: "travelDeparture",
          component: {
            Column: { children: { explicitList: ["travelDepartureLabel", "travelDepartureMC"] } },
          },
        },
        {
          id: "travelDepartureLabel",
          component: { Text: { text: { literalString: "出发地" }, usageHint: "body" } },
        },
        {
          id: "travelDepartureMC",
          component: {
            MultipleChoice: {
              selections: { path: "/travel/departure" },
              options: [
                { label: { literalString: "长沙" }, value: "111" },
                { label: { literalString: "北京" }, value: "222" },
                { label: { literalString: "上海" }, value: "333" },
                { label: { literalString: "广州" }, value: "444" },
              ],
              maxAllowedSelections: 1,
            },
          },
        },
        {
          id: "travelDestination",
          component: {
            Column: {
              children: { explicitList: ["travelDestinationLabel", "travelDestinationMC"] },
            },
          },
        },
        {
          id: "travelDestinationLabel",
          component: { Text: { text: { literalString: "目的地" }, usageHint: "body" } },
        },
        {
          id: "travelDestinationMC",
          component: {
            MultipleChoice: {
              selections: { path: "/travel/arrival" },
              options: [
                { label: { literalString: "北京" }, value: "222" },
                { label: { literalString: "上海" }, value: "333" },
                { label: { literalString: "广州" }, value: "444" },
                { label: { literalString: "深圳" }, value: "555" },
                { label: { literalString: "成都" }, value: "666" },
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
              text: { path: "/travel/idCard" },
              textFieldType: "shortText",
            },
          },
        },
        {
          id: "travelRemarks",
          component: {
            TextField: {
              label: { literalString: "备注" },
              text: { path: "/travel/remarks" },
              textFieldType: "longText",
            },
          },
        },
        {
          id: "submitButtonWrapper",
          component: {
            Row: {
              children: { explicitList: ["submitButton"] },
              distribution: "center",
              alignment: "center",
            },
          },
        },
        {
          id: "submitButton",
          component: {
            Button: {
              child: "submitButtonText",
              primary: true,
              action: {
                name: "submitApplication",
                context: [
                  // 申请人信息
                  { key: "realName", value: { path: "/applicant/realName" } },
                  { key: "workNo", value: { path: "/applicant/workNo" } },
                  { key: "phone", value: { path: "/applicant/phone" } },
                  // 行程信息
                  { key: "flightNumber", value: { path: "/travel/flightNumber" } },
                  { key: "departure", value: { path: "/travel/departure" } },
                  { key: "arrival", value: { path: "/travel/arrival" } },
                  { key: "date", value: { path: "/travel/date" } },
                  { key: "idCard", value: { path: "/travel/idCard" } },
                  { key: "remarks", value: { path: "/travel/remarks" } },
                ],
              },
            },
          },
        },
        {
          id: "submitButtonText",
          component: { Text: { text: { literalString: "提交申请" }, usageHint: "body" } },
        },
      ],
    },
  },
  {
    dataModelUpdate: {
      surfaceId: "flight-card",
      contents: [
        {
          key: "applicant",
          valueMap: [
            { key: "realName", valueString: "李立灏" },
            { key: "workNo", valueString: "1760007" },
            { key: "phone", valueString: "" },
          ],
        },
        {
          key: "travel",
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
      message: JSON.stringify(message),
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
      console.log("哈哈哈哈", cc);
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
    console.warn("请求进行中，请勿重复提交");
    return;
  }

  // 从 action.context 中获取提交的文本
  const submittedText = action.context;
  if (submittedText) {
    // 使用 A2UI TextField 中的文本发送消息
    sendMsgFromA2UI(action);
  }
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
