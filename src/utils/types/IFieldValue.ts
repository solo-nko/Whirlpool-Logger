import type { ULID } from "ulid"

export type IFieldValue = {
	fieldId: ULID
	value: unknown
}
