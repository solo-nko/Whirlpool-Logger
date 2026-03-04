import "../src/assets/styles/layers.css";
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import { createVuetify } from "vuetify";
import luxonAdaptor from "@date-io/luxon";

export default createVuetify({
	date: {
		adapter: luxonAdaptor
	},
	theme: {
		defaultTheme: "system",
		utilities: false
	},
	display: {
		mobileBreakpoint: "md",
		thresholds: {
			// repeated in tailwind.css and settings.scss
			xs: 0,
			sm: 400,
			md: 840,
			lg: 1145,
			xl: 1540,
			xxl: 2140
		}
	}
});
