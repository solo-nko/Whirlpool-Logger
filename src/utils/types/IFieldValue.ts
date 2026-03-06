import type { ULID } from "ulid";
import type { FieldType } from "@/utils/types/IField.ts";

export type IFieldValue = {
	fieldId: ULID;
	fieldType: FieldType;
	value: unknown;
};
