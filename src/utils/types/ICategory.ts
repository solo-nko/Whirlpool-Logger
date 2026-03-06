import { ulid, type ULID } from "ulid";
import { DateTime } from "luxon";
import type { IField } from "@/utils/types/IField";
import type { IStatus } from "@/utils/types/IStatus.ts";
import type { WhirlpoolLog } from "@/utils/types/WhirlpoolLog.ts";

export type WhirlpoolFields = keyof Omit<
	WhirlpoolLog,
	"id" | "syncCode" | "extraFields" | "unsyncedChanges" | "deletedOn" | "updatedOn"
>;

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
