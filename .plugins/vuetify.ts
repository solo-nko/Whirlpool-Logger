import "../src/assets/styles/layers.css";
import { aliases, mdi } from "vuetify/iconsets/mdi-svg";
import "vuetify/styles";
import { createVuetify } from "vuetify";
import luxonAdaptor from "@date-io/luxon";
import {
	mdiHome,
	mdiPlus,
	mdiTable,
	mdiCog,
	mdiUndo,
	mdiRedo,
	mdiFormatBold,
	mdiFormatItalic,
	mdiFormatUnderline,
	mdiFormatStrikethroughVariant,
	mdiFormatColorText,
	mdiColorHelper,
	mdiFormatColorHighlight,
	mdiFormatAlignJustify,
	mdiFormatListBulleted,
	mdiFormatListNumbered,
	mdiLinkVariant,
	mdiBrushOff,
	mdiClose,
	mdiCheck,
	mdiCogs,
	mdiSwapVertical,
	mdiPaletteSwatch,
	mdiClipboardEdit,
	mdiInformation,
	mdiArrowULeftTop,
	mdiDelete,
	mdiPencil
} from "@mdi/js";
import SpiralIcon from "@/components/common/SpiralIcon.vue";
import { lizardMint, royalCobalt, wineSplash } from "@/utils/config/themes/darkThemes.ts";

export default createVuetify({
	date: {
		adapter: luxonAdaptor
	},
	theme: {
		defaultTheme: "lizardMint",
		utilities: false,
		themes: {
			royalCobalt,
			wineSplash,
			lizardMint
		}
	},
	icons: {
		defaultSet: "mdi",
		aliases: {
			...aliases,
			home: mdiHome,
			plus: mdiPlus,
			table: mdiTable,
			cog: mdiCog,
			cogs: mdiCogs,
			swap: mdiSwapVertical,
			paletteSwatch: mdiPaletteSwatch,
			clipboard: mdiClipboardEdit,
			info: mdiInformation,
			undo: mdiUndo,
			redo: mdiRedo,
			bold: mdiFormatBold,
			italic: mdiFormatItalic,
			underline: mdiFormatUnderline,
			strike: mdiFormatStrikethroughVariant,
			textColor: mdiFormatColorText,
			highlightColor: mdiFormatColorHighlight,
			colorBar: mdiColorHelper,
			alignText: mdiFormatAlignJustify,
			bulletList: mdiFormatListBulleted,
			numberList: mdiFormatListNumbered,
			link: mdiLinkVariant,
			removeFormatting: mdiBrushOff,
			close: mdiClose,
			check: mdiCheck,
			revert: mdiArrowULeftTop,
			trash: mdiDelete,
			edit: mdiPencil,
			spiral: SpiralIcon
		},
		sets: {
			mdi
		}
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
