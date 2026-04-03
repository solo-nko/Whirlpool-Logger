import { Entity } from "dexie";
import { DateTime } from "luxon";
import type DatabaseConfig from "@/utils/database/DatabaseConfig";
import type { IField } from "@/utils/types/IField";
import { DatabaseStatus } from "@/utils/database/models/DatabaseStatus.ts";
import type { ITag } from "@/utils/types/ITag.ts";
import type { DefaultField } from "@/utils/types/DefaultFieldUtils.ts";
import type { Category } from "@/utils/types/Category.ts";
import { DeepToRaw } from "@/utils/Utilities.ts";

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
	updatedOn!: Date;
	createdOn!: Date;
	deletedOn!: Date | null;

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
				updatedOn: params.input.updatedOn.toJSDate(),
				createdOn: params.input.createdOn.toJSDate(),
				deletedOn: params.input.deletedOn === null ? null : params.input.deletedOn.toJSDate()
			};
		}
		return {
			...params.input,
			availableStatuses: params.input.availableStatuses.map((status) =>
				DatabaseStatus.ConvertStatusForDatabase(status)
			),
			updatedOn: params.input.updatedOn.toJSDate(),
			createdOn: params.input.createdOn.toJSDate(),
			deletedOn: params.input.deletedOn === null ? null : params.input.deletedOn.toJSDate()
		};
	}

	static ConvertCategoryFromDatabase(input: DatabaseCategory): Category {
		return {
			...input,
			availableStatuses: input.availableStatuses.map((status) =>
				DatabaseStatus.ConvertStatusesFromDatabase(status)
			),
			updatedOn: DateTime.fromJSDate(input.updatedOn),
			deletedOn: input.deletedOn === null ? input.deletedOn : DateTime.fromJSDate(input.deletedOn),
			createdOn: DateTime.fromJSDate(input.createdOn)
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
	updatedOn!: Date;
	createdOn!: Date;
	deletedOn!: Date | null;
}

export { DatabaseCategory, InternalDatabaseCategory };
