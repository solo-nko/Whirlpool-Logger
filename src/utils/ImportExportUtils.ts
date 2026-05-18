/* eslint-disable no-console */
import { peakImportFile } from "dexie-export-import";
import { DateTime } from "luxon";

import LoggerDatabase from "@/utils/database/LoggerDatabase.ts";
import type { IProcessResult } from "@/utils/types/IProcessResult.ts";
import useSettingsStore from "@/stores/settings.ts";

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

	if (overwriteMode) {
		await LoggerDatabase.whirlpools.clear();
		await LoggerDatabase.categories.clear();
	}

	await LoggerDatabase.import(importFile, { clearTablesBeforeImport: true }).catch(
		async (error) => {
			console.error("Error: ", error);
			// Attempt to restore old items in the event of an import failure
			if (existingCategoriesBackup.length > 0) {
				await LoggerDatabase.categories.clear();
				await LoggerDatabase.categories.bulkAdd(existingCategoriesBackup);
			}
			if (existingWhirlpoolsBackup.length > 0) {
				await LoggerDatabase.whirlpools.clear();
				await LoggerDatabase.whirlpools.bulkAdd(existingWhirlpoolsBackup);
			}

			return { result: "error", message: "An error occurred during import." };
		}
	);

	// Reset dashboards table
	const settingsStore = useSettingsStore();
	settingsStore.ResetDashboards();
	settingsStore.PopulateDashboardsTable();
	return { result: "ok", message: "Database import successful." };
}

export { ExportDatabase, PeekAtFile, ImportDatabase };
