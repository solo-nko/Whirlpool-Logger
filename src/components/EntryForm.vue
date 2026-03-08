<script setup lang="ts">
import { DateTime } from "luxon";
import { ulid } from "ulid";
import TipTapEditor from "@/components/TipTapEditor.vue";
import type { ICategory } from "@/utils/types/ICategory.ts";
import type { IWhirlpoolLog } from "@/utils/types/IWhirlpoolLog.ts";
import LoggerDatabase from "@/utils/database/LoggerDatabase.ts";
import { FieldType } from "@/utils/types/IField.ts";

type EntryFormProps = {
	category?: ICategory;
	existingEntry?: IWhirlpoolLog;
	demoOnly?: boolean;
};

const props = defineProps<EntryFormProps>();
const emits = defineEmits(["close", "save"]);

const newWhirlpool: IWhirlpoolLog = {
	id: ulid(),
	title: "",
	categoryId: props.category?.id,
	unsyncedChanges: true,
	extraFieldValues: [],
	tags: [],
	updatedOn: DateTime.now(),
	createdOn: DateTime.now()
};

const isEditMode = computed(() => props.existingEntry !== undefined);
const chapterFieldMods = computed(() => {
	if (!props.category) return null;
	// TODO: can prolly turn this into a shared function
	const fieldMod = props.category.modifiedFields.find((field) => field.field === "chapter");
	if (!fieldMod) return null;
	return fieldMod;
});

const extraFields = computed(() => {
	if (!props.category || props.category.extraFields.length === 0) return null;
	return props.category.extraFields;
});
const entryModel = ref<IWhirlpoolLog>(props.existingEntry || newWhirlpool);

const setToToday = () => {
	entryModel.value.userUpdatedOn = DateTime.now().toISODate();
};

function ResetFields() {
	entryModel.value = { ...newWhirlpool, id: ulid() };
}

function OnSaveEntry(whichType: "add" | "update") {
	emits("save", whichType);
}

async function AddEntry() {
	// TODO: add field validation check
	await LoggerDatabase.whirlpools
		.add({
			...entryModel.value,
			deletedOn:
				entryModel.value.deletedOn === undefined
					? undefined
					: entryModel.value.deletedOn.toJSDate(),
			updatedOn: entryModel.value.updatedOn.toJSDate(),
			createdOn: entryModel.value.createdOn.toJSDate()
		})
		.then(() => {
			ResetFields();
		});
	OnSaveEntry("add");
}

async function UpdateEntry() {
	// TODO: This throws a clone error
	await LoggerDatabase.whirlpools
		.update(entryModel.value.id, {
			...entryModel.value,
			deletedOn:
				entryModel.value.deletedOn === undefined
					? undefined
					: entryModel.value.deletedOn.toJSDate(),
			updatedOn: entryModel.value.updatedOn.toJSDate(),
			createdOn: entryModel.value.createdOn.toJSDate()
		})
		.then(() => {
			ResetFields();
		});
	OnSaveEntry("update");
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
					v-model="entryModel.status"
					label="Status"
					:items="props.category?.availableStatuses ?? []"
					item-title="name"
					item-value="id"
				/>
			</VRow>
			<VRow>
				<VCol v-if="chapterFieldMods?.hidden !== true">
					<VNumberInput
						v-model="entryModel.chapter"
						label="Chapter"
						control-variant="stacked"
						loading
						:min="0"
					>
						<template v-slot:loader>
							<!--							TODO: experiment with this-->
							<VProgressLinear max="50"></VProgressLinear>
						</template>
					</VNumberInput>
				</VCol>
				<VCol>
					<VNumberInput
						v-model="entryModel.volume"
						label="Volume"
						control-variant="stacked"
						:min="0"
					/>
				</VCol>
				<VCol>
					<VTextField v-model="entryModel.series" label="Series"></VTextField>
				</VCol>
			</VRow>
			<VRow>
				<TipTapEditor v-model="entryModel.notes" />
			</VRow>
			<VRow>
				<VTextField v-model="entryModel.userUpdatedOn" label="Last Updated" type="date">
					<template v-slot:append>
						<VBtn @click="setToToday">Today</VBtn>
					</template>
				</VTextField>
			</VRow>
			<VRow v-if="extraFields">
				<VExpansionPanels v-for="extraField in extraFields" :key="extraField.id">
					<VExpansionPanel :title="extraField.label">
						<VExpansionPanelText>
							<VTextField
								v-if="extraField.type === FieldType.TEXT"
								:label="extraField.label"
								:placeholder="extraField.placeholder"
							/>
							<VNumberInput
								v-else-if="extraField.type === FieldType.NUMBER"
								:label="extraField.label"
							/>
							<VTextField
								v-else-if="extraField.type === FieldType.DATE"
								:label="extraField.label"
								type="date"
							/>
							<VCheckbox v-else-if="extraField.type === FieldType.BOOL" :label="extraField.label" />
						</VExpansionPanelText>
					</VExpansionPanel>
				</VExpansionPanels>
			</VRow>
		</VContainer>
		<VCardActions>
			<VBtn @click="onClickSave">Save</VBtn>
			<VBtn v-if="isEditMode" @click="emits('close')">Cancel</VBtn>
		</VCardActions>
	</VCard>
</template>

<style scoped></style>
