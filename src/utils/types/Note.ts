import { DateTime } from "luxon";

export default class Note {
	/** ID generated as a UNIX timestamp. */
	id: number;
	title?: string;
	updatedOn: DateTime;
	createdOn: DateTime;
	/** Actual notes content. Should be formatted in HTML. */
	content: string;

	constructor(inputContent: string) {
		this.content = inputContent;
		const now = DateTime.now();
		this.id = now.toSeconds();
		this.createdOn = now;
		this.updatedOn = now;
	}
}
