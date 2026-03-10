/* eslint-disable no-console */
import { peakImportFile } from "dexie-export-import";
import { DateTime } from "luxon";

import LoggerDatabase from "@/utils/database/LoggerDatabase.ts";

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

async function ImportDatabase(importFile: Blob) {
	const peekResult = await PeekAtFile(importFile);
	if (peekResult === null || peekResult.formatName !== "dexie") return;
	try {
		await LoggerDatabase.import(importFile, { clearTablesBeforeImport: true });
	} catch (error) {
		console.error(`function ImportDatabase: `, error);
	}
}

export { ExportDatabase, PeekAtFile, ImportDatabase };
