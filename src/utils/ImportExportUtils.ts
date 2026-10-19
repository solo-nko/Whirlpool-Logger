/* eslint-disable no-console */
import { peakImportFile } from "dexie-export-import";
import { DateTime } from "luxon";

import type { ImportProgress } from "dexie-export-import/dist/import";
import LoggerDatabase from "@/utils/database/LoggerDatabase.ts";
import type { IProcessResult } from "@/utils/types/IProcessResult.ts";
import useSettingsStore from "@/stores/settings.ts";
import type { DatabaseWhirlpool } from "@/utils/database/models/DatabaseWhirlpool.ts";
import {
	UpgradeDefaultFieldFromV1,
	UpgradeExtraFieldFromV1,
	UpgradeNoteFromV1
} from "@/utils/database/DatabaseUtils.ts";
import type { DatabaseCategory } from "@/utils/database/models/DatabaseCategory.ts";

/**
 * Logs database write progress
 * @param totalRows
 * @param completedRows
 */
function progressCallback({ totalRows, completedRows }: ImportProgress): boolean {
	try {
		console.log(`Progress: ${completedRows} / ${totalRows} rows completed`);
		return true;
	} catch (error) {
		console.log(error);
		return false;
	}
}

/** converts the dexie database to a JSON blob and then generates a request for the browser to download the JSON file. */
async function ExportDatabase() {
	const exportBlob = await LoggerDatabase.export({ prettyJson: true });
	const timeStampString = DateTime.now().toFormat("yyyyLLdd_HHmmss");
	const filename = `whirlpoollogger_${timeStampString}.json`;
	const anchorElement = document.createElement("a");
	const downloadLink = URL.createObjectURL(exportBlob);
	anchorElement.href = downloadLink;
	anchorElement.download = filename;
	anchorElement.click();
	URL.revokeObjectURL(downloadLink);
}

async function PeekAtFile(importFile: Blob) {
	try {
		return await peakImportFile(importFile);
	} catch (error) {
		console.error(`function PeekAtFile: `, error);
		return null;
	}
}

/**
 * Receives a blob representing the database JSON, then overwrites the existing database using its contents.
 * @param importFile Data to import.
 * @param overwriteMode If set to true, the importer will first clear the database before importing.
 * @constructor
 */
async function ImportDatabase(importFile: Blob, overwriteMode: boolean): Promise<IProcessResult> {
	const peekResult = await PeekAtFile(importFile);
	if (peekResult === null || peekResult.formatName !== "dexie") {
		return { result: "error", message: "Database is in unknown format." };
	}
	const existingWhirlpoolsBackup = await LoggerDatabase.whirlpools.toArray();
	const existingCategoriesBackup = await LoggerDatabase.categories.toArray();
	const importVersion = peekResult.data.databaseVersion;
	let errorOccurred = false;
	await LoggerDatabase.import(importFile, {
		clearTablesBeforeImport: overwriteMode,
		acceptVersionDiff: true,
		// the importer lacks built-in upgrade functionality, so migrations need to be handled manually, via the transform option
		transform: (table, value, key) => {
			if (importVersion === 1) {
				if (table === "whirlpools") {
					const oldValue = value as DatabaseWhirlpool;
					const newValue: DatabaseWhirlpool = {
						...oldValue,
						notes: oldValue.notes.map(UpgradeNoteFromV1)
					};

					return { value: newValue, key };
				} else if (table === "categories") {
					const oldValue = value;
					const newValue: DatabaseCategory = {
						...oldValue,
						modifiedFields: oldValue.modifiedFields.map(UpgradeDefaultFieldFromV1),
						extraFields: oldValue.extraFields.map(UpgradeExtraFieldFromV1)
					};

					return { value: newValue, key };
				}
			}
			return { value, key };
		},
		progressCallback
	})
		.catch(async (error) => {
			console.error(error);
			// Attempt to restore old items in the event of an import failure
			if (existingCategoriesBackup.length > 0) {
				await LoggerDatabase.categories.clear();
				await LoggerDatabase.categories.bulkAdd(existingCategoriesBackup);
			}
			if (existingWhirlpoolsBackup.length > 0) {
				await LoggerDatabase.whirlpools.clear();
				await LoggerDatabase.whirlpools.bulkAdd(existingWhirlpoolsBackup);
			}

			errorOccurred = true;
		})
		.then(async () => {
			// This should force the sync function to consider the client as the source of truth for the entire database on next backup.
			await LoggerDatabase.categories
				.toCollection()
				.modify((category) => (category.unsyncedChanges = true));
			await LoggerDatabase.whirlpools
				.toCollection()
				.modify((whirlpool) => (whirlpool.unsyncedChanges = true));
		});
	if (errorOccurred) return { result: "error", message: "An error occurred during import." };

	// Reset dashboards table
	const settingsStore = useSettingsStore();
	settingsStore.ResetDashboards();
	settingsStore.PopulateDashboardsTable();
	return { result: "ok", message: "Database import successful." };
}

export { ExportDatabase, PeekAtFile, ImportDatabase };
