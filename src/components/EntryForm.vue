<script setup lang="ts">
import { DateTime } from "luxon";
import { ulid } from "ulid";
import TipTapEditor from "@/components/TipTapEditor.vue";
import type { Category } from "@/utils/types/Category.ts";
import LoggerDatabase from "@/utils/database/LoggerDatabase.ts";
import { FieldType } from "@/utils/types/IField.ts";
import type { ITag } from "@/utils/types/ITag.ts";
import type { WhirlpoolLog } from "@/utils/types/WhirlpoolLog.ts";
import type { WhirlpoolFields } from "@/utils/types/DefaultFieldUtils";
import { DatabaseCategory } from "@/utils/database/models/DatabaseCategory.ts";
import { DatabaseStatus } from "@/utils/database/models/DatabaseStatus.ts";
import { DeepToRaw, TOAST_TIMEOUT } from "@/utils/Utilities.ts";

type EntryFormProps = {
	category: Category;
	existingEntry?: WhirlpoolLog;
	demoOnly?: boolean;
};

const props = defineProps<EntryFormProps>();
const emits = defineEmits(["close", "save"]);

function GenerateNewWhirlpool(category: Category): WhirlpoolLog {
	const now = DateTime.now();
	return {
		id: ulid(),
		title: "",
		category,
		unsyncedChanges: true,
		extraFieldValues: [],
		tags: [],
		userUpdatedOn: now.toISODate(),
		updatedOn: now,
		createdOn: now,
		deletedOn: null
	};
}

const isEditMode = computed(() => props.existingEntry !== undefined);

// Validation
const formValidationStatus = ref<boolean | null>(null);
const formRef = ref();
const validationToastDisplayed = ref<boolean>(false);
function hasValue(value: string, fieldName: string) {
	if (value) return true;
	return `${fieldName} is required.`;
}

const titleRules = {
	hasValue: (value: string) => hasValue(value, "Title"),
	maxLength: (value: string) => {
		if (value.length <= 100) return true;
		return "Please enter a title with less than 100 characters.";
	}
};

const seriesRules = {
	maxLength: (value: string | undefined) => {
		if (value === undefined || value.length <= 50) return true;
		return "This must be 50 characters or less.";
	}
};

const genericHasValue = (value: string) => hasValue(value, "This field");

function GetModifiedField(input: WhirlpoolFields) {
	return props.category?.modifiedFields.find((field) => {
		return field.field === input;
	});
}

// Modified Default Fields
const statusFieldMods = computed(() => {
	if (!props.category) return null;
	return GetModifiedField("status") || null;
});

const chapterFieldMods = computed(() => {
	if (!props.category) return null;
	return GetModifiedField("chapter") || null;
});

const volumeFieldMods = computed(() => {
	if (!props.category) return null;
	return GetModifiedField("volume") || null;
});

const seriesFieldMods = computed(() => {
	if (!props.category) return null;
	return GetModifiedField("series") || null;
});

const ratingFieldMods = computed(() => {
	if (!props.category) return null;
	return GetModifiedField("rating") || null;
});

const notesFieldMods = computed(() => {
	if (!props.category) return null;
	return GetModifiedField("notes") || null;
});

const tagsFieldMods = computed(() => {
	if (!props.category) return null;
	return GetModifiedField("tags") || null;
});

const userUpdatedFieldMods = computed(() => {
	if (!props.category) return null;
	return GetModifiedField("userUpdatedOn") || null;
});

const availableTags = computed<ITag[]>(() => {
	if (!props.category || props.category.tags.length === 0) return [];
	return props.category.tags;
});

const entryModel = ref<WhirlpoolLog>(props.existingEntry || GenerateNewWhirlpool(props.category));

const extraFields = computed(() => {
	if (!props.category || props.category.extraFields.length === 0) return null;
	return props.category.extraFields;
});

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
	entryModel.value = GenerateNewWhirlpool(props.category);
}

function OnSaveEntry(whichType: "add" | "update") {
	emits("save", whichType);
}

async function AddEntry() {
	// TODO: add field validation check
	await LoggerDatabase.whirlpools
		.add({
			...entryModel.value,
			category: DatabaseCategory.ConvertCategoryForDatabase({ input: props.category, toRaw: true }),
			status: entryModel.value.status
				? DatabaseStatus.ConvertStatusForDatabase(entryModel.value.status)
				: undefined,
			notes: toRaw(entryModel.value.notes),
			extraFieldValues: DeepToRaw(entryModel.value.extraFieldValues),
			tags: DeepToRaw(entryModel.value.tags),
			deletedOn: entryModel.value.deletedOn === null ? null : entryModel.value.deletedOn.toJSDate(),
			updatedOn: entryModel.value.updatedOn.toJSDate(),
			createdOn: entryModel.value.createdOn.toJSDate()
		})
		.then(() => {
			ResetFields();
		});
	OnSaveEntry("add");
}

async function UpdateEntry() {
	await LoggerDatabase.whirlpools
		.update(entryModel.value.id, {
			...entryModel.value,
			category: DatabaseCategory.ConvertCategoryForDatabase({ input: props.category, toRaw: true }),
			status: entryModel.value.status
				? DatabaseStatus.ConvertStatusForDatabase(entryModel.value.status)
				: undefined,
			notes: toRaw(entryModel.value.notes),
			extraFieldValues: DeepToRaw(entryModel.value.extraFieldValues),
			tags: DeepToRaw(entryModel.value.tags),
			deletedOn: entryModel.value.deletedOn === null ? null : entryModel.value.deletedOn.toJSDate(),
			updatedOn: entryModel.value.updatedOn.toJSDate(),
			createdOn: entryModel.value.createdOn.toJSDate()
		})
		.then(() => {
			ResetFields();
		});
	OnSaveEntry("update");
	emits("close");
}

const onClickSave = async () => {
	if (props.demoOnly) return;
	if (!formValidationStatus.value) {
		validationToastDisplayed.value = true;
		if (formRef.value) await formRef.value.validate();
	}
	if (isEditMode.value) await UpdateEntry();
	else await AddEntry();
};

// when manually deleting the value from this input box, the NumberInput component sets it to null. We intercept that and change it to undefined instead, to prevent any unexpected behavior later (rating is only supposed to be a number or undefined)
watch(
	() => entryModel.value.rating,
	(newRating) => {
		if (newRating === null) entryModel.value.rating = undefined;
	}
);
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
							:items="props.category?.availableStatuses ?? []"
							item-title="name"
							return-object
						/>
					</VCol>
					<VCol>
						<VNumberInput
							v-if="ratingFieldMods?.hidden !== true"
							v-model="entryModel.rating"
							:label="ratingFieldMods?.rename || 'Rating'"
							control-variant="stacked"
							:min="1"
							:max="10"
							:loading="entryModel.rating !== undefined"
						>
							<template v-slot:loader>
								<!--				TODO: experiment with usability on this (easily clickable?)	-->
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
						<VTextField
							v-model="entryModel.series"
							:label="seriesFieldMods?.rename || 'Series'"
							:rules="[seriesRules.maxLength]"
						></VTextField>
					</VCol>
				</VRow>
				<VRow>
					<TipTapEditor
						v-if="notesFieldMods?.hidden !== true"
						v-model="entryModel.notes"
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
										@update:modelValue="
											(value: unknown) => updateExtraField(value, extraField.id, extraField.type)
										"
									/>
									<VNumberInput
										v-else-if="extraField.type === FieldType.NUMBER"
										:label="extraField.label"
										:rules="extraField.required ? [genericHasValue] : []"
										control-variant="stacked"
										@update:modelValue="
											(value: unknown) => updateExtraField(value, extraField.id, extraField.type)
										"
									/>
									<VTextField
										v-else-if="extraField.type === FieldType.DATE"
										:label="extraField.label"
										:rules="extraField.required ? [genericHasValue] : []"
										type="date"
										@update:modelValue="
											(value: unknown) => updateExtraField(value, extraField.id, extraField.type)
										"
									/>
									<VCheckbox
										v-else-if="extraField.type === FieldType.BOOL"
										:label="extraField.label"
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
			<VBtn v-if="isEditMode" @click="$emit('close')">Close</VBtn>
		</VCardActions>
		<VSnackbar v-model="validationToastDisplayed" :timeout="TOAST_TIMEOUT"
			>A required field is missing, or a field has invalid input.</VSnackbar
		>
	</VCard>
</template>

<style scoped>
::v-deep(.v-progress-linear) {
	cursor: pointer;
}
</style>
