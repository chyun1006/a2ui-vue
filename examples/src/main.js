import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

// 导入组件库样式
import "../../lib/dist/a2ui-vue.css";
import "./styles/tailwind.css";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

app.mount("#app");
