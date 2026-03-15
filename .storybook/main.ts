import type { StorybookConfig } from "@storybook/vue3-vite";

const config: StorybookConfig = {
	stories: ["./stories/*.stories.@(js|jsx|mjs|ts|tsx)", "./stories/*.mdx"],
	addons: [
		"@chromatic-com/storybook",
		"@storybook/addon-vitest",
		"@storybook/addon-a11y",
		"@storybook/addon-docs"
	],
	framework: {
		name: "@storybook/vue3-vite",
		options: {
			docgen: "vue-component-meta"
		}
	}
};
export default config;
