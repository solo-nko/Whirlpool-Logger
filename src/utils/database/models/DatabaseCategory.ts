import { Entity } from "dexie";
import type DatabaseConfig from "@/utils/database/DatabaseConfig";
import type { IField } from "@/utils/types/IField";
import type { DefaultField } from "@/utils/types/ICategory.ts";
import type { DatabaseStatus } from "@/utils/database/models/DatabaseStatus.ts";
import type { ITag } from "@/utils/types/ITag.ts";

// When changing fields here, make sure to also change their name in DatabaseConfig!
class DatabaseCategory extends Entity<DatabaseConfig> {
	id!: string;
	name!: string;
	modifiedFields!: DefaultField[];
	extraFields!: IField[];
	displayOrder?: number;
	availableStatuses!: DatabaseStatus[];
	tags!: ITag[];
	color?: string;
	syncCode?: string;
	unsyncedChanges!: boolean;
	updatedOn!: Date;
	createdOn!: Date;
	deletedOn?: Date;
}

export default DatabaseCategory;
