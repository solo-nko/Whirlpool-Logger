import eslint from "@eslint/js"
import { globalIgnores } from "eslint/config"
import pluginVue from "eslint-plugin-vue"
import skipFormatting from "eslint-config-prettier/flat"
import importPlugin from "eslint-plugin-import"
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript"

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
	eslint.configs.recommended,
	vueTsConfigs.recommended,
	...pluginVue.configs["flat/recommended"],
	skipFormatting,
	importPlugin.flatConfigs.recommended,
	globalIgnores([
		"**/dist/**",
		"**/dist-ssr/**",
		"**/coverage/**",
		".storybook/stories/",
		"*.d.ts",
		"**/storybook-static/**"
	]),
	{
		files: ["**/*.{vue,ts,mts,tsx}"],
		rules: {
			"import/no-unresolved": "off",
			"import/order": "warn",
			"no-unused-vars": "off",
			"@typescript-eslint/no-unused-vars": "warn",
			"vue-no-unused-vars": "off",
			"vue/v-slot-style": ["warn", { named: "longform" }]
		}
	},
	{
		// multi-word component names are annoying to work with for the router's file-based routing, so i'll turn it off
		files: ["src/pages/*.vue"],
		rules: {
			"vue/multi-word-component-names": "off"
		}
	}
)
