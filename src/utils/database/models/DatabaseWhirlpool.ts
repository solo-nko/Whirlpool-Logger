import { Entity } from "dexie";
import type { JSONContent } from "@tiptap/vue-3";
import type DatabaseConfig from "@/utils/database/DatabaseConfig";
import type { IFieldValue } from "@/utils/types/IFieldValue";

// Important: every property declared here needs to be mapped in DatabaseConfig or the database won't work correctly.

class DatabaseWhirlpool extends Entity<DatabaseConfig> {
	id!: string;
	categoryId?: string;
	title!: string;
	statusId?: string;
	chapter?: number;
	volume?: number;
	series?: string;
	progress?: string;
	rating?: number;
	notes?: JSONContent;
	syncCode?: string;
	unsyncedChanges!: boolean;
	extraFieldValues!: IFieldValue[];
	tagIds!: string[];
	deletedOn?: Date;
	userUpdatedOn?: string;
	updatedOn!: Date;
	createdOn!: Date;
}

export default DatabaseWhirlpool;
