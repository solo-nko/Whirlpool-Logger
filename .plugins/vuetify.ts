import "../src/assets/styles/layers.css"
import "@mdi/font/css/materialdesignicons.css"
import "vuetify/styles"
import { createVuetify } from "vuetify"
import luxonAdaptor from '@date-io/luxon'

export default createVuetify({
	date: {
		adapter: luxonAdaptor
	},
	theme: {
		defaultTheme: "system",
		utilities: false
	}
})
