import { ICategory } from "../../src/utils/types/ICategory"
import { DateTime } from "luxon"
import { FieldType } from "../../src/utils/types/IField"

const sampleDay = DateTime.fromISO("2025-12-15")

const GamesCategory: ICategory = {
	id: "01KJT3Y9HVSTN783BDQ6BV4T0N",
	name: "Games",
	modifiedFields: [
		{ field: "chapter", hidden: true },
		{ field: "volume", hidden: true }
	],
	extraFields: [
		{
			id: "01KJT3Y9HVFP36F3SPSJRQZ4FZ",
			label: "Purchase Date",
			type: FieldType.DATE
		}
	],
	statuses: [
		{
			name: "Playing",
			createdOn: sampleDay
		},
		{
			name: "Replaying",
			createdOn: sampleDay
		},
		{
			name: "Hiatus",
			createdOn: sampleDay
		},
		{
			name: "Complete",
			createdOn: sampleDay
		},
		{
			name: "Planned",
			createdOn: sampleDay
		}
	],
	unsyncedChanges: false,
	updatedOn: sampleDay,
	createdOn: sampleDay
}

export { GamesCategory }
