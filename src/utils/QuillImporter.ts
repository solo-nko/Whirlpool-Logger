import type { DexieExportJsonStructure } from "dexie-export-import/dist/json-structure";
import Quill, { Delta } from "quill";
import { ulid } from "ulid";
import { DateTime } from "luxon";
import { generateJSON, generateHTML } from "@tiptap/html";
import { StarterKit } from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import LoggerDatabase from "@/utils/database/LoggerDatabase.ts";
import type { DatabaseWhirlpool } from "@/utils/database/models/DatabaseWhirlpool.ts";

interface OldRow {
	title: string;
	platform: string;
	status: string;
	progress: string | null;
	rating: number | null;
	impression: string | null;
	dateCreated: string;
	dateModified: string;
	id: number;
	series: string | undefined | "N/A";
	season: number | string | null;
	episode: number | string | null;
}

export default class QuillImporter {
	static quill = reactive<{ instance: Quill | null }>({ instance: null });

	static async ImportOldFormat(oldDb: File): Promise<{ ok: boolean; errorMessage: string | null }> {
		const finalResult: { ok: boolean; errorMessage: null | string } = {
			ok: true,
			errorMessage: null
		};
		const stringifiedDb = await oldDb.text();
		let oldDatabase: DexieExportJsonStructure;
		try {
			const tryParse = await JSON.parse(stringifiedDb);
			if ("formatName" in tryParse && tryParse.formatName === "dexie")
				oldDatabase = tryParse as DexieExportJsonStructure;
			else return { ok: false, errorMessage: "Unknown format" };
		} catch (error) {
			console.log(error);
			return { ok: false, errorMessage: "An error occurred while parsing the JSON." };
		}
		const { data } = oldDatabase;

		const categories = await LoggerDatabase.categories.toArray();
		const deriveStatus = (
			importStatus: string,
			importCategory: "Games" | "Movies" | "TV" | "Books"
		) => {
			const dbCategory = categories.find((category) => category.name === importCategory);
			if (dbCategory === undefined) return undefined;
			if (importCategory === "Games") {
				switch (importStatus) {
					case "Playing":
						return (
							dbCategory.availableStatuses.find((status) => status.name === "Playing") ?? undefined
						);
					case "Replaying":
						return (
							dbCategory.availableStatuses.find((status) => status.name === "Replaying") ??
							undefined
						);
					case "Dropped":
						return (
							dbCategory.availableStatuses.find((status) => status.name === "Dropped") ?? undefined
						);
					case "Hiatus":
						return (
							dbCategory.availableStatuses.find((status) => status.name === "Hiatus") ?? undefined
						);
					case "Completed":
						return (
							dbCategory.availableStatuses.find((status) => status.name === "Completed") ??
							undefined
						);
					default:
						break;
				}
			} else if (importCategory === "Movies") {
				return undefined;
			} else if (importCategory === "TV") {
				switch (importStatus) {
					case "Watching":
						return (
							dbCategory.availableStatuses.find((status) => status.name === "Watching") ?? undefined
						);
					case "Rewatching":
						return (
							dbCategory.availableStatuses.find((status) => status.name === "Rewatching") ??
							undefined
						);
					case "Dropped":
						return (
							dbCategory.availableStatuses.find((status) => status.name === "Dropped") ?? undefined
						);
					case "Hiatus":
						return (
							dbCategory.availableStatuses.find((status) => status.name === "Hiatus") ?? undefined
						);
					case "Completed":
						return (
							dbCategory.availableStatuses.find((status) => status.name === "Completed") ??
							undefined
						);
					default:
						break;
				}
			} else if (importCategory === "Books") {
				switch (importStatus) {
					case "Reading":
						return (
							dbCategory.availableStatuses.find((status) => status.name === "Reading") ?? undefined
						);
					case "Rereading":
						return (
							dbCategory.availableStatuses.find((status) => status.name === "Rewatching") ??
							undefined
						);
					case "Dropped":
						return (
							dbCategory.availableStatuses.find((status) => status.name === "Dropped") ?? undefined
						);
					case "Hiatus":
						return (
							dbCategory.availableStatuses.find((status) => status.name === "Hiatus") ?? undefined
						);
					case "Completed":
						return (
							dbCategory.availableStatuses.find((status) => status.name === "Completed") ??
							undefined
						);
					default:
						break;
				}
			}
		};
		const deriveNotes = (rowData: OldRow) => {
			if (rowData.impression === null) return undefined;
			let jsonExport;
			if (this.quill.instance) {
				this.quill.instance.setContents(new Delta(JSON.parse(rowData.impression)));
				const htmlContents = this.quill.instance.root.innerHTML;

				// TODO: make sure all extensions that we'll be using are installed and imported before testing extensively
				const extensions = [StarterKit, Placeholder];
				jsonExport = generateJSON(htmlContents, extensions);
				// While it is probably theoretically possible to convert directly from Quill HTML to TipTap's, I'm not sure if they use 100% the same format (in fact I know they don't, as Quill doesn't seem to distinguish between <ul> and <ol> when outputting from Delta). So, we'll convert to TipTap's JSON format first and then convert back to HTML from that.
				return generateHTML(jsonExport, extensions);
			}
		};

		// import games
		const gamesEntries = data.data.find((element) => element.tableName === "games");
		if (gamesEntries) {
			const gamesCategory = categories.find((category) => category.name === "Games");
			if (gamesCategory) {
				const gamesImports: DatabaseWhirlpool[] = gamesEntries.rows.map(
					(row): DatabaseWhirlpool => {
						const shapedRow = row as unknown as OldRow;
						const shapedStatus = deriveStatus(shapedRow.status, "Games");
						return {
							id: ulid(),
							categoryId: gamesCategory.id,
							title: shapedRow.title,
							status: shapedStatus,
							series:
								shapedRow.series === "N/A" || !shapedRow.series ? undefined : shapedRow.series,
							progress: shapedRow.progress || undefined,
							rating: shapedRow.rating || undefined,
							notes: deriveNotes(shapedRow) || undefined,
							deletedOn: null,
							createdOn: DateTime.fromISO(shapedRow.dateCreated).toJSDate(),
							userUpdatedOn: DateTime.fromISO(shapedRow.dateModified).toISODate() || undefined,
							updatedOn: DateTime.fromISO(shapedRow.dateModified).toJSDate(),
							extraFieldValues: [],
							unsyncedChanges: true,
							tags: []
						};
					}
				);
				await LoggerDatabase.whirlpools
					.bulkAdd(
						gamesImports.map((gameImport) => {
							return {
								...gameImport,
								createdOn: gameImport.createdOn,
								updatedOn: gameImport.updatedOn,
								deletedOn: gameImport.deletedOn === null ? null : gameImport.deletedOn
							};
						})
					)
					.catch((error) => {
						console.log("Error: ", error);
						finalResult.ok = false;
						finalResult.errorMessage = "There was an error parsing the games data.";
					});
			} else {
				console.log("Couldn't find games category");
				finalResult.ok = false;
				finalResult.errorMessage = "There was an error parsing the games data.";
			}
		}

		if (!finalResult.ok) return finalResult;

		// import tv
		const tvEntries = data.data.find((element) => element.tableName === "television");
		if (tvEntries) {
			const tvCategory = categories.find((category) => category.name === "TV");
			if (tvCategory) {
				const tvImports: DatabaseWhirlpool[] = tvEntries.rows.map((row): DatabaseWhirlpool => {
					const shapedRow = row as unknown as OldRow;
					const shapedStatus = deriveStatus(shapedRow.status, "TV");
					const deriveChapterOrVolume = (input: string | number | null) => {
						if (input === null) return undefined;
						if (Number.isNaN(input)) return undefined;
						return Number(input);
					};

					return {
						id: ulid(),
						categoryId: tvCategory.id,
						title: shapedRow.title,
						status: shapedStatus,
						progress: shapedRow.progress || undefined,
						rating: shapedRow.rating || undefined,
						notes: deriveNotes(shapedRow) || undefined,
						deletedOn: null,
						createdOn: DateTime.fromISO(shapedRow.dateCreated).toJSDate(),
						userUpdatedOn: DateTime.fromISO(shapedRow.dateModified).toISODate() || undefined,
						updatedOn: DateTime.fromISO(shapedRow.dateModified).toJSDate(),
						extraFieldValues: [],
						unsyncedChanges: true,
						tags: [],
						chapter: deriveChapterOrVolume(shapedRow.episode),
						volume: deriveChapterOrVolume(shapedRow.season)
					};
				});
				await LoggerDatabase.whirlpools
					.bulkAdd(
						tvImports.map((tvImport) => {
							return {
								...tvImport,
								createdOn: tvImport.createdOn,
								updatedOn: tvImport.updatedOn,
								deletedOn: tvImport.deletedOn === null ? null : tvImport.deletedOn
							};
						})
					)
					.catch((error) => {
						console.log("Error: ", error);
						finalResult.ok = false;
						finalResult.errorMessage = "There was an error parsing the television data.";
					});
			} else {
				console.log("Couldn't find TV category");
				finalResult.ok = false;
				finalResult.errorMessage = "There was an error parsing the television data.";
			}
		}

		if (!finalResult.ok) return finalResult;

		// import movies
		const movieEntries = data.data.find((element) => element.tableName === "movies");
		if (movieEntries) {
			const moviesCategory = categories.find((category) => category.name === "Movies");
			if (moviesCategory) {
				const movieImports: DatabaseWhirlpool[] = movieEntries.rows.map(
					(row): DatabaseWhirlpool => {
						const shapedRow = row as unknown as OldRow;

						return {
							id: ulid(),
							categoryId: moviesCategory.id,
							title: shapedRow.title,
							status: undefined,
							progress: shapedRow.progress || undefined,
							rating: shapedRow.rating || undefined,
							notes: deriveNotes(shapedRow),
							deletedOn: null,
							createdOn: DateTime.fromISO(shapedRow.dateCreated).toJSDate(),
							updatedOn: DateTime.fromISO(shapedRow.dateModified).toJSDate(),
							extraFieldValues: [],
							unsyncedChanges: true,
							tags: []
						};
					}
				);
				await LoggerDatabase.whirlpools
					.bulkAdd(
						movieImports.map((movieImport) => {
							return {
								...movieImport,
								createdOn: movieImport.createdOn,
								updatedOn: movieImport.updatedOn,
								deletedOn: movieImport.deletedOn === null ? null : movieImport.deletedOn
							};
						})
					)
					.catch((error) => {
						console.log("Error: ", error);
						finalResult.ok = false;
						finalResult.errorMessage = "There was an error parsing the movies data.";
					});
			} else {
				console.log("Couldn't find Movies category");
				finalResult.ok = false;
				finalResult.errorMessage = "There was an error parsing the movies data.";
			}
		}

		if (!finalResult.ok) return finalResult;

		// import books
		const booksEntries = data.data.find((element) => element.tableName === "books");
		if (booksEntries) {
			const booksCategory = categories.find((category) => category.name === "Books");
			if (booksCategory) {
				const booksImports: DatabaseWhirlpool[] = booksEntries.rows.map(
					(row): DatabaseWhirlpool => {
						const shapedRow = row as unknown as OldRow;
						const shapedStatus = deriveStatus(shapedRow.status, "Books");
						return {
							id: ulid(),
							categoryId: booksCategory.id,
							status: shapedStatus,
							title: shapedRow.title,
							progress: shapedRow.progress || undefined,
							rating: shapedRow.rating || undefined,
							notes: deriveNotes(shapedRow) || undefined,
							deletedOn: null,
							createdOn: DateTime.fromISO(shapedRow.dateCreated).toJSDate(),
							updatedOn: DateTime.fromISO(shapedRow.dateModified).toJSDate(),
							extraFieldValues: [],
							unsyncedChanges: true,
							tags: [],
							series: shapedRow.series === "N/A" || !shapedRow.series ? undefined : shapedRow.series
						};
					}
				);
				await LoggerDatabase.whirlpools
					.bulkAdd(
						booksImports.map((bookImport) => {
							return {
								...bookImport,
								createdOn: bookImport.createdOn,
								updatedOn: bookImport.updatedOn,
								deletedOn: bookImport.deletedOn === null ? null : bookImport.deletedOn
							};
						})
					)
					.catch((error) => {
						console.log("Error: ", error);
						finalResult.ok = false;
						finalResult.errorMessage = "There was an error parsing the games data.";
					});
			} else {
				console.log("Couldn't find Books category");
				finalResult.ok = false;
				finalResult.errorMessage = "There was an error parsing the books data.";
			}
		}

		return finalResult;
	}
}
