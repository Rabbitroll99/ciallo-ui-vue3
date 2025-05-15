import { createApp } from "vue";
import App from "./App.vue";
import "./index.css";
import { createWebHashHistory, createRouter } from "vue-router";
import Rabbit from "./components/rabbit.vue";
import Rabbit2 from "./components/rabbit2.vue";

const history = createWebHashHistory();
const router = createRouter({
  history: history,
  routes: [
    { path: "/", component: Rabbit },
    { path: "/xxx", component: Rabbit2 },
  ],
});

const app = createApp(App);
app.use(router);
app.mount("#app");
