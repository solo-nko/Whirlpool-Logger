import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			redirect: "/home"
		},
		{
			path: "/home",
			component: () => import("@/pages/Home.vue")
		},
		{
			path: "/entry",
			component: () => import("@/pages/Entry.vue")
		},
		{
			path: "/records",
			component: () => import("@/pages/Records.vue")
		},
		{
			path: "/settings",
			component: () => import("@/pages/Settings.vue")
		}
	]
});

export default router;
