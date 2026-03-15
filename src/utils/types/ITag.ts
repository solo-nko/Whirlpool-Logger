import type { ULID } from "ulid";

export type ITag = {
	id: ULID;
	label: string;
	description?: string;
	color?: string;
};
