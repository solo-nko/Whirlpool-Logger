import type { ULID } from "ulid";

export type ITag = {
	id: ULID;
	/** Label displayed in the chip. Effectively the tag's name. */
	label: string;
	/** Description of the tag's purpose. */
	description?: string;
	color?: string;
};
