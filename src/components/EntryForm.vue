<script setup lang="ts">
import { DateTime } from "luxon";
import { ulid } from "ulid";
import TipTapEditor from "@/components/TipTapEditor.vue";
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
		notes: [],
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

const seriesList = computed<string[]>(() => {
	const finalList = new Set<string>();
	const initialList = whirlpoolStore.clientWhirlpools
		.filter((whirlpool) => whirlpool.categoryId === entryCategory.value?.id)
		.filter((wp) => wp.series)
		.map((wp) => wp.series ?? "");
	initialList.forEach((listItem) => finalList.add(listItem));
	return Array.from(finalList);
});

// Validation
const formValidationStatus = ref<boolean | null>(null);
const formRef = ref();

const titleRules = {
	hasValue: (value: string) => HasValue({ input: value, fieldName: "Title" }),
	maxLength: (value: string) => CheckMaxLength({ input: value, fieldName: "Title", maxLength: 100 })
};

const seriesRules = {
	maxLength: (value: string | undefined) => {
		if (value === undefined || value.length <= 50) return true;
		return "This must be 50 characters or less.";
	}
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

const editingNote = ref<Note>(new Note());

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
	editingNote.value = new Note();
}

async function OnSaveEntry(whichType: "add" | "update") {
	emits("save", whichType);
	if (syncStore.autoSyncEnabled) await syncStore.AutoSync();
}

async function AddEntry() {
	const now = DateTime.now();
	entryModel.value.notes = [editingNote.value];
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
		.then(() => {
			ResetFields();
			settingsStore.DisplayToast("Entry added!");
		});
	await OnSaveEntry("add");
}

async function UpdateEntry() {
	const now = DateTime.now();
	entryModel.value.notes = [editingNote.value];
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
		.then(() => {
			ResetFields();
			settingsStore.DisplayToast("Entry updated!");
		});
	emits("close");
	await OnSaveEntry("update");
}

const onClickSave = async () => {
	if (props.demoOnly) return;
	if (!formValidationStatus.value) {
		settingsStore.DisplayToast("A required field is missing, or a field has invalid input.");
		if (formRef.value) await formRef.value.validate();
		return;
	}
	if (isEditMode.value) await UpdateEntry();
	else await AddEntry();
	if (syncStore.autoSyncEnabled) await syncStore.AutoSync();
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
	if (props.existingEntry !== undefined && props.existingEntry.notes.length > 0) {
		const getFirstNote = props.existingEntry.notes[0];
		if (getFirstNote) editingNote.value = getFirstNote;
	}
});
</script>

<template>
	<VCard>
		<VCardTitle>{{ isEditMode ? "Edit Entry" : "Add Entry" }}</VCardTitle>
		<VForm ref="formRef" v-model="formValidationStatus">
			<VContainer>
				<VRow>
					<VTextField
						v-model="entryModel.title"
						label="Title"
						:rules="[titleRules.hasValue, titleRules.maxLength]"
						counter
					></VTextField>
				</VRow>
				<VRow class="xs:max-sm:flex-col">
					<VCol>
						<VAutocomplete
							v-if="statusFieldMods?.hidden !== true"
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
							v-if="ratingFieldMods?.hidden !== true"
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
								></VProgressLinear>
							</template>
						</VNumberInput>
					</VCol>
				</VRow>
				<VRow class="xs:max-sm:flex-col">
					<VCol v-if="chapterFieldMods?.hidden !== true">
						<VNumberInput
							v-model="entryModel.chapter"
							:label="chapterFieldMods?.rename || 'Chapter'"
							control-variant="stacked"
							:min="0"
						>
						</VNumberInput>
					</VCol>
					<VCol v-if="volumeFieldMods?.hidden !== true">
						<VNumberInput
							v-model="entryModel.volume"
							:label="volumeFieldMods?.rename || 'Volume'"
							control-variant="stacked"
							:min="0"
						/>
					</VCol>
					<VCol v-if="seriesFieldMods?.hidden !== true">
						<VCombobox
							v-model="entryModel.series"
							variant="outlined"
							:label="seriesFieldMods?.rename || 'Series'"
							:rules="[seriesRules.maxLength]"
							:items="seriesList"
							clearable
						/>
					</VCol>
				</VRow>
				<VRow>
					<TipTapEditor
						v-if="notesFieldMods?.hidden !== true"
						v-model="editingNote.content"
						content-type="html"
					/>
				</VRow>
				<VRow class="xs:max-md:flex-col">
					<VCol v-if="tagsFieldMods?.hidden !== true">
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
								<VChip
									v-bind="chipProps"
									:color="item.color ? item.color : undefined"
									variant="flat"
								></VChip>
							</template>
						</VAutocomplete>
					</VCol>
					<VCol v-if="userUpdatedFieldMods?.hidden !== true">
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
