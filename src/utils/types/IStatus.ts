import type { DateTime } from "luxon";
import type { ULID } from "ulid";

export type IStatus = {
	id: ULID;
	name: string;
	order?: number;
	color?: string;
	deletedOn?: DateTime;
	createdOn: DateTime;
};
