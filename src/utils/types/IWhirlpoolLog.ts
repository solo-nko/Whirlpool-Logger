import type { ULID } from "ulid";
import type { DateTime } from "luxon";
import type { IFieldValue } from "@/utils/types/IFieldValue";

export type IWhirlpoolLog = {
	id: ULID;
	/** id of the category this log belongs to */
	categoryId?: string;
	title: string;
	/** id of the status assigned to this log */
	status?: string;
	chapter?: number;
	volume?: number;
	series?: string;
	progress?: string;
	rating?: number;
	/** editor content */
	notes?: unknown;
	syncCode?: string;
	unsyncedChanges: boolean;
	extraFieldValues: IFieldValue[];
	/** id of tags applied to Whirlpool. */
	tags: string[];
	deletedOn?: DateTime;
	userUpdatedOn?: string;
	updatedOn: DateTime;
	createdOn: DateTime;
};
