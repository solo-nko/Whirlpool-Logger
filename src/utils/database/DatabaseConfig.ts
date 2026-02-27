import { Dexie, type EntityTable } from "dexie"
import { DateTime } from "luxon"
import { ulid } from "ulid"
import DatabaseWhirlpool from "@/utils/database/models/DatabaseWhirlpool"
import DatabaseCategory from "@/utils/database/models/DatabaseCategory"
import type { ICategory } from "@/utils/types/ICategory"

const now = DateTime.now()
const defaultCategories: ICategory[] = [
	{
		id: ulid(),
		name: "Games",
		modifiedFields: [],
		extraFields: [],
		statuses: [
			{
				name: "Playing",
				createdOn: now
			},
			{
				name: "Completed",
				createdOn: now
			},
			{
				name: "Replaying",
				createdOn: now
			},
			{
				name: "Dropped",
				createdOn: now
			}
		],
		updatedOn: now,
		createdOn: now,
		unsyncedChanges: true
	},
	{
		id: ulid(),
		name: "TV",
		modifiedFields: [{ field: "series", hidden: true }],
		extraFields: [],
		statuses: [
			{
				name: "Watching",
				createdOn: now
			},
			{
				name: "Completed",
				createdOn: now
			},
			{
				name: "Rewatching",
				createdOn: now
			},
			{
				name: "Dropped",
				createdOn: now
			}
		],
		updatedOn: now,
		createdOn: now,
		unsyncedChanges: true
	},
	{
		id: ulid(),
		name: "Movies",
		modifiedFields: [
			{ field: "chapter", hidden: true },
			{ field: "volume", hidden: true }
		],
		extraFields: [],
		statuses: [
			{
				name: "Watching",
				createdOn: now
			},
			{
				name: "Completed",
				createdOn: now
			},
			{
				name: "Planned",
				createdOn: now
			},
			{
				name: "Dropped",
				createdOn: now
			}
		],
		updatedOn: now,
		createdOn: now,
		unsyncedChanges: true
	},
	{
		id: ulid(),
		name: "Books",
		modifiedFields: [
			{ field: "volume", rename: "book", hidden: false },
			{ field: "chapter", hidden: true }
		],
		extraFields: [],
		statuses: [
			{
				name: "Reading",
				createdOn: now
			},
			{
				name: "Completed",
				createdOn: now
			},
			{
				name: "Rewatching",
				createdOn: now
			},
			{
				name: "Dropped",
				createdOn: now
			}
		],
		updatedOn: now,
		createdOn: now,
		unsyncedChanges: true
	}
]

class DatabaseConfig extends Dexie {
	whirlpools!: EntityTable<DatabaseWhirlpool, "id">
	categories!: EntityTable<DatabaseCategory, "id">

	constructor() {
		super("LoggerDB")
		this.version(1).stores({
			whirlpools:
				"&id, categoryId, title, status, chapter, volume, series, progress, rating, notes, syncCode, unsyncedChanges, extraFieldValues, deletedOn, userUpdatedOn, updatedOn, createdOn",
			categories:
				"&id, name, modifiedFields, extraFields, statuses, color, syncCode, unsyncedChanged, updatedOn, createdOn, deletedOn"
		})

		this.on("populate", function (transaction) {
			const convertedDefaults = defaultCategories.map((category) => {
				return {
					...category,
					updatedOn: category.updatedOn.toJSDate(),
					createdOn: category.createdOn.toJSDate()
				}
			})
			transaction.table("categories").bulkAdd(convertedDefaults)
		})

		this.whirlpools.mapToClass(DatabaseWhirlpool)
		this.categories.mapToClass(DatabaseCategory)
	}
}

export default DatabaseConfig
