import { Entity } from "dexie";
import type { JSONContent } from "@tiptap/vue-3";
import type DatabaseConfig from "@/utils/database/DatabaseConfig";
import type { IFieldValue } from "@/utils/types/IFieldValue";

class DatabaseWhirlpool extends Entity<DatabaseConfig> {
	id!: string;
	categoryId?: string;
	title!: string;
	status?: string;
	chapter?: number;
	volume?: number;
	series?: string;
	progress?: string;
	rating?: number;
	notes?: JSONContent;
	syncCode?: string;
	unsyncedChanges!: boolean;
	extraFieldValues!: IFieldValue[];
	tags!: string[];
	deletedOn?: Date;
	userUpdatedOn?: string;
	updatedOn!: Date;
	createdOn!: Date;
}

export default DatabaseWhirlpool;
