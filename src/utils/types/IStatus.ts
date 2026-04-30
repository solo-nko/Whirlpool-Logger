import type { DateTime } from "luxon";
import type { ULID } from "ulid";

export type IStatus = {
	id: ULID;
	name: string;
	description?: string;
	displayOrder?: number;
	color?: string;
	deletedOn: DateTime | null;
	createdOn: DateTime;
};

export type IEditingStatus = IStatus & {
	updated: boolean;
	deleted: boolean;
};
