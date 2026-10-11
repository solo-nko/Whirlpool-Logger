<script setup lang="ts">
import { DateTime } from "luxon";
import { ulid } from "ulid";
import Fuse from "fuse.js";
import TipTapEditor from "@/components/TipTapEditor/TipTapEditor.vue";
import LoggerDatabase from "@/utils/database/LoggerDatabase.ts";
import { FieldType } from "@/utils/types/IField.ts";
import type { ITag } from "@/utils/types/ITag.ts";
import type { WhirlpoolLog } from "@/utils/types/WhirlpoolLog.ts";
import type { WhirlpoolFields } from "@/utils/DefaultFieldUtils.ts";
import { DatabaseStatus } from "@/utils/database/models/DatabaseStatus.ts";
import { CheckMaxLength, DeepToRaw, HasValue } from "@/utils/MiscUtils.ts";
import useSettingsStore from "@/stores/settings";
import useCategoriesStore from "@/stores/categories.ts";
import useSyncStore from "@/stores/sync.ts";
import DatabaseNote from "@/utils/database/models/DatabaseNote.ts";
import Note from "@/utils/types/Note.ts";
import useWhirlpoolStore from "@/stores/whirlpools.ts";
import AccordionContainer from "@/components/common/accordion/AccordionContainer.vue";
import AccordionPanel from "@/components/common/accordion/AccordionPanel.vue";

type EntryFormProps = {
	/** Id of the category this whirlpool belongs to. */
	categoryId: string;
	/** If this component is being used to edit an existing entry, pass that entry information to this prop. The entry's category ID must match the value given to the categoryId prop, or there will be problems. */
	existingEntry?: WhirlpoolLog;
	demoOnly?: boolean;
};

const settingsStore = useSettingsStore();
const categoryStore = useCategoriesStore();
const whirlpoolStore = useWhirlpoolStore();
const syncStore = useSyncStore();

const props = defineProps<EntryFormProps>();
const emits = defineEmits(["close", "save"]);

function GenerateNewWhirlpool(categoryId: string): WhirlpoolLog {
	const now = DateTime.now();
	return {
		id: ulid(),
		title: "",
		categoryId,
		notes: [new Note()],
		unsyncedChanges: true,
		extraFieldValues: [],
		tags: [],
		userUpdatedOn: now.toISODate(),
		updatedOn: now,
		createdOn: now,
		deletedOn: null,
		syncCode: syncStore.syncCode ?? undefined
	};
}

const entryCategory = computed(() =>
	categoryStore.clientCategories.find((category) => category.id === props.categoryId)
);
const isEditMode = computed(() => props.existingEntry !== undefined);
const showCloseButton = computed(() => isEditMode.value);
const statusDescription = computed(() => {
	if (entryCategory.value === undefined) return undefined;
	if (entryModel.value.status) return entryModel.value.status.description ?? undefined;
});

// Suggest series from existing whirlpools to help with consistent data entry
const seriesFuse = computed(
	() =>
		new Fuse(whirlpoolStore.clientWhirlpools, {
			keys: ["series"],
			includeMatches: true,
			minMatchCharLength: 3
		})
);
const seriesCandidates = computed(() => {
	if (!entryModel.value.series || entryModel.value.series.trim() === "") return [];
	const initialList = seriesFuse.value
		.search(entryModel.value.series)
		// filter out data from other categories
		.filter((result) => result.item.series && result.item.categoryId === entryCategory.value?.id)
		.map((secondResult) => secondResult.item.series);
	return Array.from(new Set(initialList));
});

// Suggest titles from existing whirlpools to remind the user if they've already created an entry for a given piece of media.
const titleFuse = computed(
	() =>
		new Fuse(whirlpoolStore.clientWhirlpools, {
			keys: ["title"],
			includeMatches: true,
			minMatchCharLength: 3
		})
);
const titleCandidates = computed(() => {
	if (!entryModel.value.title || entryModel.value.title.trim() === "") return [];
	return titleFuse.value
		.search(entryModel.value.title)
		.filter((result) => result.item.categoryId === entryCategory.value?.id)
		.map((secondResult) => secondResult.item.title);
});

// Validation
const formRef = ref();

const titleRules = {
	hasValue: (value: string | null | undefined) =>
		HasValue({ input: value ?? "", fieldName: "Title" }),
	checkLength: (value: string | null | undefined) =>
		CheckMaxLength({ input: value ?? "", fieldName: "Title", maxLength: titleRules.maxLength }),
	maxLength: 100
};

const seriesRules = {
	checkLength: (value: string | null | undefined) => {
		if (!value || value.length <= seriesRules.maxLength) return true;
		return "This must be 50 characters or less.";
	},
	maxLength: 50
};

const genericHasValue = (value: string) => HasValue({ input: value, fieldName: "This field" });

function GetModifiedField(input: WhirlpoolFields) {
	if (entryCategory.value === undefined) return undefined;
	return entryCategory.value.modifiedFields.find((field) => {
		return field.field === input;
	});
}

// Modified Default Fields
const statusFieldMods = computed(() => {
	if (!entryCategory.value) return null;
	return GetModifiedField("status") || null;
});

const chapterFieldMods = computed(() => {
	if (!entryCategory.value) return null;
	return GetModifiedField("chapter") || null;
});

const volumeFieldMods = computed(() => {
	if (!entryCategory.value) return null;
	return GetModifiedField("volume") || null;
});

const seriesFieldMods = computed(() => {
	if (!entryCategory.value) return null;
	return GetModifiedField("series") || null;
});

const ratingFieldMods = computed(() => {
	if (!entryCategory.value) return null;
	return GetModifiedField("rating") || null;
});

const progressFieldMods = computed(() => {
	if (!entryCategory.value) return null;
	return GetModifiedField("progress") || null;
});

const notesFieldMods = computed(() => {
	if (!entryCategory.value) return null;
	return GetModifiedField("notes") || null;
});

const tagsFieldMods = computed(() => {
	if (!entryCategory.value) return null;
	return GetModifiedField("tags") || null;
});

const userUpdatedFieldMods = computed(() => {
	if (!entryCategory.value) return null;
	return GetModifiedField("userUpdatedOn") || null;
});

const availableTags = computed<ITag[]>(() => {
	if (!entryCategory.value || entryCategory.value.tags.length === 0) return [];
	return entryCategory.value.tags;
});

// somewhat annoying thing with Vue refs is that in the case of objects, if you pass props to them directly, they will take the reference value, which leads to them mutating the props.
const entryModel = ref<WhirlpoolLog>(
	props.existingEntry ? { ...props.existingEntry } : GenerateNewWhirlpool(props.categoryId)
);

const extraFields = computed(() => {
	if (!entryCategory.value || entryCategory.value.extraFields.length === 0) return null;
	return entryCategory.value.extraFields;
});

/** Searches through the whirlpool for a FieldValue that matches the given Field ID and gets the value attached to it */
const getExtraFieldValue = (fieldId: string) => {
	return entryModel.value.extraFieldValues.find((fieldValue) => fieldValue.fieldId === fieldId);
};

/** Assigns a new value to the FieldValue associated with the given Field ID on the whirlpool. */
const updateExtraField = (value: unknown, fieldId: string, fieldType: FieldType) => {
	const indexToUpdate = entryModel.value.extraFieldValues.findIndex(
		(value) => value.fieldId === fieldId
	);
	if (indexToUpdate === -1) {
		entryModel.value.extraFieldValues.push({ fieldId, value, fieldType });
	} else if (entryModel.value.extraFieldValues[indexToUpdate] !== undefined) {
		entryModel.value.extraFieldValues[indexToUpdate].value = value;
	}
};

const setToToday = () => {
	entryModel.value.userUpdatedOn = DateTime.now().toISODate();
};

function ResetFields() {
	if (entryCategory.value === undefined) return;
	entryModel.value = GenerateNewWhirlpool(props.categoryId);
}

async function OnSaveEntry(whichType: "add" | "update") {
	emits("save", whichType);
	if (syncStore.autoSyncEnabled) await syncStore.AutoSync();
}

async function AddEntry() {
	const now = DateTime.now();
	await LoggerDatabase.whirlpools
		.add({
			...entryModel.value,
			categoryId: entryModel.value.categoryId,
			status: entryModel.value.status
				? DatabaseStatus.ConvertStatusForDatabase(entryModel.value.status)
				: undefined,
			notes: entryModel.value.notes
				? entryModel.value.notes.map((entryNote) => DatabaseNote.ConvertNoteToDatabase(entryNote))
				: [],
			extraFieldValues: DeepToRaw(entryModel.value.extraFieldValues),
			tags: DeepToRaw(entryModel.value.tags),
			deletedOn: entryModel.value.deletedOn === null ? null : entryModel.value.deletedOn.toISO(),
			updatedOn: now.toISO(),
			createdOn: now.toISO(),
			unsyncedChanges: true
		})
		.catch((error) => {
			console.log(error);
			settingsStore.DisplayToast("An error occurred while saving the entry.");
		})
		.then(() => {
			ResetFields();
			settingsStore.DisplayToast("Entry added!");
		});
	await OnSaveEntry("add");
}

async function UpdateEntry() {
	const now = DateTime.now();
	await LoggerDatabase.whirlpools
		.update(entryModel.value.id, {
			...entryModel.value,
			categoryId: entryCategory.value?.id || props.categoryId,
			status: entryModel.value.status
				? DatabaseStatus.ConvertStatusForDatabase(entryModel.value.status)
				: undefined,
			notes: entryModel.value.notes
				? entryModel.value.notes.map((entryNote) => DatabaseNote.ConvertNoteToDatabase(entryNote))
				: [],
			extraFieldValues: DeepToRaw(entryModel.value.extraFieldValues),
			tags: DeepToRaw(entryModel.value.tags),
			deletedOn: entryModel.value.deletedOn === null ? null : entryModel.value.deletedOn.toISO(),
			updatedOn: now.toISO(),
			createdOn: entryModel.value.createdOn.toISO() ?? "unknown",
			unsyncedChanges: true
		})
		.catch((error) => {
			console.log(error);
			settingsStore.DisplayToast("An error occurred while saving the entry.");
		})
		.then(() => {
			ResetFields();
			settingsStore.DisplayToast("Entry updated!");
		});
	emits("close");
	await OnSaveEntry("update");
}

const onClickSave = async () => {
	if (props.demoOnly) return;
	const { valid } = await formRef.value?.validate();
	if (!valid) {
		settingsStore.DisplayToast("A required field is missing, or a field has invalid input.");
		return;
	}
	if (isEditMode.value) await UpdateEntry();
	else await AddEntry();
};

const onSaveNoteTitle = (noteId: number, newTitle: string) => {
	const editedIndex = entryModel.value.notes.findIndex((note) => note.id === noteId);
	if (entryModel.value.notes[editedIndex]) {
		entryModel.value.notes[editedIndex].title = newTitle;
	}
};

const getLatestUpdatedNote = computed((): Note | undefined => {
	const notes = entryModel.value.notes;
	if (notes === undefined || notes.length === 0) {
		return undefined;
	}

	return entryModel.value.notes.reduce((note1, note2) => {
		return note1.updatedOn > note2.updatedOn ? note1 : note2;
	});
});

const onAddNewNote = (noteIndex: number) => {
	entryModel.value.notes = entryModel.value.notes.toSpliced(noteIndex + 1, 0, new Note());
};

const onDeleteSelectedNote = (noteIndex: number) => {
	entryModel.value.notes = entryModel.value.notes.toSpliced(noteIndex, 1);
};

// when manually deleting the value from this input box, the NumberInput component sets it to null. We intercept that and change it to undefined instead, to prevent any unexpected behavior later (rating is only supposed to be a number or undefined)
watch(
	() => entryModel.value.rating,
	(newRating) => {
		if (newRating === null) entryModel.value.rating = undefined;
	}
);

onMounted(() => {
	if (props.existingEntry !== undefined && props.existingEntry.categoryId !== props.categoryId) {
		settingsStore.DisplayToast(
			"There is a mismatch between the loaded whirlpool and the indicated whirlpool category. Upon saving, the whirlpool's category will be forcibly updated to correct this."
		);
	}
});
</script>

<template>
	<VCard>
		<VCardTitle>{{ isEditMode ? "Edit Entry" : "Add Entry" }}</VCardTitle>
		<VForm ref="formRef">
			<VContainer>
				<VRow>
					<VCol>
						<VCombobox
							v-model="entryModel.title"
							label="Title"
							:rules="[titleRules.hasValue, titleRules.checkLength]"
							:counter="titleRules.maxLength"
							:items="titleCandidates"
							clearable
							variant="outlined"
						/>
					</VCol>
				</VRow>
				<VRow class="xs:max-sm:flex-col">
					<VCol>
						<VAutocomplete
							v-if="statusFieldMods?.hideInEntryForm !== true"
							v-model="entryModel.status"
							:label="statusFieldMods?.rename || 'Status'"
							:items="entryCategory?.availableStatuses ?? []"
							item-title="name"
							:messages="statusDescription"
							return-object
							:no-data-text="'No statuses available. Create some in Settings.'"
						/>
					</VCol>
					<VCol>
						<VNumberInput
							v-if="ratingFieldMods?.hideInEntryForm !== true"
							v-model="entryModel.rating"
							:label="ratingFieldMods?.rename || 'Rating'"
							control-variant="split"
							:min="1"
							:max="10"
							:loading="entryModel.rating !== undefined"
						>
							<template v-slot:loader>
								<VProgressLinear
									v-if="entryModel.rating"
									v-model="entryModel.rating"
									max="10"
									chunk-count="10"
									height="10"
									clickable
									role="menu"
								/>
							</template>
						</VNumberInput>
					</VCol>
				</VRow>
				<VRow class="xs:max-sm:flex-col">
					<VCol v-if="chapterFieldMods?.hideInEntryForm !== true">
						<VNumberInput
							v-model="entryModel.chapter"
							:label="chapterFieldMods?.rename || 'Chapter'"
							control-variant="stacked"
							:min="0"
						>
						</VNumberInput>
					</VCol>
					<VCol v-if="volumeFieldMods?.hideInEntryForm !== true">
						<VNumberInput
							v-model="entryModel.volume"
							:label="volumeFieldMods?.rename || 'Volume'"
							control-variant="stacked"
							:min="0"
						/>
					</VCol>
					<VCol v-if="seriesFieldMods?.hideInEntryForm !== true">
						<VCombobox
							v-model="entryModel.series"
							variant="outlined"
							:label="seriesFieldMods?.rename || 'Series'"
							:rules="[seriesRules.checkLength]"
							:counter="seriesRules.maxLength"
							:items="seriesCandidates"
							clearable
						/>
					</VCol>
				</VRow>
				<VRow v-if="progressFieldMods?.hideInEntryForm !== true">
					<VCol>
						<VTextField
							v-model="entryModel.progress"
							:label="progressFieldMods?.rename || 'Progress'"
						/>
					</VCol>
				</VRow>
				<VRow v-if="notesFieldMods?.hideInEntryForm !== true">
					<VCol class="w-full">
						<VLabel>Notes</VLabel>
						<AccordionContainer
							:multi-open="false"
							:default-open-panels="getLatestUpdatedNote ? [getLatestUpdatedNote.id] : []"
						>
							<AccordionPanel
								v-for="(note, index) in entryModel.notes"
								:key="note.id"
								:title="note.title ?? note.updatedOn.toLocaleString()"
								:value="note.id"
								:actions="[
									{
										showAction: true,
										actionText: 'Add Below',
										onClickAction: () => onAddNewNote(index)
									},
									{
										showAction: entryModel.notes.length > 1,
										actionText: 'Delete',
										onClickAction: () => onDeleteSelectedNote(index),
										confirmText: 'Really?'
									}
								]"
								@update-title="(newTitle: string) => onSaveNoteTitle(note.id, newTitle)"
							>
								<TipTapEditor
									v-model="note.content"
									content-type="html"
									@update:model-value="() => (note.updatedOn = DateTime.now())"
								/>
							</AccordionPanel>
						</AccordionContainer>
					</VCol>
				</VRow>
				<VRow class="xs:max-md:flex-col">
					<VCol v-if="tagsFieldMods?.hideInEntryForm !== true">
						<VAutocomplete
							v-model="entryModel.tags"
							:items="availableTags"
							:label="tagsFieldMods?.rename || 'Tags'"
							chips
							clearable
							closable-chips
							multiple
							item-title="label"
							return-object
							no-data-text="No tags available. Create some in Category Settings."
						>
							<template v-slot:chip="{ props: chipProps, item }">
								<VChip v-bind="chipProps" :color="item.color ?? undefined" variant="flat" />
							</template>
						</VAutocomplete>
					</VCol>
					<VCol v-if="userUpdatedFieldMods?.hideInEntryForm !== true">
						<VTextField
							v-model="entryModel.userUpdatedOn"
							:label="userUpdatedFieldMods?.rename || 'Last Updated'"
							type="date"
						>
							<template v-slot:append>
								<VBtn @click="setToToday">Today</VBtn>
							</template>
						</VTextField>
					</VCol>
				</VRow>
				<VRow v-if="extraFields" class="mt-0">
					<VExpansionPanels>
						<VExpansionPanel>
							<VExpansionPanelTitle>Other Fields</VExpansionPanelTitle>
							<VExpansionPanelText>
								<VRow
									v-for="extraField in extraFields"
									:key="extraField.id"
									:title="extraField.label"
								>
									<!-- eslint-disable		vue/v-on-event-hyphenation-->
									<!-- the @update:model-value event only works with camelCase -->
									<VTextField
										v-if="extraField.type === FieldType.TEXT"
										:label="extraField.label"
										:placeholder="extraField.placeholder"
										:rules="extraField.required ? [genericHasValue] : []"
										:model-value="(getExtraFieldValue(extraField.id)?.value as string) || undefined"
										@update:modelValue="
											(value: unknown) => updateExtraField(value, extraField.id, extraField.type)
										"
									/>
									<VNumberInput
										v-else-if="extraField.type === FieldType.NUMBER"
										:label="extraField.label"
										:rules="extraField.required ? [genericHasValue] : []"
										control-variant="stacked"
										:model-value="(getExtraFieldValue(extraField.id)?.value as number) || undefined"
										@update:modelValue="
											(value: unknown) => updateExtraField(value, extraField.id, extraField.type)
										"
									/>
									<VTextField
										v-else-if="extraField.type === FieldType.DATE"
										:label="extraField.label"
										:rules="extraField.required ? [genericHasValue] : []"
										type="date"
										:model-value="(getExtraFieldValue(extraField.id)?.value as string) || undefined"
										@update:modelValue="
											(value: unknown) => updateExtraField(value, extraField.id, extraField.type)
										"
									/>
									<VCheckbox
										v-else-if="extraField.type === FieldType.BOOL"
										:label="extraField.label"
										:model-value="
											(getExtraFieldValue(extraField.id)?.value as boolean) || undefined
										"
										@update:modelValue="
											(value: unknown) => updateExtraField(value, extraField.id, extraField.type)
										"
									/>
									<!-- eslint-enable		vue/v-on-event-hyphenation-->
								</VRow>
							</VExpansionPanelText>
						</VExpansionPanel>
					</VExpansionPanels>
				</VRow>
			</VContainer>
		</VForm>
		<VCardActions>
			<VBtn @click="onClickSave">Save</VBtn>
			<VBtn v-if="showCloseButton" @click="$emit('close')">Close</VBtn>
		</VCardActions>
	</VCard>
</template>

<style scoped>
::v-deep(.v-progress-linear) {
	cursor: pointer;
}

::v-deep(.v-number-input--split) {
	font-weight: bold;
}
</style>
