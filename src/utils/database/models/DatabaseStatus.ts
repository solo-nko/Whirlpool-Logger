import { ulid, type ULID } from "ulid";
import { DateTime } from "luxon";
import type { IStatus } from "@/utils/types/IStatus.ts";

export class DatabaseStatus {
	id: ULID;
	name: string;
	description?: string;
	displayOrder?: number;
	color?: string;
	deletedOn?: Date;
	createdOn: Date;

	constructor(name: string) {
		this.id = ulid();
		this.name = name;
		this.createdOn = new Date();
	}

	/** Takes an array of IStatus objects and coverts their date properties for storage in the IndexedDB. This is necessary because IndexedDB cannot store DateTime objects. */
	static ConvertStatusesToDatabase(input: IStatus[]): DatabaseStatus[] {
		return input.map((status) => {
			let newDeletedOn: Date | undefined;
			const newCreatedOn: Date = status.createdOn.toJSDate();
			if (status.deletedOn !== undefined) newDeletedOn = status.deletedOn.toJSDate();
			return { ...status, deletedOn: newDeletedOn, createdOn: newCreatedOn };
		});
	}

	static ConvertStatusesFromDatabase(input: DatabaseStatus[]): IStatus[] {
		return input.map((status) => {
			let newDeletedOn: DateTime | undefined;
			const newCreatedOn: DateTime = DateTime.fromJSDate(status.createdOn);
			if (status.deletedOn !== undefined) newDeletedOn = DateTime.fromJSDate(status.deletedOn);
			return { ...status, deletedOn: newDeletedOn, createdOn: newCreatedOn };
		});
	}
}
