import type { ULID } from "ulid";
import type { FieldType } from "@/utils/types/IField.ts";

export type IFieldValue = {
	/** ID of the Field this value belongs to */
	fieldId: ULID;
	fieldType: FieldType;
	value: unknown;
};
