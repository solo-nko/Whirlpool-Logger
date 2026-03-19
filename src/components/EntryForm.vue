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
import { DeepToRaw } from "@/utils/types/Utilities";

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

function GetModifiedField(input: WhirlpoolFields) {
	return props.category?.modifiedFields.find((field) => {
		return field.field === input;
	});
}

// Modified Default Fields
const statusFieldMods = computed(() => {
	if (!props.category) return null;
	return GetModifiedField("status") ? GetModifiedField("status") : null;
});

const chapterFieldMods = computed(() => {
	if (!props.category) return null;
	return GetModifiedField("chapter") ? GetModifiedField("chapter") : null;
});

const volumeFieldMods = computed(() => {
	if (!props.category) return null;
	return GetModifiedField("volume") ? GetModifiedField("volume") : null;
});

const seriesFieldMods = computed(() => {
	if (!props.category) return null;
	return GetModifiedField("series") ? GetModifiedField("series") : null;
});

const notesFieldMods = computed(() => {
	if (!props.category) return null;
	return GetModifiedField("notes") ? GetModifiedField("notes") : null;
});

const tagsFieldMods = computed(() => {
	if (!props.category) return null;
	return GetModifiedField("tags") ? GetModifiedField("tags") : null;
});

const userUpdatedFieldMods = computed(() => {
	if (!props.category) return null;
	return GetModifiedField("userUpdatedOn") ? GetModifiedField("userUpdatedOn") : null;
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
	if (isEditMode.value) await UpdateEntry();
	else await AddEntry();
};
</script>

<template>
	<VCard>
		<VCardTitle>{{ isEditMode ? "Edit Entry" : "Add Entry" }}</VCardTitle>
		<VContainer>
			<VRow>
				<VTextField v-model="entryModel.title" label="Title"></VTextField>
			</VRow>
			<VRow>
				<VAutocomplete
					v-if="statusFieldMods?.hidden !== true"
					v-model="entryModel.status"
					:label="statusFieldMods?.rename ? statusFieldMods?.rename : 'Status'"
					:items="props.category?.availableStatuses ?? []"
					item-title="name"
					return-object
				/>
			</VRow>
			<VRow class="xs:max-sm:flex-col">
				<VCol v-if="chapterFieldMods?.hidden !== true">
					<VNumberInput
						v-model="entryModel.chapter"
						:label="chapterFieldMods?.rename ? chapterFieldMods?.rename : 'Chapter'"
						control-variant="stacked"
						loading
						:min="0"
					>
						<template v-slot:loader>
							<!--							TODO: experiment with this-->
							<!-- <VProgressLinear max="50"></VProgressLinear> -->
						</template>
					</VNumberInput>
				</VCol>
				<VCol v-if="volumeFieldMods?.hidden !== true">
					<VNumberInput
						v-model="entryModel.volume"
						:label="volumeFieldMods?.rename ? volumeFieldMods?.rename : 'Volume'"
						control-variant="stacked"
						:min="0"
					/>
				</VCol>
				<VCol v-if="seriesFieldMods?.hidden !== true">
					<VTextField v-model="entryModel.series" label="Series"></VTextField>
				</VCol>
			</VRow>
			<VRow>
				<TipTapEditor v-if="notesFieldMods?.hidden !== true" v-model="entryModel.notes" />
			</VRow>
			<VRow class="xs:max-md:flex-col">
				<VCol v-if="tagsFieldMods?.hidden !== true">
					<VAutocomplete
						v-model="entryModel.tags"
						:items="availableTags"
						:label="tagsFieldMods?.rename ? tagsFieldMods?.rename : 'Tags'"
						chips
						clearable
						closable-chips
						multiple
						item-title="label"
						return-object
					>
						<template v-slot:chip="{ props, item }">
							<VChip
								v-bind="props"
								:color="item.color ? item.color : undefined"
								variant="flat"
							></VChip>
						</template>
					</VAutocomplete>
				</VCol>
				<VCol v-if="userUpdatedFieldMods?.hidden !== true">
					<VTextField
						v-model="entryModel.userUpdatedOn"
						:label="userUpdatedFieldMods?.rename ? userUpdatedFieldMods.rename : 'Last Updated'"
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
								<VTextField
									v-if="extraField.type === FieldType.TEXT"
									:label="extraField.label"
									:placeholder="extraField.placeholder"
									@update:modelValue="
										(value: unknown) => updateExtraField(value, extraField.id, extraField.type)
									"
								/>
								<VNumberInput
									v-else-if="extraField.type === FieldType.NUMBER"
									:label="extraField.label"
									@update:modelValue="
										(value: unknown) => updateExtraField(value, extraField.id, extraField.type)
									"
								/>
								<VTextField
									v-else-if="extraField.type === FieldType.DATE"
									:label="extraField.label"
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
							</VRow>
						</VExpansionPanelText>
					</VExpansionPanel>
				</VExpansionPanels>
			</VRow>
		</VContainer>
		<VCardActions>
			<VBtn @click="onClickSave">Save</VBtn>
			<VBtn v-if="isEditMode" @click="$emit('close')">Close</VBtn>
		</VCardActions>
	</VCard>
</template>

<style scoped></style>
