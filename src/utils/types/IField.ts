import type { ULID } from "ulid"

export enum FieldType {
	STRING,
	NUMBER,
	BOOL,
	DATE
}

export type IField = {
	id: ULID
	label: string
	type: FieldType
	placeholder?: string
	hidden: boolean
	// TODO: required?
}
