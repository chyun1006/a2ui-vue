import { createRouter, createWebHistory } from "vue-router";
import DefaultLayout from "../layouts/DefaultLayout.vue";
import EmptyLayout from "../layouts/EmptyLayout.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 默认布局路由（带导航栏）
    {
      path: "/",
      component: DefaultLayout,
      children: [
        {
          path: "",
          name: "home",
          redirect: "/comprehensive",
        },
        {
          path: "comprehensive",
          name: "comprehensive",
          component: () => import("../views/AllComponents.vue"),
          meta: { title: "综合演示" },
        },
        {
          path: "chat-demo1",
          name: "chat-demo1",
          component: () => import("../views/ChatDemo1.vue"),
          meta: { title: "聊天演示1" },
        },
        {
          path: "chat-demo2",
          name: "chat-demo2",
          component: () => import("../views/ChatDemo2.vue"),
          meta: { title: "浩哥" },
        },
        {
          path: "chat-demo3",
          name: "chat-demo3",
          component: () => import("../views/ChatDemo3.vue"),
          meta: { title: "立哥" },
        },
      ],
    },
    {
      path: "/chat",
      component: EmptyLayout,
      children: [
        {
          path: "demo1",
          name: "demo1",
          component: () => import("../views/Demo1.vue"),
          meta: { title: "Demo1" },
        },
        {
          path: "/demo2",
          name: "demo2",
          component: () => import("../views/Demo2.vue"),
          meta: { title: "聊天Demo" },
        },
      ],
    },
  ],
});

export default router;
