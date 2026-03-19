import { Category } from "../../src/utils/types/Category";
import { DateTime } from "luxon";
import { FieldType } from "../../src/utils/types/IField";
import { WhirlpoolLog } from "../../src/utils/types/WhirlpoolLog";

const sampleDay = DateTime.fromISO("2025-12-15");

const GamesCategory: Category = {
	id: "SampleGamesCategory",
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
	availableStatuses: [
		{
			id: "status1",
			name: "Playing",
			createdOn: sampleDay
		},
		{
			id: "status2",
			name: "Replaying",
			createdOn: sampleDay
		},
		{
			id: "status3",
			name: "Hiatus",
			createdOn: sampleDay
		},
		{
			id: "status4",
			name: "Complete",
			createdOn: sampleDay
		},
		{
			id: "status5",
			name: "Planned",
			createdOn: sampleDay
		}
	],
	tags: [
		{
			id: "01KKQQDZR3N1HHE2SXJQ2TZ7MH",
			label: "Playstation 5",
			description: "Played on PS5",
			color: "#337AA9"
		},
		{
			id: "01KKQQDZR3DXCBFY26GVJQ1JGW",
			label: "Emulated",
			description: "Played via emulator"
		}
	],
	unsyncedChanges: false,
	updatedOn: sampleDay,
	createdOn: sampleDay,
	deletedOn: null
};

const existingGamesEntry: WhirlpoolLog = {
	id: "test",
	category: GamesCategory,
	title: "Split/Fiction",
	status: "status1",
	notes: {
		type: "doc",
		content: [
			{
				type: "paragraph",
				content: [{ type: "text", marks: [{ type: "italic" }], text: "What I like:" }]
			},
			{
				type: "bulletList",
				content: [
					{
						type: "listItem",
						content: [
							{
								type: "paragraph",
								content: [{ type: "text", text: "Multiplayer is well thought out" }]
							}
						]
					}
				]
			},
			{
				type: "paragraph",
				content: [{ type: "text", marks: [{ type: "italic" }], text: "What I don't like:" }]
			},
			{
				type: "bulletList",
				content: [
					{
						type: "listItem",
						content: [
							{
								type: "paragraph",
								content: [{ type: "text", text: "Can be too challenging for new gamers" }]
							}
						]
					}
				]
			},
			{ type: "paragraph" }
		]
	},
	deletedOn: null,
	unsyncedChanges: false,
	extraFieldValues: [],
	tags: [{ id: "01KKQQDZR3N1HHE2SXJQ2TZ7MH", label: "PS5" }],
	updatedOn: DateTime.fromObject({ day: 22, hour: 12, year: 2025, month: 10 }),
	createdOn: DateTime.fromObject({ day: 22, hour: 12, year: 2025, month: 10 })
};

export { GamesCategory, existingGamesEntry };
