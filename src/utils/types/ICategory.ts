import { ulid, type ULID } from "ulid";
import { DateTime } from "luxon";
import type { IField } from "@/utils/types/IField";
import type { IStatus } from "@/utils/types/IStatus.ts";
import { WhirlpoolLog } from "@/utils/types/WhirlpoolLog.ts";
import type { ITag } from "@/utils/types/ITag.ts";

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

export const DefaultFields: DefaultField[] = Object.keys(new WhirlpoolLog("placeholder"))
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
};

export type ICategory = {
	id: ULID;
	name: string;
	modifiedFields: DefaultField[];
	extraFields: IField[];
	displayOrder?: number;
	availableStatuses: IStatus[];
	tags: ITag[];
	color?: string;
	syncCode?: string;
	unsyncedChanges: boolean;
	updatedOn: DateTime;
	createdOn: DateTime;
	deletedOn?: DateTime;
};

export class Category {
	id: ULID;
	name: string;
	modifiedFields: DefaultField[];
	extraFields: IField[];
	order?: number;
	availableStatuses: IStatus[];
	color?: string;
	syncCode?: string;
	unsyncedChanges: boolean;
	updatedOn: DateTime;
	createdOn: DateTime;
	deletedOn?: DateTime;

	constructor(name: string) {
		this.id = ulid();
		this.name = name;
		this.modifiedFields = [];
		this.extraFields = [];
		this.order = 0;
		this.availableStatuses = [];
		this.unsyncedChanges = true;
		this.updatedOn = DateTime.now();
		this.createdOn = DateTime.now();
	}
}
