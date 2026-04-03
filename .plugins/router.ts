import { createRouter, createWebHistory } from "vue-router";
import entry from "@/pages/Entry.vue";
import records from "@/pages/Records.vue";
import settings from "@/pages/Settings.vue";
import home from "@/pages/Home.vue";

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			redirect: "/home"
		},
		{
			path: "/home",
			component: home
		},
		{
			path: "/entry",
			component: entry
		},
		{
			path: "/records",
			component: records
		},
		{
			path: "/settings",
			component: settings
		}
	]
});

export default router;
