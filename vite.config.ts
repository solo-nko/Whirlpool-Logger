/// <reference types="vitest/config" />
import { fileURLToPath, URL } from "node:url";
import path from "node:path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import vuetify from "vite-plugin-vuetify";
import tailwindcss from "@tailwindcss/vite";
import vueRouter from "vue-router/vite";
import autoimport from "unplugin-auto-import/vite";
import fonts from "unplugin-fonts/vite";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";

const dirname =
	typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// https://github.com/storybookjs/storybook/issues/32462
// The gist is that storybook and vuedevtools conflict. Storybook won't start correctly if vuedevtools is enabled
const isStorybookProcess = process.env.npm_lifecycle_event === "storybook";

export default defineConfig({
	plugins: [
		vueRouter(),
		vue(),
		autoimport({ dts: true, imports: ["vue", "@vueuse/core", "vue-router", "pinia"] }),
		!isStorybookProcess && vueDevTools(),
		vuetify({
			autoImport: true,
			styles: {
				configFile: "src/assets/styles/settings.scss"
			}
		}),
		fonts({
			fontsource: {
				families: [
					{
						name: "Bricolage Grotesque",
						weights: [300, 400, 500, 700]
					},
					{
						name: "Sen",
						weights: [400, 500, 700]
					},
					{
						name: "Sometype Mono",
						weights: [400, 700]
					}
				]
			}
		}),
		tailwindcss()
	],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url))
		}
	},
	test: {
		projects: [
			{
				extends: true,
				plugins: [
					// The plugin will run tests for the stories defined in your Storybook config
					// See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
					storybookTest({
						configDir: path.join(dirname, ".storybook")
					})
				],
				test: {
					name: "storybook",
					browser: {
						enabled: true,
						headless: true,
						provider: playwright({}),
						instances: [
							{
								browser: "chromium"
							}
						]
					},
					setupFiles: [".storybook/vitest.setup.ts"]
				}
			}
		]
	}
});
