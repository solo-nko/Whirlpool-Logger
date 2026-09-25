import { WhirlpoolLog } from "@/utils/types/WhirlpoolLog.ts";

export type WhirlpoolFields = keyof Omit<
	WhirlpoolLog,
	| "id"
	| "categoryId"
	| "title"
	| "syncCode"
	| "extraFieldValues"
	| "unsyncedChanges"
	| "deletedOn"
	| "updatedOn"
	| "createdOn"
>;

export const DefaultFields: DefaultField[] = Object.keys(new WhirlpoolLog("placeholder", "unknown"))
	.filter((key) => {
		return (
			key !== "id" &&
			key !== "categoryId" &&
			key !== "title" &&
			key !== "syncCode" &&
			key !== "extraFieldValues" &&
			key !== "unsyncedChanges" &&
			key !== "deletedOn" &&
			key !== "updatedOn" &&
			key !== "createdOn"
		);
	})
	.map((key) => {
		return {
			field: key as WhirlpoolFields,
			hidden: false
		};
	});

export type DefaultField = {
	field: WhirlpoolFields;
	rename?: string;
	placeholder?: string;
	hidden: boolean;
	hideInTable?: boolean;
};
