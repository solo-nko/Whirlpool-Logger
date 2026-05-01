/* eslint-disable no-console */
import { peakImportFile } from "dexie-export-import";
import { DateTime } from "luxon";

import LoggerDatabase from "@/utils/database/LoggerDatabase.ts";
import type { IProcessResult } from "@/utils/types/IProcessResult.ts";

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
 * @param importFile
 * @constructor
 */
async function ImportDatabase(importFile: Blob): Promise<IProcessResult> {
	const peekResult = await PeekAtFile(importFile);
	if (peekResult === null || peekResult.formatName !== "dexie")
		return { result: "error", message: "Database is in unknown format." };
	try {
		await LoggerDatabase.import(importFile, { clearTablesBeforeImport: true });
	} catch (error) {
		console.error(error);
		return { result: "error", message: "An error occurred during import." };
	}
	return { result: "ok", message: "Database import successful." };
}

export { ExportDatabase, PeekAtFile, ImportDatabase };
