import type { DexieExportJsonStructure } from "dexie-export-import/dist/json-structure";
import Quill, { Delta } from "quill";
import { ulid } from "ulid";
import { DateTime } from "luxon";
import { generateJSON } from "@tiptap/html";
import { StarterKit } from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import type { WhirlpoolLog } from "@/utils/types/WhirlpoolLog.ts";
import LoggerDatabase from "@/utils/database/LoggerDatabase.ts";

interface OldRow {
	title: string;
	platform: string;
	status: string;
	progress: string;
	rating: number;
	impression: string;
	dateCreated: string;
	dateModified: string;
	id: number;
}

export default class QuillImporter {
	static quill = reactive<{ instance: Quill | null }>({ instance: null });

	static async ImportOldFormat(oldDb: File) {
		const stringifiedDb = await oldDb.text();
		let oldDatabase: DexieExportJsonStructure;
		try {
			const tryParse = await JSON.parse(stringifiedDb);
			if ("formatName" in tryParse && tryParse.formatName === "dexie")
				oldDatabase = tryParse as DexieExportJsonStructure;
			else return;
		} catch (error) {
			console.log(error);
			return;
		}
		const { data } = oldDatabase;

		const categories = await LoggerDatabase.categories.toArray();
		const deriveStatus = (
			importStatus: string,
			importCategory: "Games" | "Movies" | "Television" | "Books"
		) => {
			const dbCategory = categories.find((category) => category.name === importCategory);
			if (dbCategory === undefined) return undefined;
			if (importCategory === "Games") {
				switch (importStatus) {
					case "Playing":
						return (
							dbCategory.availableStatuses.find((status) => status.name === "Playing")?.id ??
							undefined
						);
					case "Replaying":
						return (
							dbCategory.availableStatuses.find((status) => status.name === "Replaying")?.id ??
							undefined
						);
					case "Dropped":
						return (
							dbCategory.availableStatuses.find((status) => status.name === "Dropped")?.id ??
							undefined
						);
					case "Hiatus":
						return (
							dbCategory.availableStatuses.find((status) => status.name === "Hiatus")?.id ??
							undefined
						);
					case "Completed":
						break;
					default:
						break;
				}
			} else if (importCategory === "Movies") {
				return undefined;
			} else if (importCategory === "Television") {
				switch (importStatus) {
					case "Watching":
						return (
							dbCategory.availableStatuses.find((status) => status.name === "Watching")?.id ??
							undefined
						);
					case "Rewatching":
						return (
							dbCategory.availableStatuses.find((status) => status.name === "Rewatching")?.id ??
							undefined
						);
					case "Dropped":
						return (
							dbCategory.availableStatuses.find((status) => status.name === "Dropped")?.id ??
							undefined
						);
					case "Hiatus":
						return (
							dbCategory.availableStatuses.find((status) => status.name === "Hiatus")?.id ??
							undefined
						);
					case "Completed":
						break;
					default:
						break;
				}
			} else if (importCategory === "Books") {
				switch (importStatus) {
					case "Reading":
						return (
							dbCategory.availableStatuses.find((status) => status.name === "Reading")?.id ??
							undefined
						);
					case "Rereading":
						return (
							dbCategory.availableStatuses.find((status) => status.name === "Rewatching")?.id ??
							undefined
						);
					case "Dropped":
						return (
							dbCategory.availableStatuses.find((status) => status.name === "Dropped")?.id ??
							undefined
						);
					case "Hiatus":
						return (
							dbCategory.availableStatuses.find((status) => status.name === "Hiatus")?.id ??
							undefined
						);
					case "Completed":
						break;
					default:
						break;
				}
			}
		};
		const deriveNotes = (rowData: OldRow) => {
			let jsonExport;
			if (this.quill.instance) {
				this.quill.instance.setContents(new Delta(JSON.parse(rowData.impression)));
				const htmlContents = this.quill.instance.root.innerHTML;

				// TODO: make sure all extensions that we'll be using are installed and imported before testing extensively
				jsonExport = generateJSON(htmlContents, [StarterKit, Placeholder]);
				return jsonExport;
			}
		};

		// import games
		const gamesEntries = data.data.find((element) => element.tableName === "games");
		if (gamesEntries) {
			const gamesCategory = categories.find((category) => category.name === "Games");
			const gamesImports: WhirlpoolLog[] = gamesEntries.rows.map((row): WhirlpoolLog => {
				const shapedRow = row as unknown as OldRow;

				return {
					id: ulid(),
					categoryId: gamesCategory ? gamesCategory.id : undefined,
					title: shapedRow.title,
					statusId: deriveStatus(shapedRow.status, "Games"),
					progress: shapedRow.progress,
					rating: shapedRow.rating,
					notes: deriveNotes(shapedRow),
					createdOn: DateTime.fromISO(shapedRow.dateCreated),
					updatedOn: DateTime.fromISO(shapedRow.dateModified),
					extraFieldValues: [],
					unsyncedChanges: true,
					tagIds: []
				};
			});
		}

		// import tv
		const tvEntries = data.data.find((element) => element.tableName === "television");
		if (tvEntries) {
			const tvCategory = categories.find((category) => category.name === "TV");
			const tvImports: WhirlpoolLog[] = tvEntries.rows.map((row): WhirlpoolLog => {
				const shapedRow = row as unknown as OldRow;

				return {
					id: ulid(),
					categoryId: tvCategory ? tvCategory.id : undefined,
					title: shapedRow.title,
					statusId: deriveStatus(shapedRow.status, "Television"),
					progress: shapedRow.progress,
					rating: shapedRow.rating,
					notes: deriveNotes(shapedRow),
					createdOn: DateTime.fromISO(shapedRow.dateCreated),
					updatedOn: DateTime.fromISO(shapedRow.dateModified),
					extraFieldValues: [],
					unsyncedChanges: true,
					tagIds: []
				};
			});
		}

		// import movies
		const movieEntries = data.data.find((element) => element.tableName === "movies");
		if (movieEntries) {
			const moviesCategory = categories.find((category) => category.name === "Movies");
			const movieImports: WhirlpoolLog[] = movieEntries.rows.map((row): WhirlpoolLog => {
				const shapedRow = row as unknown as OldRow;

				return {
					id: ulid(),
					categoryId: moviesCategory ? moviesCategory.id : undefined,
					title: shapedRow.title,
					statusId: undefined,
					progress: shapedRow.progress || undefined,
					rating: shapedRow.rating || undefined,
					notes: deriveNotes(shapedRow),
					createdOn: DateTime.fromISO(shapedRow.dateCreated),
					updatedOn: DateTime.fromISO(shapedRow.dateModified),
					extraFieldValues: [],
					unsyncedChanges: true,
					tagIds: []
				};
			});
		}

		// import books
		const booksEntries = data.data.find((element) => element.tableName === "books");
		if (booksEntries) {
			const booksCategory = categories.find((category) => category.name === "Books");
			const booksImports: WhirlpoolLog[] = booksEntries.rows.map((row): WhirlpoolLog => {
				const shapedRow = row as unknown as OldRow;

				return {
					id: ulid(),
					categoryId: booksCategory ? booksCategory.id : undefined,
					title: shapedRow.title,
					statusId: deriveStatus(shapedRow.status, "Books"),
					progress: shapedRow.progress || undefined,
					rating: shapedRow.rating || undefined,
					notes: deriveNotes(shapedRow),
					createdOn: DateTime.fromISO(shapedRow.dateCreated),
					updatedOn: DateTime.fromISO(shapedRow.dateModified),
					extraFieldValues: [],
					unsyncedChanges: true,
					tagIds: []
				};
			});
		}
	}
}
