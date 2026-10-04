import { Editor } from "@tiptap/vue-3";
import { StarterKit } from "@tiptap/starter-kit";
import type DatabaseNote from "@/utils/database/models/DatabaseNote.ts";
import { DatabaseWhirlpool } from "@/utils/database/models/DatabaseWhirlpool.ts";
import type { DatabaseCategory } from "@/utils/database/models/DatabaseCategory.ts";
import type { IField } from "@/utils/types/IField.ts";
import type { DefaultField, WhirlpoolFields } from "@/utils/DefaultFieldUtils.ts";
import { editorExtensions } from "@/components/TipTapEditor/EditorUtils.ts";

type V1Field = Omit<IField, "hideFromEntryForm"> & {
	hidden: boolean;
};

type V1Default = Omit<DefaultField, "hideInEntryForm" | "hideInTable" | "headerOrder"> & {
	hidden: boolean;
};

type V1Category = Omit<DatabaseCategory, "extraFields" | "modifiedFields"> & {
	extraFields: V1Field[];
	modifiedFields: V1Default[];
};

type V1Note = Omit<DatabaseNote, "plainContent">;

type V1Whirlpool = Omit<DatabaseWhirlpool, "notes"> & {
	notes: V1Note[];
};

export function IsDefaultFieldHiddenInTable(fieldName: WhirlpoolFields) {
	switch (fieldName) {
		case "chapter":
		case "volume":
		case "progress":
		case "notes":
			return true;
		case "rating":
		case "userUpdatedOn":

		case "tags":
		case "series":
		case "status":
			return false;
		default:
			return true;
	}
}

export function UpgradeExtraFieldFromV1(value: V1Field): IField {
	const { hidden, ...theRest } = value;
	console.log(value);
	return {
		...theRest,
		hideInEntryForm: hidden,
		hideInTable: true
	};
}

export function UpgradeDefaultFieldFromV1(value: V1Default): DefaultField {
	const { hidden, ...theRest } = value;
	console.log(value);
	return {
		...theRest,
		hideInEntryForm: hidden,
		hideInTable: IsDefaultFieldHiddenInTable(value.field)
	};
}

export function UpgradeNoteFromV1(value: V1Note): DatabaseNote {
	const editorInstance = new Editor({
		extensions: editorExtensions,
		content: value.content,
		element: null
	});

	return { ...value, plainContent: editorInstance.getText() };
}

export function UpgradeCategoryFromV1(value: V1Category): DatabaseCategory {
	return {
		...value,
		extraFields: value.extraFields.map((field) => ({
			...field,
			hideInEntryForm: field.hidden,
			hideInTable: true
		})),
		modifiedFields: value.modifiedFields.map((field) => ({
			...field,
			hideInEntryForm: field.hidden ?? false,
			hideInTable: IsDefaultFieldHiddenInTable(field.field)
		}))
	};
}

export function UpgradeWhirlpoolFromV1(value: V1Whirlpool): DatabaseWhirlpool {
	return {
		...value,
		notes: value.notes.map((note) => {
			const editorInstance = new Editor({
				extensions: [StarterKit],
				content: note.content,
				element: null
			});

			return {
				...note,
				plainContent: editorInstance.getText()
			};
		})
	};
}
