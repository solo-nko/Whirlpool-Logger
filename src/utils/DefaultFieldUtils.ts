import { WhirlpoolLog } from "@/utils/types/WhirlpoolLog.ts";
import { IsDefaultFieldHiddenInTable } from "@/utils/database/DatabaseUtils.ts";

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
			hideInEntryForm: false,
			hideInTable: IsDefaultFieldHiddenInTable(key as WhirlpoolFields)
		};
	});

export type DefaultField = {
	field: WhirlpoolFields;
	rename?: string;
	placeholder?: string;
	hideInEntryForm: boolean;
	// TODO: add db transformer/upgrader function for these two, as well as for "hidden" renamed to "hideInEntryForm"
	hideInTable: boolean;
	headerOrder?: number;
};
