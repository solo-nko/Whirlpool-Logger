import { createApp } from "vue";
import { createPinia } from "pinia";
import vuetify from "../.plugins/vuetify.ts";

import router from "../.plugins/router.ts";
import App from "./App.vue";

import "unfonts.css";
import "./assets/styles/tailwind.css";
import "./assets/styles/main.scss";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(vuetify);

app.mount("#app");
