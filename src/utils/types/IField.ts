import type { ULID } from "ulid";

export enum FieldType {
	TEXT = "text",
	NUMBER = "number",
	BOOL = "boolean",
	DATE = "date"
}

export type IField = {
	id: ULID;
	label: string;
	type: FieldType;
	placeholder?: string;
	hidden: boolean;
	displayOrder?: number;
	required?: boolean;
};
