import { DateTime } from "luxon";
import type Note from "@/utils/types/Note.ts";

export default class DatabaseNote {
	id: number;
	title?: string;
	updatedOn: string;
	createdOn: string;
	content: string;

	constructor(inputContent: string, inputId: number) {
		const now = DateTime.now();
		this.id = inputId ? inputId : Math.floor(now.toSeconds());
		this.updatedOn = now.toISO();
		this.createdOn = now.toISO();
		this.content = inputContent;
	}

	static ConvertNoteFromDatabase(input: DatabaseNote): Note {
		return {
			...input,
			updatedOn: DateTime.fromISO(input.updatedOn),
			createdOn: DateTime.fromISO(input.createdOn)
		};
	}

	static ConvertNoteToDatabase(input: Note): DatabaseNote {
		return {
			...input,
			updatedOn: input.updatedOn.toISO() ?? "unknown",
			createdOn: input.createdOn.toISO() ?? "unknown"
		};
	}
}
