import { Dexie, type EntityTable } from "dexie";
import { DateTime } from "luxon";
import { ulid } from "ulid";
import {
	DatabaseWhirlpool,
	InternalDatabaseWhirlpool
} from "@/utils/database/models/DatabaseWhirlpool";
import {
	DatabaseCategory,
	InternalDatabaseCategory
} from "@/utils/database/models/DatabaseCategory";
import type { Category } from "@/utils/types/Category.ts";
import {
	UpgradeDefaultFieldFromV1,
	UpgradeExtraFieldFromV1,
	UpgradeNoteFromV1
} from "@/utils/database/DatabaseUtils.ts";

const now = DateTime.now();
const defaultCategories: Category[] = [
	{
		id: ulid(),
		name: "Games",
		modifiedFields: [
			{ field: "chapter", hideInEntryForm: true, hideInTable: true },
			{ field: "volume", hideInEntryForm: true, hideInTable: true },
			{ field: "progress", hideInEntryForm: false, hideInTable: true },
			{ field: "notes", hideInEntryForm: false, hideInTable: true }
		],
		extraFields: [],
		displayOrder: 1,
		availableStatuses: [
			{
				id: ulid(),
				name: "Playing",
				createdOn: now,
				deletedOn: null
			},
			{
				id: ulid(),
				name: "Completed",
				createdOn: now,
				deletedOn: null
			},
			{
				id: ulid(),
				name: "Replaying",
				createdOn: now,
				deletedOn: null
			},
			{
				id: ulid(),
				name: "Dropped",
				createdOn: now,
				deletedOn: null
			},
			{
				id: ulid(),
				name: "Hiatus",
				createdOn: now,
				deletedOn: null
			}
		],
		tags: [],
		updatedOn: now,
		createdOn: now,
		deletedOn: null,
		unsyncedChanges: true
	},
	{
		id: ulid(),
		name: "TV",
		modifiedFields: [
			{ field: "series", hideInEntryForm: true, hideInTable: false },
			{ field: "chapter", rename: "Episode", hideInEntryForm: false, hideInTable: true },
			{ field: "volume", rename: "Season", hideInEntryForm: false, hideInTable: true },
			{ field: "progress", hideInEntryForm: false, hideInTable: true },
			{ field: "notes", hideInEntryForm: false, hideInTable: true },
			{ field: "userUpdatedOn", rename: "Last Updated", hideInEntryForm: false, hideInTable: false }
		],
		extraFields: [],
		displayOrder: 2,
		availableStatuses: [
			{
				id: ulid(),
				name: "Watching",
				createdOn: now,
				deletedOn: null
			},
			{
				id: ulid(),
				name: "Completed",
				createdOn: now,
				deletedOn: null
			},
			{
				id: ulid(),
				name: "Rewatching",
				createdOn: now,
				deletedOn: null
			},
			{
				id: ulid(),
				name: "Dropped",
				createdOn: now,
				deletedOn: null
			},
			{
				id: ulid(),
				name: "Hiatus",
				createdOn: now,
				deletedOn: null
			}
		],
		tags: [],
		updatedOn: now,
		createdOn: now,
		unsyncedChanges: true,
		deletedOn: null
	},
	{
		id: ulid(),
		name: "Movies",
		modifiedFields: [
			{ field: "chapter", hideInEntryForm: true, hideInTable: true },
			{ field: "volume", hideInEntryForm: true, hideInTable: true },
			{ field: "progress", hideInEntryForm: false, hideInTable: true },
			{ field: "notes", hideInEntryForm: false, hideInTable: true }
		],
		extraFields: [],
		displayOrder: 3,
		availableStatuses: [
			{
				id: ulid(),
				name: "Watching",
				createdOn: now,
				deletedOn: null
			},
			{
				id: ulid(),
				name: "Completed",
				createdOn: now,
				deletedOn: null
			},
			{
				id: ulid(),
				name: "Planned",
				createdOn: now,
				deletedOn: null
			},
			{
				id: ulid(),
				name: "Dropped",
				createdOn: now,
				deletedOn: null
			},
			{
				id: ulid(),
				name: "Hiatus",
				createdOn: now,
				deletedOn: null
			}
		],
		tags: [],
		updatedOn: now,
		createdOn: now,
		deletedOn: null,
		unsyncedChanges: true
	},
	{
		id: ulid(),
		name: "Books",
		modifiedFields: [
			{ field: "volume", rename: "Book", hideInEntryForm: false, hideInTable: true },
			{ field: "chapter", hideInEntryForm: true, hideInTable: true },
			{ field: "progress", hideInEntryForm: false, hideInTable: true },
			{ field: "notes", hideInEntryForm: false, hideInTable: true }
		],
		extraFields: [],
		displayOrder: 4,
		availableStatuses: [
			{
				id: ulid(),
				name: "Reading",
				createdOn: now,
				deletedOn: null
			},
			{
				id: ulid(),
				name: "Completed",
				createdOn: now,
				deletedOn: null
			},
			{
				id: ulid(),
				name: "Rereading",
				createdOn: now,
				deletedOn: null
			},
			{
				id: ulid(),
				name: "Dropped",
				createdOn: now,
				deletedOn: null
			},
			{
				id: ulid(),
				name: "Hiatus",
				createdOn: now,
				deletedOn: null
			}
		],
		tags: [],
		updatedOn: now,
		createdOn: now,
		deletedOn: null,
		unsyncedChanges: true
	}
];

class DatabaseConfig extends Dexie {
	whirlpools!: EntityTable<DatabaseWhirlpool, "id">;
	categories!: EntityTable<DatabaseCategory, "id">;

	constructor() {
		super("LoggerDB");
		this.version(1).stores({
			whirlpools:
				"id, categoryId, title, status, chapter, volume, series, progress, rating, notes, syncCode, unsyncedChanges, extraFieldValues, tags, deletedOn, userUpdatedOn, updatedOn, createdOn",
			categories:
				"id, name, modifiedFields, extraFields, displayOrder, availableStatuses, tags, color, syncCode, unsyncedChanges, updatedOn, createdOn, deletedOn"
		});
		/**
		 * Version 2 is a minor architectural update.
		 * Categories:
		 * 	- Field types now have a "hideFromTable" property. To align with this naming, the "hidden" property was renamed to "hideFromEntryForm"
		 * 	Whirlpools:
		 * 	- Note types now have a "plainContent" property.
		 */
		this.version(2)
			.stores({
				whirlpools:
					"id, categoryId, title, status, chapter, volume, series, progress, rating, notes, syncCode, unsyncedChanges, extraFieldValues, tags, deletedOn, userUpdatedOn, updatedOn, createdOn",
				categories:
					"id, name, modifiedFields, extraFields, displayOrder, availableStatuses, tags, color, syncCode, unsyncedChanges, updatedOn, createdOn, deletedOn"
			})
			.upgrade(async (transaction) => {
				await transaction
					.table("categories")
					.toCollection()
					.modify((category) => {
						category.modifiedFields = category.modifiedFields.map(UpgradeDefaultFieldFromV1);

						category.extraFields = category.extraFields.map(UpgradeExtraFieldFromV1);
					});
				await transaction
					.table("whirlpools")
					.toCollection()
					.modify((whirlpool) => {
						whirlpool.notes = whirlpool.notes.map(UpgradeNoteFromV1);
					});
			});

		this.on("populate", function (transaction) {
			const convertedDefaults = defaultCategories.map((category) => {
				return DatabaseCategory.ConvertCategoryForDatabase({ input: category, toRaw: true });
			});
			transaction.table("categories").bulkAdd(convertedDefaults);
		});

		this.whirlpools.mapToClass(InternalDatabaseWhirlpool);
		this.categories.mapToClass(InternalDatabaseCategory);
	}
}

export default DatabaseConfig;
