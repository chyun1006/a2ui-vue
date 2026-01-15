<script setup>
import { onMounted, ref } from "vue";
import { createSignalA2uiMessageProcessor, a2uiRender } from "a2ui-vue";
import initSurface from "../../mock/init-surface.json";

// 使用全局 manager，确保与 A2UIRender 组件共享同一个 manager
const processor = createSignalA2uiMessageProcessor({ useGlobalManager: true });

const message = ref("我要退票");

// 存储Surface对象数组
const surfaces = ref([]);

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
            Card: {
              child: "form",
            },
          },
        },
        {
          id: "form",
          component: {
            Column: {
              children: {
                explicitList: [
                  "line1",
                  "line2",
                  "line3",
                  "line4",
                  "line5",
                  "flightDatePicker",
                  "confirmBtn",
                ],
              },
              distribution: "start",
              alignment: "start",
            },
          },
        },
        {
          id: "line1",
          component: {
            Text: {
              text: {
                literalString: "原航班信息",
              },
              usageHint: "h4",
            },
          },
        },
        {
          id: "line2",
          component: {
            Row: {
              children: {
                explicitList: [
                  "depCityNameText",
                  "arrowText",
                  "arrCityNameText",
                  "originalDeptDateText",
                  "departureSuffixText",
                ],
              },
              distribution: "start",
              alignment: "center",
              spacing: 2,
            },
          },
        },
        {
          id: "depCityNameText",
          component: {
            Text: {
              text: {
                path: "/form/depCityName",
              },
              usageHint: "body",
            },
          },
        },
        {
          id: "arrowText",
          component: {
            Text: {
              text: {
                literalString: "->",
              },
              usageHint: "body",
            },
          },
        },
        {
          id: "arrCityNameText",
          component: {
            Text: {
              text: {
                path: "/form/arrCityName",
              },
              usageHint: "body",
            },
          },
        },
        {
          id: "originalDeptDateText",
          component: {
            Text: {
              text: {
                path: "/form/originalDeptDate",
              },
              usageHint: "body",
            },
          },
        },
        {
          id: "departureSuffixText",
          component: {
            Text: {
              text: {
                literalString: " 起飞",
              },
              usageHint: "body",
            },
          },
        },
        {
          id: "line3",
          component: {
            Text: {
              text: {
                literalString: "填写改期信息",
              },
              usageHint: "h4",
            },
          },
        },
        {
          id: "line4",
          component: {
            Row: {
              children: {
                explicitList: ["passengerLabel", "passengerNameText"],
              },
              distribution: "start",
              alignment: "center",
            },
          },
        },
        {
          id: "passengerLabel",
          component: {
            Text: {
              text: {
                literalString: "旅客姓名：",
              },
              usageHint: "body",
            },
          },
        },
        {
          id: "passengerNameText",
          component: {
            Text: {
              text: {
                path: "/form/passengerName",
              },
              usageHint: "body",
            },
          },
        },
        {
          id: "line5",
          component: {
            Text: {
              text: {
                literalString: "选择改期日期",
              },
              usageHint: "h4",
            },
          },
        },
        {
          id: "flightDatePicker",
          component: {
            DateTimeInput: {
              value: {
                path: "/form/deptDate",
              },
              enableDate: true,
              enableTime: false,
            },
          },
        },
        {
          id: "confirmBtn",
          component: {
            Button: {
              child: "confirmBtnText",
              primary: true,
              action: {
                name: "s_m_checkchange",
                context: [
                  {
                    key: "firstIssueTime",
                    value: {
                      path: "/firstIssueTime",
                    },
                  },
                  {
                    key: "passengerName",
                    value: {
                      path: "/passengerName",
                    },
                  },
                  {
                    key: "issueTime",
                    value: {
                      path: "/issueTime",
                    },
                  },
                  {
                    key: "passengerType",
                    value: {
                      path: "/passengerType",
                    },
                  },
                  {
                    key: "pnr",
                    value: {
                      path: "/pnr",
                    },
                  },
                  {
                    key: "ticketPnr",
                    value: {
                      path: "/ticketPnr",
                    },
                  },
                  {
                    key: "ticketStatus",
                    value: {
                      path: "/ticketStatus",
                    },
                  },
                  {
                    key: "gender",
                    value: {
                      path: "/gender",
                    },
                  },
                  {
                    key: "originalSerialNo",
                    value: {
                      path: "/originalSerialNo",
                    },
                  },
                  {
                    key: "tripType",
                    value: {
                      path: "/tripType",
                    },
                  },
                  {
                    key: "canChange",
                    value: {
                      path: "/canChange",
                    },
                  },
                  {
                    key: "flightNo",
                    value: {
                      path: "/flightNo",
                    },
                  },
                  {
                    key: "arrAirportCode",
                    value: {
                      path: "/arrAirportCode",
                    },
                  },
                  {
                    key: "deptAirportCode",
                    value: {
                      path: "/deptAirportCode",
                    },
                  },
                ],
              },
            },
          },
        },
        {
          id: "confirmBtnText",
          component: {
            Text: {
              text: {
                literalString: "去改期",
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
          key: "form",
          valueMap: [
            {
              key: "depCityName",
              valueString: "长沙",
            },
            {
              key: "arrCityName",
              valueString: "昆明",
            },
            {
              key: "originalDeptDate",
              valueString: "2026-03-23",
            },
            {
              key: "passengerName",
              valueString: "测试",
            },
            {
              key: "deptDate",
              valueString: "2026-03-24",
            },
            {
              key: "origIssueDate",
              valueString: "2026-01-15 17:20:00",
            },
          ],
        },
        {
          key: "firstIssueTime",
          valueString: "2026-01-15 17:20:00",
        },
        {
          key: "passengerName",
          valueString: "测试",
        },
        {
          key: "issueTime",
          valueString: "2026-01-15 17:20:00",
        },
        {
          key: "passengerType",
          valueString: "ADT",
        },
        {
          key: "pnr",
          valueString: "NV0178",
        },
        {
          key: "ticketPnr",
          valueString: "NV0178",
        },
        {
          key: "ticketStatus",
          valueString: "OPEN FOR USE",
        },
        {
          key: "gender",
          valueString: "F",
        },
        {
          key: "originalSerialNo",
          valueString: "260115171854118341",
        },
        {
          key: "tripType",
          valueString: "OW",
        },
        {
          key: "birthday",
          valueString: "20050728",
        },
        {
          key: "canChange",
          valueString: "true",
        },
        {
          key: "flightNo",
          valueString: "A67120",
        },
        {
          key: "arrAirportCode",
          valueString: "KMG",
        },
        {
          key: "depAirportCode",
          valueString: "CSX",
        },
      ],
    },
  },
];

const mockadadad = [
  {
    beginRendering: {
      surfaceId: "crew_directory_view",
      root: "directory_column",
      styles: {
        primaryColor: "#2E7D32",
      },
    },
  },
  {
    surfaceUpdate: {
      surfaceId: "crew_directory_view",
      components: [
        {
          id: "directory_column",
          component: {
            Column: {
              children: {
                explicitList: [
                  "header_text",
                  "summary_text",
                  "crew_card_1",
                  "crew_card_2",
                  "crew_card_3",
                  "crew_card_4",
                  "crew_card_5",
                  "crew_card_6",
                  "footer_hint",
                ],
              },
              distribution: "start",
              alignment: "stretch",
            },
          },
        },
        {
          id: "header_text",
          component: {
            Text: {
              text: { literalString: "航空公司机组人员名录" },
              usageHint: "h2",
            },
          },
        },
        {
          id: "summary_text",
          component: {
            Text: {
              text: {
                literalString: "当前系统内共有 20 名机组人员，包含机长、副驾驶、乘务员及安全员。",
              },
              usageHint: "body",
            },
          },
        },
        {
          id: "crew_card_1",
          component: { Card: { child: "c1_row" } },
        },
        {
          id: "c1_row",
          component: {
            Row: {
              children: { explicitList: ["c1_info", "c1_status"] },
              distribution: "spaceBetween",
            },
          },
        },
        {
          id: "c1_info",
          component: {
            Text: { text: { literalString: "李强 | 机长 (18年经验)" }, usageHint: "h3" },
          },
        },
        {
          id: "c1_status",
          component: { Text: { text: { literalString: "飞行中" }, usageHint: "caption" } },
        },

        {
          id: "crew_card_2",
          component: { Card: { child: "c2_row" } },
        },
        {
          id: "c2_row",
          component: {
            Row: {
              children: { explicitList: ["c2_info", "c2_status"] },
              distribution: "spaceBetween",
            },
          },
        },
        {
          id: "c2_info",
          component: {
            Text: { text: { literalString: "吴磊 | 副驾驶 (4年经验)" }, usageHint: "h3" },
          },
        },
        {
          id: "c2_status",
          component: { Text: { text: { literalString: "休息" }, usageHint: "caption" } },
        },

        {
          id: "crew_card_3",
          component: { Card: { child: "c3_row" } },
        },
        {
          id: "c3_row",
          component: {
            Row: {
              children: { explicitList: ["c3_info", "c3_status"] },
              distribution: "spaceBetween",
            },
          },
        },
        {
          id: "c3_info",
          component: {
            Text: { text: { literalString: "王静 | 乘务长 (22年经验)" }, usageHint: "h3" },
          },
        },
        {
          id: "c3_status",
          component: { Text: { text: { literalString: "培训中" }, usageHint: "caption" } },
        },

        {
          id: "crew_card_4",
          component: { Card: { child: "c4_row" } },
        },
        {
          id: "c4_row",
          component: {
            Row: {
              children: { explicitList: ["c4_info", "c4_status"] },
              distribution: "spaceBetween",
            },
          },
        },
        {
          id: "c4_info",
          component: {
            Text: { text: { literalString: "赵洋 | 副驾驶 (23年经验)" }, usageHint: "h3" },
          },
        },
        {
          id: "c4_status",
          component: { Text: { text: { literalString: "飞行中" }, usageHint: "caption" } },
        },

        {
          id: "crew_card_5",
          component: { Card: { child: "c5_row" } },
        },
        {
          id: "c5_row",
          component: {
            Row: {
              children: { explicitList: ["c5_info", "c5_status"] },
              distribution: "spaceBetween",
            },
          },
        },
        {
          id: "c5_info",
          component: {
            Text: { text: { literalString: "黄敏 | 安全员 (21年经验)" }, usageHint: "h3" },
          },
        },
        {
          id: "c5_status",
          component: { Text: { text: { literalString: "培训中" }, usageHint: "caption" } },
        },

        {
          id: "crew_card_6",
          component: { Card: { child: "c6_row" } },
        },
        {
          id: "c6_row",
          component: {
            Row: {
              children: { explicitList: ["c6_info", "c6_status"] },
              distribution: "spaceBetween",
            },
          },
        },
        {
          id: "c6_info",
          component: {
            Text: { text: { literalString: "周强 | 乘务长 (22年经验)" }, usageHint: "h3" },
          },
        },
        {
          id: "c6_status",
          component: { Text: { text: { literalString: "飞行中" }, usageHint: "caption" } },
        },

        {
          id: "footer_hint",
          component: {
            Text: {
              text: {
                literalString: "您可以根据姓名、角色（机长/副驾驶/乘务员）或基地进行筛选查询。",
              },
              usageHint: "caption",
            },
          },
        },
      ],
    },
  },
];

onMounted(() => {
  // 处理初始Surface并存储
  const initialSurfaces = processor.processMessages(mockadadad);
  surfaces.value = initialSurfaces;
  console.log("Loaded initial surfaces:", initialSurfaces);
  // 如果要使用mockData，取消注释下面这行
  // surfaces.value = processor.processMessages(mockData);
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
    const res = await fetch("/api/agent/chat", {
      body: JSON.stringify(payload),
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
    });

    const data = await res.json();
    if (data.needUi) {
      // 处理新的A2UI消息并更新surfaces
      const newSurfaces = processor.processMessages(data.response);
      surfaces.value = newSurfaces;
    }
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

const handleAction = (action) => {
  console.log("Action received:", action);
  sendMsgFromA2UI(action);
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
      <a2uiRender :surfaceList="surfaces" @action="handleAction" />
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
