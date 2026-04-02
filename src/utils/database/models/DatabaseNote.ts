import { DateTime } from "luxon";
import type Note from "@/utils/types/Note.ts";

export default class DatabaseNote {
	id: number;
	title?: string;
	updatedOn: Date;
	createdOn: Date;
	content: string;

	constructor(inputContent: string, inputId: number) {
		const now = new Date();
		this.id = inputId ? inputId : Math.floor(now.getTime() / 1000);
		this.updatedOn = now;
		this.createdOn = now;
		this.content = inputContent;
	}

	static ConvertNoteFromDatabase(input: DatabaseNote): Note {
		return {
			...input,
			updatedOn: DateTime.fromJSDate(input.updatedOn),
			createdOn: DateTime.fromJSDate(input.createdOn)
		};
	}

	static ConvertNoteToDatabase(input: Note): DatabaseNote {
		return {
			...input,
			updatedOn: input.updatedOn.toJSDate(),
			createdOn: input.createdOn.toJSDate()
		};
	}
}
