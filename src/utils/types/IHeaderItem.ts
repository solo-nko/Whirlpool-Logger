import { WhirlpoolLog } from "@/utils/types/WhirlpoolLog.ts";

export type IHeaderItem = {
	title: string;
	value?: string;
	key?: string;
	sortable?: boolean;
	sortRaw?: (a: WhirlpoolLog, b: WhirlpoolLog) => number;
	align?: "start" | "end" | "center";
	width?: string | number;
	cellProps?: {
		class: string;
	};
	headerProps?: {
		class?: string;
	};
	// We're using any instead of never or unknown here because vuetify specifically calls for any in its headers filter prop.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	filter?: (value: any, query: string) => boolean;
};
