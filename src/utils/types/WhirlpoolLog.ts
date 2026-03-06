import { DateTime } from "luxon";
import { type ULID, ulid } from "ulid";
import type { IFieldValue } from "@/utils/types/IFieldValue.ts";

export class WhirlpoolLog {
	id: ULID;
	categoryId?: string;
	status?: string;
	chapter?: number;
	volume?: number;
	series?: string;
	progress?: string;
	rating?: number;
	notes?: unknown;
	syncCode?: string;
	unsyncedChanges: boolean;
	extraFieldValues: IFieldValue[];
	tags: string[];
	deletedOn?: DateTime;
	userUpdatedOn?: DateTime;
	updateOn: DateTime;
	createdOn: DateTime;

	constructor() {
		this.id = ulid();
		this.unsyncedChanges = true;
		this.extraFieldValues = [];
		this.tags = [];
		this.createdOn = DateTime.now();
		this.updateOn = DateTime.now();
	}

	static DateToString(input: DateTime, simple: boolean = false) {
		if (simple) return input.toISODate();
		return input.toISO();
	}
}
