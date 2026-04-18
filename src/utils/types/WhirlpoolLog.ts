import { DateTime } from "luxon";
import { type ULID, ulid } from "ulid";
import type { HTMLContent } from "@tiptap/vue-3";
import type { Category } from "@/utils/types/Category.ts";
import type { ITag } from "@/utils/types/ITag.ts";
import type { IStatus } from "@/utils/types/IStatus.ts";
import type { IFieldValue } from "@/utils/types/IFieldValue.ts";

// Important: This class needs to line up with the DatabaseWhirlpool class. It should have all the same fields as the DatabaseWhirlpool, as well as the same types, except the DateTime properties, which are set to Dates instead.

export class WhirlpoolLog {
	id: ULID;
	// TODO: switch back to category IDs. Storing the whole category in here, while it does make the client-side logic easier to execute, leads to duplication of data in the database.
	/** Category this log belongs to. */
	category: Category;
	/** Title of the media. */
	title: string;
	/** Status applied to this log. */
	status?: IStatus;
	/** Small unit of organization, such as an episode or issue. */
	chapter?: number;
	/** Large unit of organization, such as a season. */
	volume?: number;
	/** Series this media belongs to. */
	series?: string;
	/** Progress notes. */
	progress?: string;
	/** User rating. */
	rating?: number;
	/** Notes entered into the TipTap Editor. Should be saved in HTML. */
	notes?: HTMLContent;
	/** Sync Code, used for cloud sync. */
	syncCode?: string;
	/** Whether this log has changes that have not been sent to server yet. */
	unsyncedChanges: boolean;
	/** Values for custom fields. */
	extraFieldValues: IFieldValue[];
	/** IDs of applied tags. */
	tags: ITag[];
	/** When this log was deleted. If null, it should be assumed that it has not been deleted. */
	deletedOn: DateTime | null;
	/** Last time this log was updated, as inputted by the user. This is different because the user may not want to update this field. */
	userUpdatedOn?: string;
	/** Last time this log was updated, as observed internally. */
	updatedOn: DateTime;
	/** When this log was created. */
	createdOn: DateTime;

	constructor(inputTitle: string, inputCategory: Category) {
		this.id = ulid();
		this.title = inputTitle;
		this.category = inputCategory;
		this.unsyncedChanges = true;
		this.extraFieldValues = [];
		this.tags = [];
		this.createdOn = DateTime.now();
		this.updatedOn = DateTime.now();
		this.deletedOn = null;
	}

	static DateTimeToString(input: DateTime, simple: boolean = false) {
		if (simple) return input.toISODate();
		return input.toISO();
	}

	static DateTimeFromString(input: string): DateTime {
		return DateTime.fromISO(input);
	}
}
