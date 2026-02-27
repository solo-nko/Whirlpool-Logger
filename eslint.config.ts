import eslint from "@eslint/js"
// import { globalIgnores, defineConfig } from "eslint/config"
// import { defineConfigWithVueTs, vueTsConfigs, vueTsConfigsm } from "@vue/eslint-config-typescript"

import pluginVue from "eslint-plugin-vue"
import skipFormatting from "eslint-config-prettier/flat"
import importPlugin from "eslint-plugin-import"
import { vueTsConfigs } from "@vue/eslint-config-typescript"
import { defineConfig } from "eslint/config"

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfig(
	eslint.configs.recommended,
	vueTsConfigs.recommended,
	...pluginVue.configs["flat/recommended"],
	skipFormatting,
	importPlugin.flatConfigs.recommended,
	{
		files: ["**/*.{vue,ts,mts,tsx}"],
		ignores: ["**/dist/**", "**/dist-ssr/**", "**/coverage/**", "**/.storybook/stories/**, *.d.ts"],
		rules: {
			"import/order": "warn",
			"no-unused-vars": "warn",
			"@typescript-eslint/no-unused-vars": "off",
			"vue-no-unused-vars": "off",
			"vue/v-slot-style": ["warn", { named: "longform" }]
		}
	}
)

// original config
/*export default defineConfigWithVueTs(
	{
		name: "app/files-to-lint",
		files: ["**!/!*.{vue,ts,mts,tsx}"],
		rules: {
			"no-unused-vars": "warn",
			"@typescript-eslint/no-unused-vars": "off",
			"vue-no-unused-vars": "off",
			"vue/v-slot-style": ["warn", { named: "longform" }]
		}
	},
	globalIgnores(["**!/dist/!**", "**!/dist-ssr/!**", "**!/coverage/!**", "**!/.storybook/stories/!**"]),

	...pluginVue.configs["flat/essential"],
	vueTsConfigs.recommended,
	skipFormatting
)*/
