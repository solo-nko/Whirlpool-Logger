import { Entity } from "dexie";
import type DatabaseConfig from "@/utils/database/DatabaseConfig";
import type { IFieldValue } from "@/utils/types/IFieldValue";

class DatabaseWhirlpool extends Entity<DatabaseConfig> {
	id!: string
	categoryId?: string
	title!: string
	status?: string
	chapter?: number
	volume?: number
	series?: string
	progress?: string
	rating?: number
	notes?: unknown
	syncCode?: string
	unsyncedChanges!: boolean
	extraFieldValues!: IFieldValue[]
	deletedOn?: Date
	userUpdatedOn?: Date
	updatedOn!: Date
	createdOn!: Date
}

export default DatabaseWhirlpool;
