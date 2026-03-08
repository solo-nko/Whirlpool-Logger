<script setup lang="ts">
import { DateTime } from "luxon";
import type { ICategory } from "@/utils/types/ICategory.ts";
import FieldEditor from "@/components/FieldEditor.vue";
import DefaultFieldEditor from "@/components/DefaultFieldEditor.vue";
import type { IField } from "@/utils/types/IField.ts";
import LoggerDatabase from "@/utils/database/LoggerDatabase.ts";
import { DatabaseStatus } from "@/utils/database/models/DatabaseStatus.ts";
import StatusEditor from "@/components/StatusEditor.vue";

type CategoryEditorProps = {
	category: ICategory;
};

const props = defineProps<CategoryEditorProps>();
const editingModel = ref<ICategory>(props.category);
const openPanels = ref([]);
const addExtraField = (input: IField) => {
	editingModel.value.extraFields.push(input);
};

const updateExtraField = (input: IField) => {
	const fieldIndexToUpdate = editingModel.value.extraFields.findIndex(
		(field) => field.id === input.id
	);
	if (fieldIndexToUpdate >= 0) editingModel.value.extraFields.splice(fieldIndexToUpdate, 1, input);
};

const removeExtraField = (input: string) => {
	openPanels.value = [];
	const fieldIndexToUpdate = editingModel.value.extraFields.findIndex(
		(field) => field.id === input
	);
	if (fieldIndexToUpdate >= 0) editingModel.value.extraFields.splice(fieldIndexToUpdate, 1);
};

const updateCategory = async () => {
	// TODO: figure out what to do when user deletes fields or statuses that are attached to existing whirlpools
	await LoggerDatabase.categories.update(editingModel.value.id, {
		name: editingModel.value.name,
		modifiedFields: toRaw(editingModel.value.modifiedFields),
		extraFields: toRaw(editingModel.value.extraFields),
		displayOrder: editingModel.value.displayOrder,
		availableStatuses: DatabaseStatus.ConvertStatusesToDatabase(
			editingModel.value.availableStatuses
		),
		deletedOn: editingModel.value.deletedOn ? editingModel.value.deletedOn.toJSDate() : undefined,
		updatedOn: DateTime.now().toJSDate(),
		createdOn: editingModel.value.createdOn.toJSDate()
	});
};

watch(
	() => props.category,
	(newValue) => {
		if (newValue) {
			editingModel.value = { ...newValue };
		}
	}
);
</script>

<template>
	<VCard>
		<VContainer>
			<VRow>
				<VTextField v-model="editingModel.name" label="Rename Category" />
				<VNumberInput
					v-model="editingModel.displayOrder"
					type="number"
					label="Display Order"
					control-variant="stacked"
				/>
			</VRow>
			<VRow>
				<VCol>
					<VCard>
						<VCardTitle>Field Settings</VCardTitle>
						<VCardSubtitle
							>Here you can modify the category's default fields by renaming or hiding them. You can
							also add custom fields of your own.</VCardSubtitle
						>
						<VExpansionPanels v-model="openPanels">
							<VExpansionPanel
								v-for="(modifiedDefault, index) in editingModel.modifiedFields"
								:key="index"
							>
								<VExpansionPanelTitle
									>{{ modifiedDefault.field }} (Default Field)</VExpansionPanelTitle
								>
								<VExpansionPanelText>
									<DefaultFieldEditor :field-data="modifiedDefault" />
								</VExpansionPanelText>
							</VExpansionPanel>
							<VExpansionPanel v-for="field in editingModel.extraFields" :key="field.id">
								<VExpansionPanelTitle>{{ field.label }}</VExpansionPanelTitle>
								<VExpansionPanelText>
									<FieldEditor
										:field-data="field"
										@update-field="updateExtraField"
										@remove-field="removeExtraField"
									/>
								</VExpansionPanelText>
							</VExpansionPanel>
							<VExpansionPanel>
								<VExpansionPanelTitle>Add New Field</VExpansionPanelTitle>
								<VExpansionPanelText>
									<FieldEditor @add-field="addExtraField" />
								</VExpansionPanelText>
							</VExpansionPanel>
						</VExpansionPanels>
					</VCard>
				</VCol>
			</VRow>
			<VRow>
				<VCol>
					<VCard>
						<VCardTitle>Status Settings</VCardTitle>
						<VCardSubtitle
							>Here you can modify the status fields attached to the category.</VCardSubtitle
						>
						<StatusEditor :statuses="editingModel.availableStatuses" />
					</VCard>
				</VCol>
			</VRow>
		</VContainer>
		<VCardActions>
			<VBtn @click="updateCategory">Save Category</VBtn>
		</VCardActions>
	</VCard>
</template>

<style scoped></style>
