import { Entity } from "dexie";
import type DatabaseConfig from "@/utils/database/DatabaseConfig";
import type { IField } from "@/utils/types/IField"
import type { IStatus } from "@/utils/types/IStatus.ts"
import type { WhirlpoolFields } from "@/utils/types/ICategory.ts"

class DatabaseCategory extends Entity<DatabaseConfig> {
	id!: string;
	name!: string;
	modifiedFields!: { field: WhirlpoolFields; rename?: string; hidden: boolean }[];
	extraFields!: IField[];
	statuses!: IStatus[];
	color?: string;
	syncCode?: string;
	unsyncedChanges!: boolean;
	updatedOn!: Date;
	createdOn!: Date;
	deletedOn?: Date;
}

export default DatabaseCategory;
