import type { DateTime } from "luxon"

export type IStatus = {
	name: string
	color?: string
	deletedOn?: DateTime
	createdOn: DateTime
}
