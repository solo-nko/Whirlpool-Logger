import type { Preview } from "@storybook/vue3-vite"
import { setup } from "@storybook/vue3"
import { createPinia } from "pinia"
import vuetify from "../.plugins/vuetify"
import { withVuetifyTheme } from "./withVuetifyTheme.decorator"
import "../src/assets/styles/layers.css"
import "../src/assets/styles/tailwind.css"
import "@mdi/font/css/materialdesignicons.css"
import "vuetify/styles"

setup((app) => {
	app.use(vuetify)
	app.use(createPinia())
})

const preview: Preview = {
	parameters: {
		decorators: { withVuetifyTheme },
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i
			}
		},

		a11y: {
			// 'error' - fail CI on a11y violations
			// 'off' - skip a11y checks entirely
			test: "todo"
		}
	}
}

export default preview
