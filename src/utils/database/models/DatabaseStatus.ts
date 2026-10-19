import { ulid, type ULID } from "ulid";
import { DateTime } from "luxon";
import type { IStatus } from "@/utils/types/IStatus.ts";

export class DatabaseStatus {
	id: ULID;
	name: string;
	description?: string;
	displayOrder?: number;
	color?: string;
	deletedOn: string | null;
	createdOn: string;

	constructor(name: string) {
		this.id = ulid();
		this.name = name;
		this.createdOn = DateTime.now().toISO();
		this.deletedOn = null;
	}

	/** Takes an array of IStatus objects and coverts their date properties for storage in the IndexedDB. This is necessary because IndexedDB cannot store DateTime objects. */
	static ConvertStatusForDatabase(input: IStatus): DatabaseStatus {
		return {
			...input,
			deletedOn: input.deletedOn === null ? input.deletedOn : input.deletedOn.toISO(),
			createdOn: input.createdOn.toISO() ?? "unknown"
		};
	}

	static ConvertStatusesFromDatabase(input: DatabaseStatus): IStatus {
		return {
			...input,
			deletedOn: input.deletedOn === null ? input.deletedOn : DateTime.fromISO(input.deletedOn),
			createdOn: DateTime.fromISO(input.createdOn)
		};
	}
}
