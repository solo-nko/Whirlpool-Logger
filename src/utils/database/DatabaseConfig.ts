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

const now = DateTime.now();
const defaultCategories: Category[] = [
	{
		id: ulid(),
		name: "Games",
		modifiedFields: [],
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
			{ field: "series", hidden: true },
			{ field: "chapter", rename: "Episode", hidden: false },
			{ field: "volume", rename: "Season", hidden: false }
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
			{ field: "chapter", hidden: true },
			{ field: "volume", hidden: true }
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
			{ field: "volume", rename: "Book", hidden: false },
			{ field: "chapter", hidden: true }
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
