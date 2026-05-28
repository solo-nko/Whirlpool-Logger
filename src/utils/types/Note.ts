import { DateTime } from "luxon";
import type { HTMLContent } from "@tiptap/vue-3";

export default class Note {
	/** ID generated as a UNIX timestamp. */
	id: number;
	title?: string;
	updatedOn: DateTime;
	createdOn: DateTime;
	/** Actual notes content. Should be formatted in HTML. */
	content: HTMLContent;

	constructor(inputContent?: string, inputTitle?: string) {
		this.content = inputContent || "";
		const now = DateTime.now();
		this.id = Math.floor(now.toSeconds());
		this.createdOn = now;
		this.updatedOn = now;
		this.title = inputTitle;
	}
}
