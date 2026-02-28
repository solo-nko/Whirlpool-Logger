import type { ULID } from "ulid"
import type { DateTime } from "luxon"
import type { IWhirlpoolLog } from "@/utils/types/IWhirlpoolLog"
import type { IField } from "@/utils/types/IField"
import type { IStatus } from "@/utils/types/IStatus.ts"

export type WhirlpoolFields = keyof Omit<
	IWhirlpoolLog,
	"id" | "syncCode" | "extraFields" | "unsyncedChanges" | "deletedOn" | "updatedOn"
>

export type ICategory = {
	id: ULID
	name: string
	modifiedFields: { field: WhirlpoolFields; rename?: string; hidden: boolean }[]
	extraFields: IField[]
	statuses: IStatus[]
	color?: string
	syncCode?: string
	unsyncedChanges: boolean
	updatedOn: DateTime
	createdOn: DateTime
	deletedOn?: DateTime
}
