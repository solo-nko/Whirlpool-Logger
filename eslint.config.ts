import { globalIgnores } from "eslint/config";
import pluginVue from "eslint-plugin-vue";
import skipFormatting from "eslint-config-prettier/flat";
import { importX } from "eslint-plugin-import-x";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
	// global rules
	vueTsConfigs.recommended,
	importX.flatConfigs.recommended,
	importX.flatConfigs.typescript,
	...pluginVue.configs["flat/recommended"],
	skipFormatting,
	globalIgnores([
		"**/dist/**",
		"**/dist-ssr/**",
		"**/dev-dist/**",
		"**/coverage/**",
		".storybook/stories/",
		"**/.vitepress/",
		"*.d.ts",
		"src/server-hooks/types.d.ts",
		"**/storybook-static/**"
	]),
	// rules per-filetype
	{
		files: ["**/*.{vue,ts,mts,tsx}"],
		plugins: {
			"import-x": importX
		},
		// needed in order to resolve TypeScript imports correctly
		settings: {
			"import/resolver": {
				typescript: true,
				node: true
			}
		},
		// global exceptions
		rules: {
			"no-console": "warn",
			"import-x/no-unresolved": "off",
			"import-x/order": "warn",
			"no-unused-vars": "off",
			"@typescript-eslint/no-unused-vars": "warn",
			"vue-no-unused-vars": "off",
			"vue/v-slot-style": ["warn", { named: "longform" }],
			"vue/require-default-prop": "off"
		}
	},
	{
		// multi-word component names are annoying to work with for the router's file-based routing, so I'll turn it off
		files: ["src/pages/*.vue"],
		rules: {
			"vue/multi-word-component-names": "off"
		}
	},
	{
		files: ["src/utils/QuillImporter.ts"],
		rules: {
			"no-console": "off"
		}
	}
);
