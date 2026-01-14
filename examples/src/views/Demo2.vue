<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { createSignalA2uiMessageProcessor, a2uiRender, Button, Card, Input } from "a2ui-vue";
import { Send } from "lucide-vue-next";

const processor = createSignalA2uiMessageProcessor({ useGlobalManager: true });

const userInput = ref("");
const messages = ref([]);
const isLoading = ref(false);
const chatContainer = ref(null);

const mockData =
  '[{"beginRendering":{"surfaceId":"flight-card","root":"root","styles":{"primaryColor":"#FF0000","font":"Roboto"}}},{"surfaceUpdate":{"surfaceId":"flight-card","components":[{"id":"root","component":{"Card":{"child":"mainColumn"}}},{"id":"mainColumn","component":{"Column":{"children":{"explicitList":["applicantSection","travelSection","submitButtonWrapper"]},"distribution":"start","alignment":"stretch"}}},{"id":"applicantSection","component":{"Column":{"children":{"explicitList":["applicantTitle","applicantRow1","applicantRow2"]},"distribution":"start","alignment":"stretch"}}},{"id":"applicantTitle","component":{"Text":{"text":{"literalString":"申请人信息："},"usageHint":"h3"}}},{"id":"applicantRow1","component":{"Row":{"children":{"explicitList":["nameField","employeeIdField"]},"distribution":"spaceBetween","alignment":"start"}}},{"id":"nameField","component":{"TextField":{"label":{"literalString":"姓名"},"text":{"path":"/applicant/realName"},"textFieldType":"shortText"}}},{"id":"employeeIdField","component":{"TextField":{"label":{"literalString":"工号"},"text":{"path":"/applicant/workNo"},"textFieldType":"shortText"}}},{"id":"applicantRow2","component":{"Row":{"children":{"explicitList":["phoneField"]},"distribution":"start","alignment":"center"}}},{"id":"phoneField","component":{"TextField":{"label":{"literalString":"电话号码"},"text":{"path":"/applicant/phone"},"textFieldType":"shortText"}}},{"id":"travelSection","component":{"Column":{"children":{"explicitList":["travelTitle","travelFlightNumber","travelDeparture","travelDestination","travelDate","travelIdCard","travelRemarks"]},"distribution":"start","alignment":"stretch"}}},{"id":"travelTitle","component":{"Text":{"text":{"literalString":"行程信息："},"usageHint":"h3"}}},{"id":"travelFlightNumber","component":{"Column":{"children":{"explicitList":["travelFlightNumberLabel","travelFlightNumberMC"]}}}},{"id":"travelFlightNumberLabel","component":{"Text":{"text":{"literalString":"航班号"},"usageHint":"body"}}},{"id":"travelFlightNumberMC","component":{"MultipleChoice":{"selections":{"path":"/travel/flightNumber"},"options":[{"label":{"literalString":"A67627"},"value":"A67627"},{"label":{"literalString":"A67706"},"value":"A67706"},{"label":{"literalString":"A67628"},"value":"A67628"},{"label":{"literalString":"A67705"},"value":"A67705"},{"label":{"literalString":"A67309"},"value":"A67309"},{"label":{"literalString":"A67744"},"value":"A67744"},{"label":{"literalString":"A67227"},"value":"A67227"},{"label":{"literalString":"A67743"},"value":"A67743"},{"label":{"literalString":"A67149"},"value":"A67149"},{"label":{"literalString":"A67108"},"value":"A67108"},{"label":{"literalString":"A67107"},"value":"A67107"},{"label":{"literalString":"A67228"},"value":"A67228"},{"label":{"literalString":"A67784"},"value":"A67784"},{"label":{"literalString":"A67222"},"value":"A67222"},{"label":{"literalString":"A67783"},"value":"A67783"},{"label":{"literalString":"A67148"},"value":"A67148"},{"label":{"literalString":"A67742"},"value":"A67742"},{"label":{"literalString":"A67620"},"value":"A67620"},{"label":{"literalString":"A67147"},"value":"A67147"},{"label":{"literalString":"A67741"},"value":"A67741"},{"label":{"literalString":"A67221"},"value":"A67221"},{"label":{"literalString":"A67144"},"value":"A67144"},{"label":{"literalString":"A67143"},"value":"A67143"},{"label":{"literalString":"A67619"},"value":"A67619"},{"label":{"literalString":"A67777"},"value":"A67777"},{"label":{"literalString":"A67732"},"value":"A67732"},{"label":{"literalString":"A67778"},"value":"A67778"},{"label":{"literalString":"A67178"},"value":"A67178"},{"label":{"literalString":"A67731"},"value":"A67731"},{"label":{"literalString":"A67174"},"value":"A67174"},{"label":{"literalString":"A67254"},"value":"A67254"},{"label":{"literalString":"A67177"},"value":"A67177"},{"label":{"literalString":"A67253"},"value":"A67253"},{"label":{"literalString":"A67173"},"value":"A67173"},{"label":{"literalString":"A67294"},"value":"A67294"},{"label":{"literalString":"A67293"},"value":"A67293"},{"label":{"literalString":"A67722"},"value":"A67722"},{"label":{"literalString":"A67644"},"value":"A67644"},{"label":{"literalString":"A67721"},"value":"A67721"},{"label":{"literalString":"A67762"},"value":"A67762"},{"label":{"literalString":"A67685"},"value":"A67685"},{"label":{"literalString":"A67244"},"value":"A67244"},{"label":{"literalString":"A67288"},"value":"A67288"},{"label":{"literalString":"A67761"},"value":"A67761"},{"label":{"literalString":"A67720"},"value":"A67720"},{"label":{"literalString":"A67643"},"value":"A67643"},{"label":{"literalString":"A67686"},"value":"A67686"},{"label":{"literalString":"A67120"},"value":"A67120"},{"label":{"literalString":"A67240"},"value":"A67240"},{"label":{"literalString":"A67287"},"value":"A67287"},{"label":{"literalString":"A67243"},"value":"A67243"},{"label":{"literalString":"A67719"},"value":"A67719"},{"label":{"literalString":"A67718"},"value":"A67718"},{"label":{"literalString":"A67715"},"value":"A67715"},{"label":{"literalString":"A67714"},"value":"A67714"},{"label":{"literalString":"A67717"},"value":"A67717"},{"label":{"literalString":"A67716"},"value":"A67716"},{"label":{"literalString":"A67314"},"value":"A67314"},{"label":{"literalString":"A67754"},"value":"A67754"},{"label":{"literalString":"A67119"},"value":"A67119"},{"label":{"literalString":"A67713"},"value":"A67713"},{"label":{"literalString":"A67239"},"value":"A67239"},{"label":{"literalString":"A67310"},"value":"A67310"},{"label":{"literalString":"A67313"},"value":"A67313"},{"label":{"literalString":"A67753"},"value":"A67753"},{"label":{"literalString":"A67197"},"value":"A67197"},{"label":{"literalString":"A67152"},"value":"A67152"},{"label":{"literalString":"A67276"},"value":"A67276"},{"label":{"literalString":"A67232"},"value":"A67232"},{"label":{"literalString":"A67198"},"value":"A67198"},{"label":{"literalString":"A67231"},"value":"A67231"},{"label":{"literalString":"A67275"},"value":"A67275"},{"label":{"literalString":"A67193"},"value":"A67193"},{"label":{"literalString":"A67272"},"value":"A67272"},{"label":{"literalString":"A67151"},"value":"A67151"},{"label":{"literalString":"A67271"},"value":"A67271"},{"label":{"literalString":"A67150"},"value":"A67150"},{"label":{"literalString":"A67194"},"value":"A67194"}],"maxAllowedSelections":1}}},{"id":"travelDeparture","component":{"Column":{"children":{"explicitList":["travelDepartureLabel","travelDepartureMC"]}}}},{"id":"travelDepartureLabel","component":{"Text":{"text":{"literalString":"出发地"},"usageHint":"body"}}},{"id":"travelDepartureMC","component":{"MultipleChoice":{"selections":{"path":"/travel/departure"},"options":[{"label":{"literalString":"西宁"},"value":"XNN"},{"label":{"literalString":"长沙"},"value":"CSX"},{"label":{"literalString":"丽江"},"value":"LJG"},{"label":{"literalString":"昆明"},"value":"KMG"},{"label":{"literalString":"北海"},"value":"BHY"},{"label":{"literalString":"南昌"},"value":"KHN"},{"label":{"literalString":"南京"},"value":"NKG"},{"label":{"literalString":"西双版纳"},"value":"JHG"},{"label":{"literalString":"泉州"},"value":"JJN"},{"label":{"literalString":"宁波"},"value":"NGB"},{"label":{"literalString":"呼和浩特"},"value":"HET"},{"label":{"literalString":"海拉尔"},"value":"HLD"},{"label":{"literalString":"无锡"},"value":"WUX"},{"label":{"literalString":"遵义"},"value":"ZYI"},{"label":{"literalString":"保山"},"value":"BSD"},{"label":{"literalString":"德宏"},"value":"LUM"},{"label":{"literalString":"长春"},"value":"CGQ"},{"label":{"literalString":"揭阳"},"value":"SWA"},{"label":{"literalString":"深圳"},"value":"SZX"},{"label":{"literalString":"成都天府"},"value":"TFU"},{"label":{"literalString":"上饶"},"value":"SQD"},{"label":{"literalString":"巴中"},"value":"BZX"},{"label":{"literalString":"十堰"},"value":"WDS"},{"label":{"literalString":"北京大兴"},"value":"PKX"},{"label":{"literalString":"济宁"},"value":"JNG"},{"label":{"literalString":"沈阳"},"value":"SHE"},{"label":{"literalString":"舟山"},"value":"HSN"},{"label":{"literalString":"杭州"},"value":"HGH"},{"label":{"literalString":"哈尔滨"},"value":"HRB"},{"label":{"literalString":"吐鲁番"},"value":"TLQ"},{"label":{"literalString":"温州"},"value":"WNZ"},{"label":{"literalString":"宜宾"},"value":"YBP"}],"maxAllowedSelections":1}}},{"id":"travelDestination","component":{"Column":{"children":{"explicitList":["travelDestinationLabel","travelDestinationMC"]}}}},{"id":"travelDestinationLabel","component":{"Text":{"text":{"literalString":"目的地"},"usageHint":"body"}}},{"id":"travelDestinationMC","component":{"MultipleChoice":{"selections":{"path":"/travel/arrival"},"options":[{"label":{"literalString":"西宁"},"value":"XNN"},{"label":{"literalString":"长沙"},"value":"CSX"},{"label":{"literalString":"丽江"},"value":"LJG"},{"label":{"literalString":"昆明"},"value":"KMG"},{"label":{"literalString":"北海"},"value":"BHY"},{"label":{"literalString":"南昌"},"value":"KHN"},{"label":{"literalString":"南京"},"value":"NKG"},{"label":{"literalString":"西双版纳"},"value":"JHG"},{"label":{"literalString":"泉州"},"value":"JJN"},{"label":{"literalString":"宁波"},"value":"NGB"},{"label":{"literalString":"呼和浩特"},"value":"HET"},{"label":{"literalString":"海拉尔"},"value":"HLD"},{"label":{"literalString":"无锡"},"value":"WUX"},{"label":{"literalString":"遵义"},"value":"ZYI"},{"label":{"literalString":"保山"},"value":"BSD"},{"label":{"literalString":"德宏"},"value":"LUM"},{"label":{"literalString":"长春"},"value":"CGQ"},{"label":{"literalString":"揭阳"},"value":"SWA"},{"label":{"literalString":"深圳"},"value":"SZX"},{"label":{"literalString":"成都天府"},"value":"TFU"},{"label":{"literalString":"上饶"},"value":"SQD"},{"label":{"literalString":"巴中"},"value":"BZX"},{"label":{"literalString":"十堰"},"value":"WDS"},{"label":{"literalString":"北京大兴"},"value":"PKX"},{"label":{"literalString":"济宁"},"value":"JNG"},{"label":{"literalString":"沈阳"},"value":"SHE"},{"label":{"literalString":"舟山"},"value":"HSN"},{"label":{"literalString":"杭州"},"value":"HGH"},{"label":{"literalString":"哈尔滨"},"value":"HRB"},{"label":{"literalString":"吐鲁番"},"value":"TLQ"},{"label":{"literalString":"温州"},"value":"WNZ"},{"label":{"literalString":"宜宾"},"value":"YBP"}],"maxAllowedSelections":1}}},{"id":"travelDate","component":{"DateTimeInput":{"value":{"path":"/travel/date"},"enableDate":true,"enableTime":false}}},{"id":"travelIdCard","component":{"TextField":{"label":{"literalString":"身份证"},"text":{"path":"/travel/idCard"},"textFieldType":"shortText"}}},{"id":"travelRemarks","component":{"TextField":{"label":{"literalString":"备注"},"text":{"path":"/travel/remarks"},"textFieldType":"longText"}}},{"id":"submitButtonWrapper","component":{"Row":{"children":{"explicitList":["submitButton"]},"distribution":"center","alignment":"center"}}},{"id":"submitButton","component":{"Button":{"child":"submitButtonText","primary":true,"action":{"name":"我要订员工票，这是我的订票信息","context":[{"key":"realName","value":{"path":"/applicant/realName"}},{"key":"workNo","value":{"path":"/applicant/workNo"}},{"key":"phone","value":{"path":"/applicant/phone"}},{"key":"flightNumber","value":{"path":"/travel/flightNumber"}},{"key":"departure","value":{"path":"/travel/departure"}},{"key":"arrival","value":{"path":"/travel/arrival"}},{"key":"departureDate","value":{"path":"/travel/date"}},{"key":"idCard","value":{"path":"/travel/idCard"}},{"key":"remark","value":{"path":"/travel/remarks"}}]}}}},{"id":"submitButtonText","component":{"Text":{"text":{"literalString":"提交申请"},"usageHint":"body"}}}]}},{"dataModelUpdate":{"surfaceId":"flight-card","contents":[{"key":"applicant","valueMap":[{"key":"realName","valueString":""},{"key":"workNo","valueString":"1760007"},{"key":"phone","valueString":""}]},{"key":"travel","valueMap":[{"key":"flightNumber","valueString":""},{"key":"departure","valueString":""},{"key":"arrival","valueString":""},{"key":"date","valueString":""},{"key":"idCard","valueString":""},{"key":"remarks","valueString":""}]}]}}]';

onMounted(() => {
  processor.clearSurfaces();
  // processor.processMessages(JSON.parse(mockData));
});

onUnmounted(() => {
  processor.destroy();
});

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
};

const sendMessage = async () => {
  const text = userInput.value.trim();
  if (!text || isLoading.value) return;

  const userMessage = {
    id: Date.now(),
    type: "user",
    content: text,
    timestamp: new Date(),
  };

  messages.value.unshift(userMessage);
  userInput.value = "";
  scrollToBottom();

  isLoading.value = true;

  try {
    const payload = {
      message: JSON.stringify({ text }),
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

    const data = await res.json();
    console.log("Response:", data);

    const messageStr = data.message;
    const [, a2uiJson] = messageStr.split("---a2ui_JSON---");

    if (a2uiJson) {
      let a2uiMessages = JSON.parse(a2uiJson.trim());

      // 为每条消息生成唯一的 surface ID
      const surfaceId = `chat-message-${Date.now()}`;

      // 替换 A2UI 消息中的所有 surfaceId 引用
      a2uiMessages = a2uiMessages.map((msg) => {
        const newMsg = { ...msg };

        if (newMsg.beginRendering?.surfaceId) {
          newMsg.beginRendering.surfaceId = surfaceId;
        }
        if (newMsg.surfaceUpdate?.surfaceId) {
          newMsg.surfaceUpdate.surfaceId = surfaceId;
        }
        if (newMsg.dataModelUpdate?.surfaceId) {
          newMsg.dataModelUpdate.surfaceId = surfaceId;
        }

        return newMsg;
      });

      const assistantMessage = {
        id: Date.now() + 1,
        type: "assistant",
        a2uiMessages: a2uiMessages,
        surfaceId: surfaceId, // 保存 surface ID
        timestamp: new Date(),
      };

      messages.value.unshift(assistantMessage);

      // 使用唯一的 surface ID 处理消息
      processor.processMessages(a2uiMessages, { clearBefore: false });
      scrollToBottom();
    }
  } catch (error) {
    console.error("Error sending message:", error);

    const errorMessage = {
      id: Date.now() + 1,
      type: "assistant",
      content: "抱歉,发送消息失败,请重试。",
      timestamp: new Date(),
    };
    messages.value.unshift(errorMessage);
  } finally {
    isLoading.value = false;
  }
};

const handleKeydown = (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
};

const handleAction = (action) => {
  console.log("Action received:", action);
};
</script>

<template>
  <div class="flex flex-col h-screen bg-gray-50">
    <!-- 聊天消息区域 -->
    <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
      <div
        v-for="message in messages.slice().reverse()"
        :key="message.id"
        class="flex"
        :class="message.type === 'user' ? 'justify-end' : 'justify-start'"
      >
        <Card
          class="max-w-[70%] p-4"
          :class="{
            'bg-primary text-primary-foreground': message.type === 'user',
            'bg-white': message.type === 'assistant',
          }"
        >
          <!-- 用户消息 -->
          <div v-if="message.type === 'user'" class="text-sm">
            {{ message.content }}
          </div>

          <!-- 助手消息 - 使用 A2UI 渲染 -->
          <div v-else-if="message.type === 'assistant' && message.a2uiMessages">
            <a2uiRender :surface-id="message.surfaceId" @action="handleAction" />
          </div>

          <!-- 错误消息 -->
          <div v-else-if="message.type === 'assistant' && message.content" class="text-sm">
            {{ message.content }}
          </div>
        </Card>
      </div>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="flex justify-start">
        <Card class="max-w-[70%] p-4 bg-white">
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
          </div>
        </Card>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="bg-white p-4">
      <div class="max-w-4xl mx-auto flex items-center space-x-2">
        <Input
          v-model="userInput"
          placeholder="输入消息..."
          class="flex-1"
          @keydown="handleKeydown"
        />
        <Button
          @click="sendMessage"
          :disabled="!userInput.trim() || isLoading"
          class="h-10 w-10 shrink-0"
        >
          <Send class="h-5 w-5" />
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.delay-100 {
  animation-delay: 0.1s;
}

.delay-200 {
  animation-delay: 0.2s;
}
</style>
