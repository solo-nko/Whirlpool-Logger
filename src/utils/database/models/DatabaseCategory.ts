import { Entity } from "dexie";
import { DateTime } from "luxon";
import type DatabaseConfig from "@/utils/database/DatabaseConfig";
import type { IField } from "@/utils/types/IField";
import { DatabaseStatus } from "@/utils/database/models/DatabaseStatus.ts";
import type { ITag } from "@/utils/types/ITag.ts";
import type { DefaultField } from "@/utils/DefaultFieldUtils.ts";
import type { Category } from "@/utils/types/Category.ts";
import { DeepToRaw } from "@/utils/MiscUtils.ts";

class DatabaseCategory {
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
	updatedOn!: string;
	createdOn!: string;
	deletedOn!: string | null;

	static ConvertCategoryForDatabase(params: {
		input: Category;
		toRaw?: boolean;
	}): DatabaseCategory {
		if (params.toRaw) {
			return {
				...params.input,
				modifiedFields: DeepToRaw(params.input.modifiedFields),
				extraFields: DeepToRaw(params.input.extraFields),
				tags: DeepToRaw(params.input.tags),
				availableStatuses: params.input.availableStatuses.map((status) =>
					DatabaseStatus.ConvertStatusForDatabase(status)
				),
				updatedOn: params.input.updatedOn.toISO() ?? "unknown",
				createdOn: params.input.createdOn.toISO() ?? "unknown",
				deletedOn:
					params.input.deletedOn === null ? null : (params.input.deletedOn.toISODate() ?? "")
			};
		}
		return {
			...params.input,
			availableStatuses: params.input.availableStatuses.map((status) =>
				DatabaseStatus.ConvertStatusForDatabase(status)
			),
			updatedOn: params.input.updatedOn.toISODate() ?? "unknown",
			createdOn: params.input.createdOn.toISODate() ?? "unknown",
			deletedOn: params.input.deletedOn === null ? null : (params.input.deletedOn.toISO() ?? "")
		};
	}

	static ConvertCategoryFromDatabase(input: DatabaseCategory): Category {
		return {
			...input,
			availableStatuses: input.availableStatuses.map((status) =>
				DatabaseStatus.ConvertStatusesFromDatabase(status)
			),
			updatedOn: DateTime.fromISO(input.updatedOn),
			deletedOn: input.deletedOn === null ? input.deletedOn : DateTime.fromISO(input.deletedOn),
			createdOn: DateTime.fromISO(input.createdOn)
		};
	}
}

// When changing fields here, make sure to also change their name in DatabaseConfig!
class InternalDatabaseCategory extends Entity<DatabaseConfig> implements DatabaseCategory {
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
	updatedOn!: string;
	createdOn!: string;
	deletedOn!: string | null;
}

export { DatabaseCategory, InternalDatabaseCategory };
