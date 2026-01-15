<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { createSignalA2uiMessageProcessor, a2uiRender } from "a2ui-vue";

// 使用全局 manager，确保与 A2UIRender 组件共享同一个 manager
const processor = createSignalA2uiMessageProcessor({ useGlobalManager: true });

const mockJson = [
  {
    beginRendering: {
      surfaceId: "flight_list_surface",
      root: "root",
      styles: {
        primaryColor: "#1890FF",
      },
    },
  },
  {
    surfaceUpdate: {
      surfaceId: "flight_list_surface",
      components: [
        {
          id: "root",
          component: {
            Card: {
              child: "main-column",
            },
          },
        },
        {
          id: "main-column",
          component: {
            Column: {
              children: {
                explicitList: ["header-row", "route-row", "divider", "times-row"],
              },
              gap: "small",
              alignment: "stretch",
            },
          },
        },
        {
          id: "header-row",
          component: {
            Row: {
              children: {
                explicitList: ["header-left", "date"],
              },
              distribution: "spaceBetween",
              alignment: "center",
            },
          },
        },
        {
          id: "header-left",
          component: {
            Row: {
              children: {
                explicitList: ["flight-indicator", "flight-number"],
              },
              gap: "small",
              alignment: "center",
            },
          },
        },
        {
          id: "flight-indicator",
          component: {
            Icon: {
              icon: {
                literalString: "flight",
              },
              size: 24,
            },
          },
        },
        {
          id: "flight-number",
          component: {
            Text: {
              text: {
                path: "/flightNumber",
              },
              usageHint: "h3",
            },
          },
        },
        {
          id: "date",
          component: {
            Text: {
              text: {
                path: "/date",
              },
              usageHint: "caption",
            },
          },
        },
        {
          id: "route-row",
          component: {
            Row: {
              children: {
                explicitList: ["origin", "arrow", "destination"],
              },
              gap: "small",
              alignment: "center",
            },
          },
        },
        {
          id: "origin",
          component: {
            Text: {
              text: {
                path: "/origin",
              },
              usageHint: "h2",
            },
          },
        },
        {
          id: "arrow",
          component: {
            Text: {
              text: {
                literalString: "→",
              },
              usageHint: "h2",
            },
          },
        },
        {
          id: "destination",
          component: {
            Text: {
              text: {
                path: "/destination",
              },
              usageHint: "h2",
            },
          },
        },
        {
          id: "divider",
          component: {
            Divider: {},
          },
        },
        {
          id: "times-row",
          component: {
            Row: {
              children: {
                explicitList: ["departure-col", "status-col", "arrival-col"],
              },
              distribution: "spaceBetween",
            },
          },
        },
        {
          id: "departure-col",
          component: {
            Column: {
              children: {
                explicitList: ["departure-label", "departure-time"],
              },
              alignment: "start",
              gap: "none",
            },
          },
        },
        {
          id: "departure-label",
          component: {
            Text: {
              text: {
                literalString: "Departs",
              },
              usageHint: "caption",
            },
          },
        },
        {
          id: "departure-time",
          component: {
            Text: {
              text: {
                path: "/departureTime",
              },
              usageHint: "h3",
            },
          },
        },
        {
          id: "status-col",
          component: {
            Column: {
              children: {
                explicitList: ["status-label", "status-value"],
              },
              alignment: "center",
              gap: "none",
            },
          },
        },
        {
          id: "status-label",
          component: {
            Text: {
              text: {
                literalString: "Status",
              },
              usageHint: "caption",
            },
          },
        },
        {
          id: "status-value",
          component: {
            Text: {
              text: {
                path: "/status",
              },
              usageHint: "body",
            },
          },
        },
        {
          id: "arrival-col",
          component: {
            Column: {
              children: {
                explicitList: ["arrival-label", "arrival-time"],
              },
              alignment: "end",
              gap: "none",
            },
          },
        },
        {
          id: "arrival-label",
          component: {
            Text: {
              text: {
                literalString: "Arrives",
              },
              usageHint: "caption",
            },
          },
        },
        {
          id: "arrival-time",
          component: {
            Text: {
              text: {
                path: "/arrivalTime",
              },
              usageHint: "h3",
            },
          },
        },
      ],
    },
  },
  {
    dataModelUpdate: {
      surfaceId: "flight_list_surface",
      contents: [
        {
          key: "flightNumber",
          valueString: "OS 87",
        },
        {
          key: "date",
          valueString: "Mon, Dec 15",
        },
        {
          key: "origin",
          valueString: "Vienna",
        },
        {
          key: "destination",
          valueString: "New York",
        },
        {
          key: "departureTime",
          valueString: "10:15 AM",
        },
        {
          key: "status",
          valueString: "On Time",
        },
        {
          key: "arrivalTime",
          valueString: "2:30 PM",
        },
      ],
    },
  },
];

const message = ref(
  "请帮我生成一个列表，这个列表有三列，第一列的标题叫航线，第二列的标题叫航班，第三列的名字叫航空公司，请帮我生成A2UI协议格式的文本"
);

onMounted(() => {
  // 使用新 API，处理前清空旧的 surfaces
  processor.processMessages(mockJson, { clearBefore: true });
});

onUnmounted(() => {
  // 组件卸载时销毁 processor
  processor.destroy();
});
</script>

<template>
  <main class="message-page">
    <div class="user-interface-container">
      <a2uiRender />
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
