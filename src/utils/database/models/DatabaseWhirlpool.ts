import { Entity } from "dexie";
import type { HTMLContent } from "@tiptap/vue-3";
import type DatabaseConfig from "@/utils/database/DatabaseConfig";
import type { IFieldValue } from "@/utils/types/IFieldValue";
import type { DatabaseCategory } from "@/utils/database/models/DatabaseCategory.ts";
import type { DatabaseStatus } from "@/utils/database/models/DatabaseStatus.ts";
import type { ITag } from "@/utils/types/ITag.ts";

// Important: every property declared here needs to be mapped in DatabaseConfig or the database won't work correctly.
class DatabaseWhirlpool {
	id!: string;
	category!: DatabaseCategory;
	title!: string;
	status?: DatabaseStatus;
	chapter?: number;
	volume?: number;
	series?: string;
	progress?: string;
	rating?: number;
	notes?: HTMLContent;
	syncCode?: string;
	unsyncedChanges!: boolean;
	extraFieldValues!: IFieldValue[];
	tags!: ITag[];
	deletedOn!: Date | null;
	userUpdatedOn?: string;
	updatedOn!: Date;
	createdOn!: Date;
}

class InternalDatabaseWhirlpool extends Entity<DatabaseConfig> implements DatabaseWhirlpool {
	id!: string;
	category!: DatabaseCategory;
	title!: string;
	status?: DatabaseStatus;
	chapter?: number;
	volume?: number;
	series?: string;
	progress?: string;
	rating?: number;
	notes?: HTMLContent;
	syncCode?: string;
	unsyncedChanges!: boolean;
	extraFieldValues!: IFieldValue[];
	tags!: ITag[];
	deletedOn!: Date | null;
	userUpdatedOn?: string;
	updatedOn!: Date;
	createdOn!: Date;
}

export { DatabaseWhirlpool, InternalDatabaseWhirlpool };
