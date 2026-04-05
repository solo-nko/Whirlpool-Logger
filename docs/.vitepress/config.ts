import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	srcDir: "pages",

	title: "Whirlpool Logger User Guide",
	description: "Learn how to use the Whirlpool Logger here.",
	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		nav: [
			{ text: "Home", link: "/" },
			{ text: "Examples", link: "/markdown-examples" }
		],

		sidebar: [
			{
				text: "Examples",
				items: [
					{ text: "Markdown Examples", link: "/markdown-examples" },
					{ text: "Runtime API Examples", link: "/api-examples" }
				]
			},
			{
				text: "Main Pages",
				items: [{ text: "Home" }, { text: "Entry" }, { text: "Records" }, { text: "Settings" }]
			}
		],

		socialLinks: [{ icon: "github", link: "https://github.com/vuejs/vitepress" }]
	}
});
