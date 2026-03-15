import { DateTime } from "luxon";
import { type ULID, ulid } from "ulid";
import type { IFieldValue } from "@/utils/types/IFieldValue.ts";
import type { JSONContent } from "@tiptap/vue-3";

// Important: This class needs to line up with the DatabaseWhirlpool class. It should have all the same fields as the DatabaseWhirlpool, as well as the same types, except the DateTime properties, which are set to Dates instead.

export class WhirlpoolLog {
	id: ULID;
	/** ID of the category this log belongs to. */
	categoryId?: string;
	/** Title of the media. */
	title: string;
	/** ID of the status applied to this log. */
	statusId?: string;
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
	/** Notes entered into the TipTap Editor. Should be saved in JSON. */
	notes?: JSONContent;
	/** Sync Code, used for cloud sync. */
	syncCode?: string;
	/** Whether this log has changes that have not been sent to server yet. */
	unsyncedChanges: boolean;
	/** Values for custom fields. */
	extraFieldValues: IFieldValue[];
	/** IDs of applied tags. */
	tagIds: string[];
	/** When this log was deleted. If undefined, it should be assumed that it has not been deleted. */
	deletedOn?: DateTime;
	/** Last time this log was updated, as inputted by the user. This is different because the user may not want to update this field. */
	userUpdatedOn?: string;
	/** Last time this log was updated, as observed internally. */
	updatedOn: DateTime;
	/** When this log was created. */
	createdOn: DateTime;

	constructor(inputTitle: string) {
		this.id = ulid();
		this.title = inputTitle;
		this.unsyncedChanges = true;
		this.extraFieldValues = [];
		this.tagIds = [];
		this.createdOn = DateTime.now();
		this.updatedOn = DateTime.now();
	}

	static DateTimeToString(input: DateTime, simple: boolean = false) {
		if (simple) return input.toISODate();
		return input.toISO();
	}
}
