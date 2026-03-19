<script setup lang="ts">
import { DateTime } from "luxon";
import type { Category } from "@/utils/types/ICategory.ts";
import FieldEditor from "@/components/FieldEditor.vue";
import DefaultFieldEditor from "@/components/DefaultFieldEditor.vue";
import type { IField } from "@/utils/types/IField.ts";
import LoggerDatabase from "@/utils/database/LoggerDatabase.ts";
import { DatabaseStatus } from "@/utils/database/models/DatabaseStatus.ts";
import StatusEditor from "@/components/StatusEditor.vue";
import TagEditor from "@/components/TagEditor.vue";
import { TransformWhirlpoolFieldName } from "@/utils/types/Utilities.ts";
import type { ITag } from "@/utils/types/ITag.ts";
import type { IStatus } from "@/utils/types/IStatus.ts";
import { type DefaultField, DefaultFields } from "@/utils/types/DefaultFieldUtils.ts";

type CategoryEditorProps = {
	category: Category;
};

const { category } = defineProps<CategoryEditorProps>();
const editingModel = ref<Category>(category);
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

const updateDefaultField = (input: DefaultField) => {
	const fieldIndexToUpdate = editingModel.value.modifiedFields.findIndex(
		(field) => field.field === input.field
	);
	if (fieldIndexToUpdate >= 0 && editingModel.value.modifiedFields[fieldIndexToUpdate])
		editingModel.value.modifiedFields.splice(fieldIndexToUpdate, 1, input);
	else editingModel.value.modifiedFields.push(input);
};

const updateStatuses = (newStatuses: IStatus[]) => {
	editingModel.value.availableStatuses = newStatuses.slice();
};

const updateTags = (newTags: ITag[]) => {
	editingModel.value.tags = newTags.slice();
};

const updateCategory = async () => {
	// TODO: figure out what to do when user deletes fields or statuses that are attached to existing whirlpools
	await LoggerDatabase.categories.update(editingModel.value.id, {
		name: editingModel.value.name,
		modifiedFields: toRaw(editingModel.value.modifiedFields),
		extraFields: toRaw(editingModel.value.extraFields),
		displayOrder: editingModel.value.displayOrder,
		availableStatuses: editingModel.value.availableStatuses.map((status) =>
			DatabaseStatus.ConvertStatusForDatabase(status)
		),
		deletedOn: editingModel.value.deletedOn ? editingModel.value.deletedOn.toJSDate() : undefined,
		updatedOn: DateTime.now().toJSDate(),
		createdOn: editingModel.value.createdOn.toJSDate()
	});
};

watch(
	() => category,
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
					label="Display Order (lower is higher)"
					control-variant="stacked"
				/>
			</VRow>
			<VRow>
				<VCol>
					<VCard>
						<VCardTitle>Field Settings</VCardTitle>
						<VCardSubtitle>
							Here you can modify the category's default fields by renaming or hiding them. You can
							also add custom fields of your own.
						</VCardSubtitle>
						<VExpansionPanels v-model="openPanels">
							<VExpansionPanel v-for="(defaultField, index) in DefaultFields" :key="index">
								<VExpansionPanelTitle>
									{{ TransformWhirlpoolFieldName(defaultField.field) }}
									&nbsp;
									<strong>(Default Field)</strong>
								</VExpansionPanelTitle>
								<VExpansionPanelText>
									<DefaultFieldEditor
										:field-data="
											editingModel.modifiedFields.find(
												(field) => field.field === defaultField.field
											) ?? defaultField
										"
										@update-field="updateDefaultField"
									/>
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
								<VExpansionPanelTitle>Add New Custom Field</VExpansionPanelTitle>
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
						<StatusEditor
							:statuses="editingModel.availableStatuses"
							@update-statuses="updateStatuses"
						/>
					</VCard>
				</VCol>
			</VRow>
			<VRow>
				<VCol>
					<VCard>
						<VCardTitle>Tag Settings</VCardTitle>
						<VCardSubtitle>Here you can modify the tags attached to the category.</VCardSubtitle>
						<TagEditor :tags="editingModel.tags" @update-tags="updateTags" />
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
