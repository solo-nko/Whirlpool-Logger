import { Entity } from "dexie";
import type DatabaseConfig from "@/utils/database/DatabaseConfig";
import type { IFieldValue } from "@/utils/types/IFieldValue";
import type { DatabaseStatus } from "@/utils/database/models/DatabaseStatus.ts";
import type { ITag } from "@/utils/types/ITag.ts";
import type DatabaseNote from "@/utils/database/models/DatabaseNote.ts";

// Important: every property declared here needs to be mapped in DatabaseConfig or the database won't work correctly.
class DatabaseWhirlpool {
	id!: string;
	categoryId!: string;
	title!: string;
	status?: DatabaseStatus;
	chapter?: number;
	volume?: number;
	series?: string;
	progress?: string;
	rating?: number;
	notes!: DatabaseNote[];
	syncCode?: string;
	unsyncedChanges!: boolean;
	extraFieldValues!: IFieldValue[];
	tags!: ITag[];
	deletedOn!: string | null;
	userUpdatedOn?: string;
	updatedOn!: string;
	createdOn!: string;
}

class InternalDatabaseWhirlpool extends Entity<DatabaseConfig> implements DatabaseWhirlpool {
	id!: string;
	categoryId!: string;
	title!: string;
	status?: DatabaseStatus;
	chapter?: number;
	volume?: number;
	series?: string;
	progress?: string;
	rating?: number;
	notes!: DatabaseNote[];
	syncCode?: string;
	unsyncedChanges!: boolean;
	extraFieldValues!: IFieldValue[];
	tags!: ITag[];
	deletedOn!: string | null;
	userUpdatedOn?: string;
	updatedOn!: string;
	createdOn!: string;
}

export { DatabaseWhirlpool, InternalDatabaseWhirlpool };
