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

router.onError((error: Error, to) => {
	if (
		error.message.includes("Failed to fetch dynamically imported module") ||
		error.message.includes("Importing a module script failed")
	) {
		if (to.fullPath) {
			window.location.reload();
		} else {
			window.location.href = to.fullPath;
		}
	}
});

export default router;
