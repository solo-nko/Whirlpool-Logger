<script setup lang="ts">
import { DateTime } from "luxon";
import type { Category } from "@/utils/types/Category.ts";
import FieldEditor from "@/components/FieldEditor.vue";
import DefaultFieldEditor from "@/components/DefaultFieldEditor.vue";
import type { IEditingField, IField } from "@/utils/types/IField.ts";
import LoggerDatabase from "@/utils/database/LoggerDatabase.ts";
import { DatabaseStatus } from "@/utils/database/models/DatabaseStatus.ts";
import StatusEditor from "@/components/StatusEditor.vue";
import TagEditor from "@/components/TagEditor.vue";
import { DeepToRaw, TOAST_TIMEOUT, TransformWhirlpoolFieldName } from "@/utils/Utilities.ts";
import type { IEditingTag, ITag } from "@/utils/types/ITag.ts";
import type { IEditingStatus, IStatus } from "@/utils/types/IStatus.ts";
import { type DefaultField, DefaultFields } from "@/utils/types/DefaultFieldUtils.ts";
import useSettingsStore from "@/stores/settings.ts";
import useWhirlpoolStore from "@/stores/whirlpools.ts";

type CategoryEditorProps = {
	category: Category;
};
const settingsStore = useSettingsStore();
const whirlpoolStore = useWhirlpoolStore();

interface EditingCategory extends Category {
	availableStatuses: IEditingStatus[];
	tags: IEditingTag[];
	extraFields: IEditingField[];
}

/** Create a version of the category data just for editing within the component. */
function ConvertToEditingCategory(input: Category) {
	return {
		id: input.id,
		name: input.name,
		modifiedFields: input.modifiedFields,
		extraFields:
			input.extraFields.length > 0
				? input.extraFields.map(
						(field): IEditingField => ({ ...field, deleted: false, updated: false })
					)
				: [],
		displayOrder: input.displayOrder,
		availableStatuses:
			input.availableStatuses.length > 0
				? input.availableStatuses.map(
						(status): IEditingStatus => ({ ...status, deleted: false, updated: false })
					)
				: [],
		tags:
			input.tags.length > 0
				? input.tags.map((tag) => ({ ...tag, deleted: false, updated: false }))
				: [],
		color: input.color,
		syncCode: input.syncCode,
		unsyncedChanges: input.unsyncedChanges,
		updatedOn: input.updatedOn,
		createdOn: input.createdOn,
		deletedOn: input.deletedOn
	};
}

const { category } = defineProps<CategoryEditorProps>();
/** The model used for making edits. This will be saved to the category when the save button is pressed. */
const editingModel = ref<EditingCategory>(ConvertToEditingCategory(category));

/** Tracks which field panels are open. */
const openPanel = ref<string>();

const addExtraField = (input: IEditingField) => {
	editingModel.value.extraFields.push(input);
	settingsStore.DisplayToast("Custom field added. Save the category to save your changes.");
};

const updateExtraField = (updatedField: IEditingField) => {
	const findFieldToUpdate = editingModel.value.extraFields.find(
		(field) => field.id === updatedField.id
	);
	if (findFieldToUpdate) {
		editingModel.value.extraFields = editingModel.value.extraFields.map((field) => {
			if (field.id === findFieldToUpdate.id) return updatedField;
			return field;
		});
		settingsStore.DisplayToast("Custom fields updated. Save the category to save your changes.");
	}
};

const updateDefaultField = (input: DefaultField) => {
	const fieldIndexToUpdate = editingModel.value.modifiedFields.findIndex(
		(field) => field.field === input.field
	);
	if (fieldIndexToUpdate >= 0 && editingModel.value.modifiedFields[fieldIndexToUpdate])
		editingModel.value.modifiedFields.splice(fieldIndexToUpdate, 1, input);
	else editingModel.value.modifiedFields.push(input);
};

const updateEditingStatuses = (newStatuses: IEditingStatus[]) => {
	editingModel.value.availableStatuses = newStatuses;
	settingsStore.DisplayToast("Statuses updated. Save the category to save your changes.");
};

const updateEditingTags = (newTags: IEditingTag[]) => {
	editingModel.value.tags = newTags;
	settingsStore.DisplayToast("Tags updated. Save the category to save your changes.");
};

/** Uses the `updated` and `deleted` flags to find existing Whirlpools in the database which have those tags attached. It then either removes the tags if they've been deleted, or modifies them if they've been updated. */
async function UpdateWhirlpoolTags() {
	const deletedTags: IEditingTag[] = editingModel.value.tags.filter((tag) => tag.deleted === true);
	const updatedTags: IEditingTag[] = editingModel.value.tags.filter((tag) => tag.updated === true);
	// get whirlpools under this category
	const getClientWhirlpools = whirlpoolStore.clientWhirlpools.filter(
		(whirlpool) => whirlpool.category.id === editingModel.value.id
	);
	// find whirlpools with at least one tag that has either been deleted or modified
	const whirlpoolsWithStaleTags = getClientWhirlpools.filter((whirlpool) =>
		whirlpool.tags.some(
			(tag) =>
				deletedTags.some((deletedTag) => deletedTag.id === tag.id) ||
				updatedTags.some((updatedTag) => updatedTag.id === tag.id)
		)
	);

	// If no whirlpools exist with outdated tags, there's no point proceeding past this point.
	if (whirlpoolsWithStaleTags.length === 0) return;

	const postTagUpdateWhirlpools = whirlpoolsWithStaleTags.map((whirlpool) => {
		return {
			...whirlpool,
			tags: whirlpool.tags
				// filter out deleted tags
				.filter((tag) => !deletedTags.some((deletedTag) => deletedTag.id === tag.id))
				// modify updated tags
				.map((oldTag) => {
					const newTag = updatedTags.find((updatedTag) => updatedTag.id === oldTag.id);
					// return the new version if there is one, else return the existing version
					return newTag ? { ...newTag, updated: null } : oldTag;
				})
		};
	});

	await LoggerDatabase.whirlpools.bulkUpdate(
		postTagUpdateWhirlpools.map((whirlpool) => ({
			key: whirlpool.id,
			changes: {
				tags: DeepToRaw(whirlpool.tags)
			}
		}))
	);
}

/** Combs through whirlpools to remove statuses that have been deleted ('deleted' flag in IEditingStatus set to true) or updated ('updated' flag in IEditingStatus set to true). */
async function UpdateWhirlpoolStatuses() {
	const deletedStatuses: IEditingStatus[] = editingModel.value.availableStatuses.filter(
		(status) => status.deleted === true
	);
	const updatedStatuses: IEditingStatus[] = editingModel.value.availableStatuses.filter(
		(status) => status.updated === true
	);

	const getClientWhirlpools = whirlpoolStore.clientWhirlpools.filter(
		(whirlpool) => whirlpool.category.id === editingModel.value.id
	);

	const whirlpoolsWithStaleStatuses = getClientWhirlpools.filter(
		(whirlpool) =>
			deletedStatuses.some((status) => whirlpool.status?.id === status.id) ||
			updatedStatuses.some((status) => whirlpool.status?.id === status.id)
	);

	// skip the rest of the function if there are no whirlpools with outdated statuses
	if (whirlpoolsWithStaleStatuses.length === 0) return;

	const getNewStatus = (existingStatus: IStatus | undefined) => {
		if (existingStatus === undefined) return existingStatus;
		const findDeleted = deletedStatuses.find(
			(deletedStatus) => deletedStatus.id === existingStatus.id
		);
		if (findDeleted) return { ...existingStatus, deletedOn: DateTime.now() };
		const findUpdated = updatedStatuses.find(
			(updatedStatus) => updatedStatus.id === existingStatus.id
		);
		if (findUpdated) return findUpdated;
		return existingStatus;
	};

	const postStatusUpdateWhirlpools = whirlpoolsWithStaleStatuses.map((whirlpool) => {
		return {
			...whirlpool,
			status: getNewStatus(whirlpool.status)
		};
	});

	await LoggerDatabase.whirlpools.bulkUpdate(
		postStatusUpdateWhirlpools.map((whirlpool) => ({
			key: whirlpool.id,
			changes: {
				status: whirlpool.status
					? DatabaseStatus.ConvertStatusForDatabase(whirlpool.status)
					: undefined
			}
		}))
	);
}

async function UpdateWhirlpoolExtraFields() {
	const deletedFields: IEditingField[] = editingModel.value.extraFields.filter(
		(field) => field.deleted === true
	);

	const getClientWhirlpools = whirlpoolStore.clientWhirlpools.filter(
		(whirlpool) => whirlpool.category.id === editingModel.value.id
	);

	const whirlpoolsWithStaleFields = getClientWhirlpools.filter((whirlpool) =>
		whirlpool.extraFieldValues.some((field) =>
			deletedFields.some((deletedField) => deletedField.id === field.fieldId)
		)
	);

	if (whirlpoolsWithStaleFields.length === 0) return;

	const postFieldUpdateWhirlpools = whirlpoolsWithStaleFields.map((whirlpool) => {
		return {
			...whirlpool,
			extraFieldValues: whirlpool.extraFieldValues.filter(
				(field) => !deletedFields.some((deletedField) => deletedField.id === field.fieldId)
			)
		};
	});

	await LoggerDatabase.whirlpools.bulkUpdate(
		postFieldUpdateWhirlpools.map((whirlpool) => ({
			key: whirlpool.id,
			changes: {
				extraFieldValues: DeepToRaw(whirlpool.extraFieldValues)
			}
		}))
	);
}

const updateCategory = async () => {
	// TODO: clean up stale fields in existing whirlpools, like we currently do for statuses and tags
	try {
		// I'd actually prefer to update the whirlpools AFTER updating the category itself, but I found that in between the category update occurring and the whirlpool updates beginning, the category prop had already been refreshed. This meant the watcher below had already been triggered, and consequently the "updated/deleted" flags had already been wiped clean.
		await UpdateWhirlpoolTags();
		await UpdateWhirlpoolStatuses();
		await UpdateWhirlpoolExtraFields();
		await LoggerDatabase.categories.update(editingModel.value.id, {
			// Dexie internally uses structuredClone for its put and add operations. structuredClone can't be used on Proxies, and Vue creates Proxies of object refs to maintain reactivity. Thus, when using a ref (or reactive) that refers to an object, it is likely necessary to use DeepRaw, or Vue's provided toRaw function to pull the object out from the reactive Proxy. Otherwise, Dexie won't be able to operate on it. This should not be an issue for refs based on primitive values such as strings and numbers, which is why name and displayOrder do not need this treatment.
			name: editingModel.value.name,
			displayOrder: editingModel.value.displayOrder,
			modifiedFields: DeepToRaw(editingModel.value.modifiedFields),
			extraFields: editingModel.value.extraFields
				.filter((extraField) => extraField.deleted === false)
				.map((extraField): IField => {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const { deleted, updated, ...normalField } = extraField;
					return normalField;
				}),
			availableStatuses: editingModel.value.availableStatuses
				.filter((status) => status.deleted === false)
				.map((status): DatabaseStatus => {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const { deleted, updated, ...normalStatus } = status;
					return DatabaseStatus.ConvertStatusForDatabase(normalStatus);
				}),
			tags: editingModel.value.tags
				.filter((tag) => tag.deleted === false)
				.map((tag): ITag => {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const { deleted, updated, ...normalTag } = tag;
					return normalTag;
				}),
			deletedOn: editingModel.value.deletedOn ? editingModel.value.deletedOn.toJSDate() : undefined,
			updatedOn: DateTime.now().toJSDate(),
			createdOn: editingModel.value.createdOn.toJSDate(),
			unsyncedChanges: true
		});
		settingsStore.UpdateDashboardsTable(editingModel.value);
		settingsStore.DisplayToast("Category saved.");
	} catch (error) {
		// eslint-disable-next-line no-console
		console.log(error);
		settingsStore.DisplayToast("An error has occurred.");
	}
};

watch(
	() => category,
	(newValue) => {
		if (newValue) {
			editingModel.value = ConvertToEditingCategory(newValue);
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
						<VExpansionPanels v-model="openPanel">
							<VExpansionPanel
								v-for="(defaultField, index) in DefaultFields"
								:key="index"
								:value="`default-${defaultField.field}`"
							>
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
							<VExpansionPanel
								v-for="customField in editingModel.extraFields"
								:key="customField.id"
								:value="`custom-${customField.label}`"
							>
								<VExpansionPanelTitle>
									<s v-if="customField.deleted">{{ customField.label }}</s>
									<span v-else>{{ customField.label }}</span>
								</VExpansionPanelTitle>
								<VExpansionPanelText>
									<FieldEditor
										:field-data="customField"
										@update-field="updateExtraField"
										@remove-field="updateExtraField"
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
							>Here you can modify the status fields attached to the category. Warning: Upon saving
							the category, all deleted statuses will be removed from any whirlpools they're
							attached to.
						</VCardSubtitle>
						<StatusEditor
							:statuses="editingModel.availableStatuses"
							@update-statuses="updateEditingStatuses"
						/>
					</VCard>
				</VCol>
			</VRow>
			<VRow>
				<VCol>
					<VCard>
						<VCardTitle>Tag Settings</VCardTitle>
						<VCardSubtitle
							>Here you can modify the tags attached to the category. Warning: Upon saving the
							category, all deleted tags will be removed from any whirlpools they're attached
							to.</VCardSubtitle
						>
						<TagEditor :tags="editingModel.tags" @update-tags="updateEditingTags" />
					</VCard>
				</VCol>
			</VRow>
		</VContainer>
		<VCardActions>
			<VBtn @click="updateCategory">Save Category</VBtn>
		</VCardActions>
	</VCard>
</template>

<style scoped>
::v-deep(.v-card-subtitle) {
	white-space: wrap;
}
</style>
