import { WhirlpoolLog } from "@/utils/types/WhirlpoolLog.ts";

export type IHeaderItem = {
	title: string;
	value?: string;
	key?: string;
	sortable?: boolean;
	sortRaw?: (a: WhirlpoolLog, b: WhirlpoolLog) => number;
};
