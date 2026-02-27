import type { ULID } from "ulid";

export enum FieldType {
	STRING = "string",
	NUMBER = "number",
	BOOL = "boolean",
	DATE = "date"
}

export type IField = {
	id: ULID;
	label: string;
	type: FieldType;
	placeholder: string;
};
