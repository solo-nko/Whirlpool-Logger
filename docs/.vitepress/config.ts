import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	srcDir: "pages",

	title: "Whirlpool Logger",
	description: "Learn how to use the Whirlpool Logger here.",
	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		nav: [
			{ text: "Home", link: "/" },
			{ text: "User Guide", link: "/user-guide-main" }
		],

		sidebar: [
			{
				text: "User Interface",
				items: [
					{ text: "Home Screen", link: "/markdown-examples" },
					{ text: "Entry Screen" },
					{ text: "Records Table" },
					{
						text: "Settings Screen",
						items: [
							{
								text: "General Settings"
							},
							{
								text: "Theme Settings"
							},
							{
								text: "Import/Export",
								link: "/screens/settings/import-export"
							},
							{
								text: "Category Settings",
								link: "/screens/settings/category"
							}
						]
					}
				]
			},
			{
				text: "Other",
				items: [
					{
						text: "Progressive Web App"
					}
				]
			}
		],

		socialLinks: [{ icon: "github", link: "https://github.com/vuejs/vitepress" }]
	}
});
