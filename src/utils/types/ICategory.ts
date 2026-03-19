import { ulid, type ULID } from "ulid";
import { DateTime } from "luxon";
import type { IField } from "@/utils/types/IField";
import type { IStatus } from "@/utils/types/IStatus.ts";
import type { ITag } from "@/utils/types/ITag.ts";
import type { DefaultField } from "@/utils/types/DefaultFieldUtils.ts";

// export type ICategory = {
// 	id: ULID;
// 	name: string;
// 	modifiedFields: DefaultField[];
// 	extraFields: IField[];
// 	displayOrder?: number;
// 	availableStatuses: IStatus[];
// 	tags: ITag[];
// 	color?: string;
// 	syncCode?: string;
// 	unsyncedChanges: boolean;
// 	updatedOn: DateTime;
// 	createdOn: DateTime;
// 	deletedOn?: DateTime;
// };

export class Category {
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
	deletedOn: DateTime | null;

	constructor(name: string) {
		this.id = ulid();
		this.name = name;
		this.modifiedFields = [];
		this.extraFields = [];
		this.displayOrder = 5;
		this.availableStatuses = [];
		this.tags = [];
		this.unsyncedChanges = true;
		this.updatedOn = DateTime.now();
		this.createdOn = DateTime.now();
		this.deletedOn = null;
	}
}

const placeHolderCategory = new Category("placeholderCategory");
