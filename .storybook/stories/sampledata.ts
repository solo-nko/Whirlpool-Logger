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
	categoryId: GamesCategory.id,
	title: "Split/Fiction",
	status: "status1",
	notes: [
		{
			id: 12345,
			updatedOn: DateTime.fromObject({ day: 22, hour: 12, year: 2025, month: 10 }),
			createdOn: DateTime.fromObject({ day: 22, hour: 12, year: 2025, month: 10 }),
			content:
				'<p xmlns="http://www.w3.org/1999/xhtml">What I like:</p><ol xmlns="http://www.w3.org/1999/xhtml"><li><p>Athena is hot. I also like her psychology gimmick.</p></li><li><p>The transition to 3D was done well, although I think the 2D sprites may have had more charm for me</p></li><li><p>Having Apollo, Phoenix and Athena together in one game does make it feel like the gang\'s really working together.</p></li></ol><p xmlns="http://www.w3.org/1999/xhtml">What I don\'t like:</p><ol xmlns="http://www.w3.org/1999/xhtml"><li><p>Case 2 and 3 are a bore.</p></li><li><p>They do almost nothing with the status quo established in prior entries, particularly Apollo Justice. Phoenix is a lawyer again, but just as goofy as he was before his disbarment, having inexplicably lost all of his grit.</p></li></ol>'
		}
	],
	deletedOn: null,
	unsyncedChanges: false,
	extraFieldValues: [],
	tags: [{ id: "01KKQQDZR3N1HHE2SXJQ2TZ7MH", label: "PS5" }],
	updatedOn: DateTime.fromObject({ day: 22, hour: 12, year: 2025, month: 10 }),
	createdOn: DateTime.fromObject({ day: 22, hour: 12, year: 2025, month: 10 })
};

export { GamesCategory, existingGamesEntry };
